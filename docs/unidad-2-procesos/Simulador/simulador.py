"""
Simulador de Gestión de Procesos en Memoria
=============================================
Simula un sistema operativo con:
- 1 CPU
- 1 GB (1024 MB) de RAM
- Gestión dinámica de memoria
- Cola de espera para procesos sin memoria disponible
- Ejecución concurrente mediante hilos (threading)

Autor(es): (agregar nombres del equipo)
"""

import threading
import time
import random
from collections import deque
from datetime import datetime

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress_bar import ProgressBar
from rich.text import Text

console = Console()

# ------------------------------------------------------------------
# CONFIGURACIÓN DEL SISTEMA
# ------------------------------------------------------------------
RAM_TOTAL_MB = 1024  # 1 GB de RAM total disponible

# Lock para proteger el acceso a la memoria y a las listas compartidas
# entre varios hilos (procesos) que corren al mismo tiempo.
lock = threading.Lock()

# Nombres genéricos por si el usuario no especifica uno
NOMBRES_GENERICOS = [
    "Navegador", "Editor", "Compilador", "Reproductor",
    "Antivirus", "Backup", "Servidor_Local", "Juego"
]


class Proceso:
    """Representa un proceso que consume memoria RAM durante un tiempo."""

    contador_pid = 1  # Genera PIDs únicos automáticamente

    def __init__(self, nombre, memoria_mb, duracion_seg):
        self.pid = Proceso.contador_pid
        Proceso.contador_pid += 1

        self.nombre = nombre if nombre else f"{random.choice(NOMBRES_GENERICOS)}_{self.pid}"
        self.memoria_mb = memoria_mb
        self.duracion_seg = duracion_seg
        self.estado = "en_espera"  # en_espera -> ejecutando -> finalizado

    def __str__(self):
        return (f"PID {self.pid:<3} | {self.nombre:<20} | "
                f"{self.memoria_mb:>5} MB | {self.duracion_seg:>3}s | "
                f"Estado: {self.estado}")


