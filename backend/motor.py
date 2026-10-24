"""
Motor de transacciones concurrentes + detector de interbloqueos.

- Hilos REALES del SO (threading.Thread), verificables con ps -eLf o /proc/self/task.
- Un threading.Lock por cuenta protege cada transferencia (exclusion mutua).
- Modo "sin proteccion": el MISMO codigo de transferencia pero sin locks, para provocar
  y demostrar una condicion de carrera real (la suma de saldos se descuadra).
- Hilo guardian: construye el grafo de espera leyendo el estado REAL de los locks
  (quien tiene cada lock y quien espera cada lock), busca ciclos con DFS y recupera
  abortando a una victima (liberacion forzada de sus locks).
- La transaccion abortada NO se pierde: se reintenta (respaldo).
- Integridad: la suma de todos los saldos debe permanecer constante.
"""
import os
import random
import subprocess
import threading
import time
from collections import deque

N_CUENTAS = 5
SALDO_INICIAL = 1000
FASE_NORMAL_S = 5   # en modo forzado, segundos de operacion normal antes de forzar el deadlock


class Abortar(Exception):
    """Se lanza dentro de un hilo victima para que libere sus locks."""


class Cuenta:
    def __init__(self, id_):
        self.id = id_
        self.saldo = SALDO_INICIAL
        self.lock = threading.Lock()


# ---------------------------------------------------------------------------
# Evidencia de hilos reales del sistema operativo
# ---------------------------------------------------------------------------
def hilos_so():
    """Hilos reales del proceso del servidor, leidos de /proc/self/task (Linux)."""
    ruta = '/proc/self/task'
    try:
        lista = []
        for tid in sorted(int(t) for t in os.listdir(ruta)):
            try:
                with open(f'{ruta}/{tid}/comm') as f:
                    nombre = f.read().strip()
            except OSError:
                nombre = '?'
            lista.append({'tid': tid, 'nombre': nombre})
        return {'pid': os.getpid(), 'total': len(lista), 'hilos': lista,
                'fuente': '/proc/self/task'}
    except OSError:
        lista = [{'tid': t.native_id, 'nombre': t.name} for t in threading.enumerate()]
        return {'pid': os.getpid(), 'total': len(lista), 'hilos': lista,
                'fuente': 'threading.enumerate (no es Linux)'}


def _ejecutar_ps(args):
    """Ejecuta ps y deja solo el encabezado y las filas (hilos) de ESTE proceso."""
    pid = str(os.getpid())
    try:
        r = subprocess.run(args, capture_output=True, text=True, timeout=3)
    except (OSError, subprocess.SubprocessError):
        return None
    lineas = r.stdout.splitlines()
    if r.returncode != 0 or not lineas:
        return None
    sel = [lineas[0]]
    for linea in lineas[1:]:
        cols = linea.split()
        if pid in cols[:2]:          # PID es la 1.a columna (-o pid,...) o la 2.a (-f)
            sel.append(linea)
    return '\n'.join(sel)


def ps_hilos():
    """Salida REAL de ps -eLf (y de ps con nombres de hilo) filtrada al proceso del servidor."""
    pid = os.getpid()
    completo = _ejecutar_ps(['ps', '-eLf'])
    nombres = _ejecutar_ps(['ps', '-eLo', 'pid,lwp,nlwp,stat,comm'])
    if completo is None:
        # ps no esta instalado en este servidor: se arma una tabla equivalente desde /proc
        filas = ['PID      LWP  STAT  COMM   (generado desde /proc/self/task porque ps no esta disponible)']
        try:
            for tid in sorted(int(t) for t in os.listdir('/proc/self/task')):
                with open(f'/proc/self/task/{tid}/stat') as f:
                    s = f.read()
                comm = s[s.index('(') + 1:s.rindex(')')]
                estado = s[s.rindex(')') + 2:].split()[0]
                filas.append(f'{pid:<8} {tid:<4} {estado:<5} {comm}')
        except OSError:
            filas.append('/proc no disponible')
        return {'pid': pid, 'fuente': '/proc (ps no disponible)',
                'ps_eLf': '\n'.join(filas), 'ps_nombres': ''}
    return {'pid': pid, 'fuente': 'ps (comando real del sistema operativo)',
            'ps_eLf': completo, 'ps_nombres': nombres or ''}


# ---------------------------------------------------------------------------
# Deteccion de ciclos (DFS)
# ---------------------------------------------------------------------------
def buscar_ciclo(grafo):
    """DFS con colores sobre un grafo {nodo: [vecinos]}. Devuelve la lista del ciclo o None."""
    color = {}   # 1 = en la pila actual, 2 = terminado
    pila = []

    def visitar(u):
        color[u] = 1
        pila.append(u)
        for v in grafo.get(u, []):
            if color.get(v, 0) == 0:
                r = visitar(v)
                if r:
                    return r
            elif color.get(v) == 1:
                return pila[pila.index(v):]
        pila.pop()
        color[u] = 2
        return None

    for nodo in list(grafo):
        if color.get(nodo, 0) == 0:
            r = visitar(nodo)
            if r:
                return r
    return None


