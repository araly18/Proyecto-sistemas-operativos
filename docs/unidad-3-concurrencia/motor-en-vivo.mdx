import React, { useEffect, useRef, useState } from 'react';

const API = 'https://proyecto-sistemas-operativos-1-213c.onrender.com';

const COLOR_FASE = { normal: '#2e8555', deadlock: '#d63a3a', recuperado: '#d99a00' };
const COLOR_EVENTO = {
  normal: '#2e8555',
  deadlock: '#d63a3a',
  deteccion: '#c0392b',
  recuperacion: '#d99a00',
};

const caja = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 8,
  padding: '12px 16px',
  marginBottom: 16,
  background: 'var(--ifm-background-surface-color)',
};
const boton = {
  padding: '8px 16px',
  borderRadius: 6,
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
  marginRight: 8,
  marginBottom: 8,
  color: '#fff',
};
const pre = {
  fontSize: 12,
  overflowX: 'auto',
  padding: 8,
  borderRadius: 6,
  background: 'var(--ifm-color-emphasis-100)',
  margin: '6px 0',
};

function Grafo({ rag, ciclo }) {
  const W = 560;
  const H = 230;
  const R = 22;
  const pos = {};
  rag.procesos.forEach((p, i) => {
    pos[p] = { x: (W * (i + 1)) / (rag.procesos.length + 1), y: 50 };
  });
  rag.recursos.forEach((r, i) => {
    pos[r] = { x: (W * (i + 1)) / (rag.recursos.length + 1), y: 180 };
  });
  const recorte = (a, b) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const d = Math.hypot(dx, dy) || 1;
    const k = R + 4;
    return {
      x1: a.x + (dx / d) * k,
      y1: a.y + (dy / d) * k,
      x2: b.x - (dx / d) * k,
      y2: b.y - (dy / d) * k,
    };
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 640 }}>
      <defs>
        <marker id="flecha-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#2a6fdb" />
        </marker>
        <marker id="flecha-s" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#e67e22" />
        </marker>
      </defs>
      {rag.aristas.map((e, i) => {
        const l = recorte(pos[e.de], pos[e.a]);
        const sol = e.tipo === 'solicitud';
        return (
          <line
            key={i}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke={sol ? '#e67e22' : '#2a6fdb'}
            strokeWidth="2.5"
            strokeDasharray={sol ? '6 4' : undefined}
            markerEnd={`url(#${sol ? 'flecha-s' : 'flecha-a'})`}
          />
        );
      })}
      {rag.procesos.map((p) => (
        <g key={p}>
          <circle
            cx={pos[p].x}
            cy={pos[p].y}
            r={R}
            fill="var(--ifm-background-surface-color)"
            stroke={ciclo.includes(p) ? '#d63a3a' : 'var(--ifm-font-color-base)'}
            strokeWidth={ciclo.includes(p) ? 4 : 2}
          />
          <text x={pos[p].x} y={pos[p].y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--ifm-font-color-base)">
            {p}
          </text>
        </g>
      ))}
      {rag.recursos.map((r) => (
        <g key={r}>
          <rect
            x={pos[r].x - R}
            y={pos[r].y - R + 4}
            width={R * 2}
            height={R * 2 - 8}
            fill="var(--ifm-background-surface-color)"
            stroke="var(--ifm-font-color-base)"
            strokeWidth="2"
          />
          <text x={pos[r].x} y={pos[r].y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--ifm-font-color-base)">
            {r}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function MotorEnVivo() {
  const [est, setEst] = useState(null);
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [ps, setPs] = useState(null);
  const pidiendo = useRef(false);

  async function pedirEstado() {
    if (pidiendo.current) return;
    pidiendo.current = true;
    try {
      const r = await fetch(`${API}/api/estado`);
      const datos = await r.json();
      setEst(datos);
      setError('');
    } catch (e) {
      setError('No se pudo conectar con el motor. Si el servicio estaba dormido, puede tardar hasta 50 segundos en despertar.');
    } finally {
      pidiendo.current = false;
    }
  }

  useEffect(() => {
    pedirEstado();
    const id = setInterval(pedirEstado, 500);
    return () => clearInterval(id);
  }, []);

  async function enviar(ruta, cuerpo) {
    setOcupado(true);
    try {
      await fetch(`${API}${ruta}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: cuerpo ? JSON.stringify(cuerpo) : undefined,
      });
      await pedirEstado();
    } catch (e) {
      setError('No se pudo enviar la orden al motor.');
    } finally {
      setOcupado(false);
    }
  }

  async function pedirPs() {
    try {
      const r = await fetch(`${API}/api/ps`);
      setPs(await r.json());
    } catch (e) {
      setError('No se pudo ejecutar ps en el servidor.');
    }
  }

  const hayDatos = est && est.cuentas;
  const modo = !hayDatos ? '' : est.sin_proteccion ? 'SIN PROTECCIÓN' : est.forzado ? 'forzado' : 'natural';
  const diferencia = hayDatos ? est.suma - est.suma_esperada : 0;

  return (
    <div>
      <div style={caja}>
        <button
          style={{ ...boton, background: '#d63a3a' }}
          disabled={ocupado}
          onClick={() => enviar('/api/iniciar', { forzado: true })}
        >
          Iniciar modo forzado (deadlock)
        </button>
        <button
          style={{ ...boton, background: '#2a6fdb' }}
          disabled={ocupado}
          onClick={() => enviar('/api/iniciar', { forzado: false })}
        >
          Iniciar modo natural
        </button>
        <button
          style={{ ...boton, background: '#e67e22' }}
          disabled={ocupado}
          onClick={() => enviar('/api/iniciar', { sin_proteccion: true })}
        >
          Iniciar SIN protección (condición de carrera)
        </button>
        <button
          style={{ ...boton, background: '#6c757d' }}
          disabled={ocupado}
          onClick={() => enviar('/api/detener')}
        >
          Detener
        </button>
        {error && <div style={{ color: '#d63a3a', marginTop: 8 }}>{error}</div>}
        {!error && !hayDatos && <div>Conectando con el motor...</div>}
        {!error && est && !est.cuentas && <div>El motor está detenido. Elige un modo para iniciarlo.</div>}
      </div>

      {hayDatos && (
        <>
          <div style={caja}>
            <strong>Fase: </strong>
            <span
              style={{
                background: COLOR_FASE[est.fase] || '#6c757d',
                color: '#fff',
                borderRadius: 12,
                padding: '2px 12px',
                fontWeight: 700,
              }}
            >
              {est.fase}
            </span>
            <span style={{ marginLeft: 16 }}>
              Modo: <strong>{modo}</strong>
            </span>
            <span style={{ marginLeft: 16 }}>
              Motor: <strong>{est.activo ? 'activo' : 'detenido'}</strong>
            </span>
            <span style={{ marginLeft: 16 }}>
              Tiempo: <strong>{est.tiempo} s</strong>
            </span>
          </div>

          <div style={caja}>
            <h4 style={{ marginTop: 0 }}>Integridad de datos</h4>
            <div>
              Suma de saldos: <strong>{est.suma}</strong> (esperada: {est.suma_esperada}){' '}
              <span style={{ color: est.integridad ? '#2e8555' : '#d63a3a', fontWeight: 700 }}>
                {est.integridad ? '✔ constante' : '✘ inconsistente'}
              </span>
            </div>
            {!est.integridad && (
              <div style={{ color: '#d63a3a', marginTop: 4 }}>
                Condición de carrera: la suma se desvió {diferencia > 0 ? '+' : ''}
                {diferencia}. Los hilos leyeron y escribieron saldos sin locks y se pisaron las
                actualizaciones.
              </div>
            )}
            {est.integridad && !est.sin_proteccion && (
              <div style={{ marginTop: 4 }}>
                Con un lock por cuenta, las transferencias no se pisan: la suma se mantiene exacta
                bajo carga.
              </div>
            )}
            <div style={{ marginTop: 6 }}>
              Completadas: <strong>{est.contadores.completadas}</strong> · Rechazadas:{' '}
              <strong>{est.contadores.rechazadas}</strong> · Deadlocks detectados:{' '}
              <strong>{est.contadores.deadlocks}</strong> · Abortadas:{' '}
              <strong>{est.contadores.abortadas}</strong> · Reintentadas:{' '}
              <strong>{est.contadores.reintentadas}</strong>
            </div>
          </div>

          <div style={caja}>
            <h4 style={{ marginTop: 0 }}>Cuentas (un lock por cuenta)</h4>
            <table>
              <thead>
                <tr>
                  <th>Cuenta</th>
                  <th>Saldo</th>
                  <th>Lock en poder de</th>
                  <th>Esperando</th>
                </tr>
              </thead>
              <tbody>
                {est.cuentas.map((c) => (
                  <tr key={c.id}>
                    <td>C{c.id}</td>
                    <td>{c.saldo}</td>
                    <td>{c.dueno || '—'}</td>
                    <td>{c.esperando.length ? c.esperando.join(', ') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={caja}>
            <h4 style={{ marginTop: 0 }}>Grafo de asignación de recursos (leído de los locks reales)</h4>
            <Grafo rag={est.rag} ciclo={est.ciclo || []} />
            <div style={{ fontSize: 13 }}>
              Línea azul continua: la cuenta está asignada al hilo. Línea naranja punteada: el hilo está
              esperando esa cuenta. Un ciclo se marca con borde rojo.
            </div>
          </div>

          <div style={caja}>
            <h4 style={{ marginTop: 0 }}>Evidencia de hilos reales del SO</h4>
            {est.hilos_so ? (
              <>
                <div>
                  PID <strong>{est.hilos_so.pid}</strong> · {est.hilos_so.total} hilos · fuente:{' '}
                  <code>{est.hilos_so.fuente}</code>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>TID</th>
                      <th>Nombre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {est.hilos_so.hilos.map((h) => (
                      <tr key={h.tid}>
                        <td>{h.tid}</td>
                        <td>{h.nombre}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <div>Sin datos de hilos.</div>
            )}
            <button style={{ ...boton, background: '#2a6fdb', marginTop: 8 }} onClick={pedirPs}>
              Ejecutar ps -eLf en el servidor
            </button>
            {ps && (
              <>
                <div style={{ fontSize: 13 }}>
                  Fuente: <code>{ps.fuente}</code> (solo las filas del PID {ps.pid})
                </div>
                <pre style={pre}>{ps.ps_eLf}</pre>
                {ps.ps_nombres && <pre style={pre}>{ps.ps_nombres}</pre>}
              </>
            )}
          </div>

          <div style={caja}>
            <h4 style={{ marginTop: 0 }}>Bitácora de eventos</h4>
            {[...est.eventos]
              .reverse()
              .slice(0, 12)
              .map((e, i) => (
                <div key={i} style={{ fontSize: 14, marginBottom: 2 }}>
                  <span style={{ color: COLOR_EVENTO[e.tipo] || '#6c757d', fontWeight: 700 }}>
                    [{e.t} s] {e.tipo}
                  </span>{' '}
                  {e.msg}
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}