class GestorMemoria:
    """Administra la RAM disponible, la cola de espera y los procesos activos."""

    def __init__(self, ram_total):
        self.ram_total = ram_total
        self.ram_disponible = ram_total
        self.cola_espera = deque()
        self.procesos_ejecutando = {}  # pid -> Proceso
        self.procesos_finalizados = []

    # ----------------------------------------------------------
    def agregar_proceso(self, proceso):
        """Agrega un proceso nuevo: lo ejecuta si hay memoria, si no lo encola."""
        with lock:
            if proceso.memoria_mb > self.ram_total:
                print(f"[ERROR] El proceso {proceso.nombre} requiere {proceso.memoria_mb}MB, "
                      f"pero la RAM total del sistema es {self.ram_total}MB. No se puede ejecutar.")
                return

            if self.ram_disponible >= proceso.memoria_mb:
                self._ejecutar_proceso(proceso)
            else:
                proceso.estado = "en_espera"
                self.cola_espera.append(proceso)
                print(f"[COLA] {proceso.nombre} (PID {proceso.pid}) no cabe en memoria "
                      f"({proceso.memoria_mb}MB solicitados, {self.ram_disponible}MB libres). "
                      f"Se agregó a la cola de espera.")

    # ----------------------------------------------------------
    def _ejecutar_proceso(self, proceso):
        """Reserva memoria y lanza el proceso en un hilo (debe llamarse con el lock tomado)."""
        self.ram_disponible -= proceso.memoria_mb
        proceso.estado = "ejecutando"
        self.procesos_ejecutando[proceso.pid] = proceso

        print(f"[EJECUTANDO] {proceso.nombre} (PID {proceso.pid}) "
              f"usa {proceso.memoria_mb}MB. RAM disponible: {self.ram_disponible}MB")

        hilo = threading.Thread(target=self._correr_proceso, args=(proceso,))
        hilo.daemon = True
        hilo.start()

    # ----------------------------------------------------------
    def _correr_proceso(self, proceso):
        """Simula la ejecución del proceso durante su duración y libera memoria al terminar."""
        time.sleep(proceso.duracion_seg)
        self._finalizar_proceso(proceso)

    # ----------------------------------------------------------
    def _finalizar_proceso(self, proceso):
        """Libera la memoria del proceso y revisa si algún proceso en cola ya puede entrar."""
        with lock:
            proceso.estado = "finalizado"
            self.ram_disponible += proceso.memoria_mb
            self.procesos_ejecutando.pop(proceso.pid, None)
            self.procesos_finalizados.append(proceso)

            print(f"[FINALIZADO] {proceso.nombre} (PID {proceso.pid}) liberó "
                  f"{proceso.memoria_mb}MB. RAM disponible: {self.ram_disponible}MB")

            self._revisar_cola()

    # ----------------------------------------------------------
    def _revisar_cola(self):
        """Revisa la cola de espera e intenta ejecutar procesos que ya quepan en memoria.
        Debe llamarse con el lock ya tomado."""
        pendientes = []
        while self.cola_espera:
            candidato = self.cola_espera.popleft()
            if self.ram_disponible >= candidato.memoria_mb:
                self._ejecutar_proceso(candidato)
            else:
                pendientes.append(candidato)
        # Los que no cupieron regresan a la cola en su orden original
        for p in pendientes:
            self.cola_espera.append(p)

    # ----------------------------------------------------------
    def mostrar_estado(self):
        """Dibuja el panel de estado completo (RAM, tablas de procesos) con rich."""
        with lock:
            ram_usada = self.ram_total - self.ram_disponible
            porcentaje = int((ram_usada / self.ram_total) * 100)

            # --- Barra de uso de RAM ---
            barra = ProgressBar(total=100, completed=porcentaje, width=40)
            color = "green" if porcentaje < 60 else ("yellow" if porcentaje < 85 else "red")
            texto_ram = Text(f"  {ram_usada} MB usados / {self.ram_total} MB totales "
                              f"({porcentaje}%)  ", style=color)

            console.print(Panel.fit(
                barra, title="[bold]Uso de RAM[/bold]",
                subtitle=str(texto_ram), border_style=color
            ))

            # --- Tabla de procesos en ejecución ---
            tabla_ejec = Table(title="Procesos en ejecución", header_style="bold green")
            tabla_ejec.add_column("PID")
            tabla_ejec.add_column("Nombre")
            tabla_ejec.add_column("Memoria (MB)")
            tabla_ejec.add_column("Duración (s)")
            if self.procesos_ejecutando:
                for p in self.procesos_ejecutando.values():
                    tabla_ejec.add_row(str(p.pid), p.nombre, str(p.memoria_mb), str(p.duracion_seg))
            else:
                tabla_ejec.add_row("-", "(ninguno)", "-", "-")
            console.print(tabla_ejec)

            # --- Tabla de cola de espera ---
            tabla_cola = Table(title="Cola de espera", header_style="bold yellow")
            tabla_cola.add_column("PID")
            tabla_cola.add_column("Nombre")
            tabla_cola.add_column("Memoria (MB)")
            tabla_cola.add_column("Duración (s)")
            if self.cola_espera:
                for p in self.cola_espera:
                    tabla_cola.add_row(str(p.pid), p.nombre, str(p.memoria_mb), str(p.duracion_seg))
            else:
                tabla_cola.add_row("-", "(ninguno)", "-", "-")
            console.print(tabla_cola)

            # --- Tabla de procesos finalizados (últimos 5) ---
            tabla_fin = Table(title="Procesos finalizados (últimos 5)", header_style="bold cyan")
            tabla_fin.add_column("PID")
            tabla_fin.add_column("Nombre")
            tabla_fin.add_column("Memoria (MB)")
            if self.procesos_finalizados:
                for p in self.procesos_finalizados[-5:]:
                    tabla_fin.add_row(str(p.pid), p.nombre, str(p.memoria_mb))
            else:
                tabla_fin.add_row("-", "(ninguno)", "-")
            console.print(tabla_fin)


# ------------------------------------------------------------------
# MENÚ DE CONSOLA
# ------------------------------------------------------------------
def pedir_entero(mensaje, minimo=1):
    while True:
        try:
            valor = int(input(mensaje))
            if valor < minimo:
                print(f"Debe ser un número mayor o igual a {minimo}.")
                continue
            return valor
        except ValueError:
            print("Por favor ingresa un número válido.")


def dibujar_pantalla(gestor):
    """Limpia la terminal y dibuja el encabezado + estado + menú, como una pantalla formal."""
    console.clear()
    console.rule("[bold blue] SIMULADOR DE GESTIÓN DE PROCESOS EN MEMORIA ")
    gestor.mostrar_estado()
    console.print("\n[bold]1.[/bold] Crear proceso")
    console.print("[bold]2.[/bold] Actualizar pantalla")
    console.print("[bold]3.[/bold] Salir\n")


def menu():
    gestor = GestorMemoria(RAM_TOTAL_MB)
    dibujar_pantalla(gestor)

    while True:
        opcion = console.input("Selecciona una opción: ").strip()

        if opcion == "1":
            nombre = console.input("Nombre del proceso (Enter para generar uno automático): ").strip()
            memoria = pedir_entero("Memoria requerida (MB): ")
            duracion = pedir_entero("Duración (segundos): ")
            proceso = Proceso(nombre, memoria, duracion)
            gestor.agregar_proceso(proceso)
            console.input("\n[dim]Presiona Enter para ver la pantalla actualizada...[/dim]")
            dibujar_pantalla(gestor)

        elif opcion == "2":
            dibujar_pantalla(gestor)

        elif opcion == "3":
            console.print("[bold red]Saliendo del simulador...[/bold red]")
            break

        else:
            console.print("[red]Opción no válida, intenta de nuevo.[/red]")


if __name__ == "__main__":
    menu()