class Motor:
    def __init__(self, forzado=False, sin_proteccion=False):
        self.forzado = forzado
        self.sin_proteccion = sin_proteccion
        self.cuentas = [Cuenta(i) for i in range(N_CUENTAS)]
        self.n_hilos = 2 if forzado else 4
        self._m = threading.Lock()        # protege dueno, espera y contadores
        self._lev = threading.Lock()
        self.dueno = {}                   # id cuenta -> hilo que tiene su lock
        self.espera = {}                  # hilo -> id cuenta que esta esperando
        self.tids = {}
        self._abortar = set()
        self._parar = threading.Event()
        self._barrera = threading.Barrier(2, timeout=1.0)
        self.hilos = []
        self.completadas = 0
        self.rechazadas = 0
        self.abortadas = 0
        self.reintentadas = 0
        self.deadlocks = 0
        self.eventos = deque(maxlen=40)
        self.ciclo = []
        self._t_recup = 0
        self._ult_saldos = [SALDO_INICIAL] * N_CUENTAS
        self.t0 = time.time()

    # ---------- utilidades ----------
    def _log(self, tipo, msg):
        with self._lev:
            self.eventos.append({'t': round(time.time() - self.t0, 1), 'tipo': tipo, 'msg': msg})

    def _fase_deadlock(self):
        return self.forzado and (time.time() - self.t0) > FASE_NORMAL_S

    # ---------- ciclo de vida ----------
    def iniciar(self):
        self.t0 = time.time()
        if self.sin_proteccion:
            modo = 'SIN PROTECCION (condicion de carrera)'
        elif self.forzado:
            modo = 'forzado (deadlock inyectado)'
        else:
            modo = 'natural'
        self._log('normal', f'Motor iniciado en modo {modo}')
        for i in range(self.n_hilos):
            h = threading.Thread(target=self._worker, args=(f'T{i}', i), name=f'T{i}', daemon=True)
            self.hilos.append(h)
            h.start()
        if not self.sin_proteccion:
            g = threading.Thread(target=self._guardian, name='Guardian', daemon=True)
            self.hilos.append(g)
            g.start()

    def detener(self):
        self._parar.set()
        try:
            self._barrera.abort()
        except Exception:
            pass
        for h in self.hilos:
            h.join(timeout=1.0)

    # ---------- locks con seguimiento ----------
    def _adquirir(self, nombre, cuenta):
        with self._m:
            self.espera[nombre] = cuenta.id
        try:
            while not cuenta.lock.acquire(timeout=0.05):
                if self._parar.is_set() or nombre in self._abortar:
                    raise Abortar()
            with self._m:
                self.dueno[cuenta.id] = nombre
        finally:
            with self._m:
                self.espera.pop(nombre, None)

    def _liberar(self, nombre, cuenta):
        with self._m:
            self.dueno.pop(cuenta.id, None)
        cuenta.lock.release()

    # ---------- seccion critica ----------
    def _mover_dinero(self, a, b, monto):
        """SECCION CRITICA. Es identica con y sin proteccion; la unica diferencia es si el
        hilo tiene los locks de las dos cuentas. time.sleep(0) cede la CPU entre leer y
        escribir (lectura-modificacion-escritura), lo que hace visible la carrera."""
        origen, destino = self.cuentas[a], self.cuentas[b]
        if origen.saldo < monto:
            return False
        s = origen.saldo
        time.sleep(0)
        origen.saldo = s - monto
        t = destino.saldo
        time.sleep(0)
        destino.saldo = t + monto
        return True

    # ---------- transacciones ----------
    def _transferir(self, nombre, a, b, monto, primero, segundo, forzar):
        if self.sin_proteccion:
            ok = self._mover_dinero(a, b, monto)      # sin locks: condicion de carrera
            with self._m:
                if ok:
                    self.completadas += 1
                else:
                    self.rechazadas += 1
            return
        p, s = self.cuentas[primero], self.cuentas[segundo]
        self._adquirir(nombre, p)
        try:
            if forzar:
                # Los dos hilos retienen su primer lock antes de pedir el segundo
                # (retener y esperar + espera circular), sin usar sleep.
                try:
                    self._barrera.wait()
                except threading.BrokenBarrierError:
                    try:
                        self._barrera.reset()
                    except Exception:
                        pass
            else:
                time.sleep(random.uniform(0.002, 0.02))   # tiempo de trabajo con el primer lock
            self._adquirir(nombre, s)
            try:
                ok = self._mover_dinero(a, b, monto)
                with self._m:
                    if ok:
                        self.completadas += 1
                    else:
                        self.rechazadas += 1
            finally:
                self._liberar(nombre, s)
        finally:
            self._liberar(nombre, p)

    def _worker(self, nombre, idx):
        self.tids[nombre] = threading.get_native_id()
        pendiente = None
        while not self._parar.is_set():
            forzar = self._fase_deadlock()
            if pendiente:
                a, b, monto = pendiente
                pendiente = None
                with self._m:
                    self.reintentadas += 1
            else:
                if self.forzado:
                    a, b = (0, 1) if idx % 2 == 0 else (1, 0)
                else:
                    a, b = random.sample(range(N_CUENTAS), 2)
                monto = random.randint(1, 100)
            if self.forzado and not forzar:
                primero, segundo = sorted((a, b))     # orden global: sin deadlock
            else:
                primero, segundo = a, b               # orden libre: puede haber ciclo
            try:
                self._transferir(nombre, a, b, monto, primero, segundo, forzar)
            except Abortar:
                if self._parar.is_set():
                    break
                pendiente = (a, b, monto)
                with self._m:
                    self.abortadas += 1
                    self._abortar.discard(nombre)
                self._log('recuperacion', f'{nombre} abortado y locks liberados; su transferencia '
                                          f'C{a}->C{b} (${monto}) se reintentara')
                time.sleep(random.uniform(0.05, 0.2))
                continue
            if self.sin_proteccion:
                time.sleep(0.0005)
            else:
                time.sleep(1.5 if forzar else random.uniform(0.01, 0.05))

    # ---------- guardian: RAG + DFS + recuperacion ----------
    def _grafo_espera(self):
        with self._m:
            g = {}
            for h, c in self.espera.items():
                d = self.dueno.get(c)
                if d and d != h:
                    g.setdefault(h, []).append(d)
            return g

    def _guardian(self):
        while not self._parar.wait(0.2):
            ciclo = buscar_ciclo(self._grafo_espera())
            if ciclo:
                if self.ciclo and set(ciclo) == set(self.ciclo):
                    # el mismo ciclo en dos revisiones seguidas: deadlock confirmado
                    victima = random.choice(ciclo)
                    with self._m:
                        self.deadlocks += 1
                        self._abortar.add(victima)
                    self._log('deteccion', 'Ciclo detectado (DFS): ' + ' -> '.join(ciclo + [ciclo[0]]))
                    self._log('recuperacion', f'Liberacion forzada: se aborta a {victima}')
                    time.sleep(0.5)
                else:
                    self.ciclo = ciclo
                    self._log('deadlock', 'Hilos bloqueados esperandose entre si: ' + ', '.join(ciclo))
            elif self.ciclo:
                self.ciclo = []
                self._t_recup = time.time()
                self._log('normal', 'Ciclo resuelto: el sistema continua')

    # ---------- auditoria de saldos ----------
    def _auditar(self):
        """Lectura consistente de los saldos. Con proteccion se toman los locks de TODAS las
        cuentas (en orden de id y con timeout, sin registrarse en el RAG): mientras se tienen
        no puede haber ninguna transferencia a medias, asi que la suma es exacta. Si no se
        consiguen (por ejemplo, durante un deadlock) se conserva la ultima lectura exacta."""
        if self.sin_proteccion:
            return [c.saldo for c in self.cuentas]     # lectura sin locks: refleja la carrera
        tomados = []
        try:
            for c in self.cuentas:
                if not c.lock.acquire(timeout=0.1):
                    return None
                tomados.append(c)
            return [c.saldo for c in self.cuentas]
        finally:
            for c in reversed(tomados):
                c.lock.release()

    # ---------- estado para la API ----------
    def estado(self):
        saldos = self._auditar()
        if saldos is None:
            saldos = self._ult_saldos
        else:
            self._ult_saldos = saldos
        with self._m:
            dueno = dict(self.dueno)
            espera = dict(self.espera)
            cont = {'completadas': self.completadas, 'rechazadas': self.rechazadas,
                    'abortadas': self.abortadas, 'reintentadas': self.reintentadas,
                    'deadlocks': self.deadlocks}
        with self._lev:
            eventos = list(self.eventos)
        nombres = [f'T{i}' for i in range(self.n_hilos)]
        aristas = [{'de': h, 'a': f'C{c}', 'tipo': 'solicitud'} for h, c in espera.items()]
        aristas += [{'de': f'C{c}', 'a': h, 'tipo': 'asignacion'} for c, h in dueno.items()]
        if self.ciclo:
            fase = 'deadlock'
        elif time.time() - self._t_recup < 3 and self._t_recup:
            fase = 'recuperado'
        else:
            fase = 'normal'
        esperado = SALDO_INICIAL * N_CUENTAS
        return {
            'activo': not self._parar.is_set(),
            'forzado': self.forzado,
            'sin_proteccion': self.sin_proteccion,
            'fase': fase,
            'tiempo': round(time.time() - self.t0, 1),
            'cuentas': [{'id': i, 'saldo': s, 'dueno': dueno.get(i),
                         'esperando': [h for h, c in espera.items() if c == i]}
                        for i, s in enumerate(saldos)],
            'suma': sum(saldos),
            'suma_esperada': esperado,
            'integridad': sum(saldos) == esperado,
            'hilos': [{'nombre': n, 'tid': self.tids.get(n),
                       'estado': 'bloqueado' if n in espera else 'activo'} for n in nombres],
            'rag': {'procesos': nombres, 'recursos': [f'C{i}' for i in range(N_CUENTAS)],
                    'aristas': aristas},
            'ciclo': self.ciclo,
            'contadores': cont,
            'eventos': eventos,
        }