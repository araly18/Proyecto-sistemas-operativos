import React, { useState, useEffect } from 'react';

// Posiciones fijas de los recursos (cuentas) en el grafo
const POS_RECURSOS = { 1: [80, 70], 2: [260, 70], 3: [80, 230], 4: [260, 230] };
const LETRAS = { 1: 'A', 2: 'B', 3: 'C', 4: 'D' };

// Acorta una línea para que empiece y termine en el borde de los círculos
const segmento = (x1, y1, r1, x2, y2, r2) => {
  const dx = x2 - x1, dy = y2 - y1;
  const d = Math.hypot(dx, dy) || 1;
  const ux = dx / d, uy = dy / d;
  return { x1: x1 + ux * r1, y1: y1 + uy * r1, x2: x2 - ux * r2, y2: y2 - uy * r2 };
};

// ==================== GRAFO RAG EN SVG ====================
function GrafoSVG({ grafo, ciclo, historial }) {
  const W = 340, H = 320;

  const activas = Object.entries(grafo).map(([nombre, data], i, arr) => ({
    nombre,
    data,
    x: W / 2 + (i - (arr.length - 1) / 2) * 100,
    y: 150,
    enDeadlock: ciclo.some(id => nombre === `T${id}`)
  }));

  const completadas = historial.slice(-6).map((t, i, arr) => ({
    t,
    x: arr.length > 1 ? 40 + i * (260 / (arr.length - 1)) : 170,
    y: 290
  }));

  if (activas.length === 0 && completadas.length === 0) {
    return <div style={{ color: '#90a4ae', textAlign: 'center', paddingTop: '40px' }}>— Sin transacciones —</div>;
  }

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        <defs>
          <marker id="flechaVerde" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#81c784" />
          </marker>
          <marker id="flechaNaranja" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#ffb74d" />
          </marker>
        </defs>

        {/* Aristas de transacciones activas */}
        {activas.map(a => (
          <g key={`e-${a.nombre}`}>
            {a.data.posee.map(r => {
              const [rx, ry] = POS_RECURSOS[Number(r.slice(1))];
              return (
                <line key={`p-${a.nombre}-${r}`} {...segmento(rx, ry, 26, a.x, a.y, 20)}
                  stroke="#81c784" strokeWidth="2" markerEnd="url(#flechaVerde)" />
              );
            })}
            {a.data.espera.map(r => {
              const [rx, ry] = POS_RECURSOS[Number(r.slice(1))];
              return (
                <line key={`w-${a.nombre}-${r}`} {...segmento(a.x, a.y, 20, rx, ry, 26)}
                  stroke="#ffb74d" strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#flechaNaranja)" />
              );
            })}
          </g>
        ))}

        {/* Aristas de transacciones terminadas (punteadas, tenues) */}
        {completadas.map(c => (
          <g key={`h-e-${c.t.id}`}>
            {c.t.bloqueosAdquiridos.map(rid => {
              const [rx, ry] = POS_RECURSOS[rid];
              return (
                <line key={`hl-${c.t.id}-${rid}`} {...segmento(rx, ry, 26, c.x, c.y, 12)}
                  stroke="#546e7a" strokeWidth="1.5" strokeDasharray="3 3" />
              );
            })}
          </g>
        ))}

        {/* Recursos (cuentas) */}
        {Object.entries(POS_RECURSOS).map(([id, [x, y]]) => (
          <g key={`r-${id}`}>
            <circle cx={x} cy={y} r="26" fill="#263238" stroke="#80deea" strokeWidth="2" />
            <text x={x} y={y - 2} textAnchor="middle" fill="#80deea" fontSize="13" fontWeight="bold">R{id}</text>
            <text x={x} y={y + 12} textAnchor="middle" fill="#b0bec5" fontSize="10">Cta {LETRAS[id]}</text>
          </g>
        ))}

        {/* Transacciones activas */}
        {activas.map(a => (
          <g key={`t-${a.nombre}`}>
            <circle cx={a.x} cy={a.y} r="20"
              fill={a.enDeadlock ? '#5d1a1a' : '#37474f'}
              stroke={a.enDeadlock ? '#ef5350' : '#fff59d'} strokeWidth="2" />
            <text x={a.x} y={a.y + 4} textAnchor="middle" fill="#fff59d" fontSize="10" fontWeight="bold">
              T{a.nombre.slice(-3)}
            </text>
          </g>
        ))}

        {/* Transacciones terminadas */}
        {completadas.map(c => {
          const ok = c.t.estado === 'exitosa';
          return (
            <g key={`h-${c.t.id}`} opacity="0.55">
              <circle cx={c.x} cy={c.y} r="12"
                fill={ok ? '#1b5e20' : '#5d1a1a'} stroke={ok ? '#81c784' : '#ef5350'} strokeWidth="1.5" />
              <text x={c.x} y={c.y + 3} textAnchor="middle" fill="#b0bec5" fontSize="8">
                {String(c.t.id).slice(-3)}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{ fontSize: '11px', color: '#90a4ae', marginTop: '6px', lineHeight: 1.6 }}>
        🟢 flecha verde: recurso asignado · 🟠 línea punteada: espera · ○ activa · ◌ terminada (verde = exitosa, rojo = abortada)
      </div>
    </div>
  );
}

export default function MotorTransaccionesAvanzado() {
  const [cuentas, setCuentas] = useState([
    { id: 1, nombre: 'Cuenta A', saldo: 1000, bloqueada: false, color: '#64b5f6' },
    { id: 2, nombre: 'Cuenta B', saldo: 1000, bloqueada: false, color: '#81c784' },
    { id: 3, nombre: 'Cuenta C', saldo: 1000, bloqueada: false, color: '#ffb74d' },
    { id: 4, nombre: 'Cuenta D', saldo: 1000, bloqueada: false, color: '#ef5350' }
  ]);

  const [transacciones, setTransacciones] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [deadlockActivo, setDeadlockActivo] = useState(false);
  const [cicloDeadlock, setCicloDeadlock] = useState([]);
  const [pausa, setPausa] = useState(false);
  const [velocidad, setVelocidad] = useState(1500);
  const [estadisticas, setEstadisticas] = useState({
    exitosas: 0,
    abortadas: 0,
    total: 0
  });
  const [grafoRAG, setGrafoRAG] = useState({});
  const [tiempoTotal, setTiempoTotal] = useState(0);

  // ==================== LÓGICA PRINCIPAL ====================
  useEffect(() => {
    if (pausa || transacciones.length === 0) return;

    const intervalo = setInterval(() => {
      setTiempoTotal(t => t + 1);
      procesarTransacciones();
    }, velocidad);

    return () => clearInterval(intervalo);
  }, [pausa, transacciones, velocidad, cuentas, estadisticas]);

  const procesarTransacciones = () => {
    let transActualizadas = [...transacciones];
    let cuentasActualizadas = [...cuentas];

    transActualizadas = transActualizadas.map(trans => {
      if (trans.estado === 'exitosa' || trans.estado === 'abortada') {
        return trans;
      }

      const origen = cuentasActualizadas.find(c => c.id === trans.origen);
      const destino = cuentasActualizadas.find(c => c.id === trans.destino);

      // Paso 1: bloqueo de la cuenta origen
      if (!trans.bloqueosAdquiridos.includes(trans.origen)) {
        if (!origen.bloqueada) {
          trans.bloqueosAdquiridos.push(trans.origen);
          trans.bloqueosEsperando = trans.bloqueosEsperando.filter(id => id !== trans.origen);
          cuentasActualizadas = cuentasActualizadas.map(c =>
            c.id === trans.origen ? { ...c, bloqueada: true } : c
          );
        } else {
          if (!trans.bloqueosEsperando.includes(trans.origen)) trans.bloqueosEsperando.push(trans.origen);
          trans.estado = 'bloqueada';
        }
      }

      // Paso 2: bloqueo de la cuenta destino
      if (trans.bloqueosAdquiridos.includes(trans.origen) && !trans.bloqueosAdquiridos.includes(trans.destino)) {
        if (!destino.bloqueada) {
          trans.bloqueosAdquiridos.push(trans.destino);
          trans.bloqueosEsperando = trans.bloqueosEsperando.filter(id => id !== trans.destino);
          cuentasActualizadas = cuentasActualizadas.map(c =>
            c.id === trans.destino ? { ...c, bloqueada: true } : c
          );
          trans.estado = 'en_progreso';
        } else {
          if (!trans.bloqueosEsperando.includes(trans.destino)) trans.bloqueosEsperando.push(trans.destino);
          trans.estado = 'bloqueada';
        }
      }

      // Paso 3: con ambos bloqueos, espera un ciclo (para que se vea en el grafo) y luego ejecuta
      if (trans.bloqueosAdquiridos.length === 2 && trans.estado === 'en_progreso') {
        if (!trans.listo) {
          trans.listo = true;
        } else {
          cuentasActualizadas = cuentasActualizadas.map(c => {
            if (c.id === trans.origen) return { ...c, saldo: c.saldo - trans.monto };
            if (c.id === trans.destino) return { ...c, saldo: c.saldo + trans.monto };
            return c;
          });

          cuentasActualizadas = cuentasActualizadas.map(c =>
            trans.bloqueosAdquiridos.includes(c.id) ? { ...c, bloqueada: false } : c
          );

          trans.estado = 'exitosa';
          setEstadisticas(prev => ({ ...prev, exitosas: prev.exitosas + 1, total: prev.total + 1 }));
          setHistorial(prev => [...prev, trans]);
        }
      }

      return trans;
    });

    // Detectar deadlock
    const deadlock = detectarDeadlock(transActualizadas);
    if (deadlock.hay) {
      setDeadlockActivo(true);
      setCicloDeadlock(deadlock.ciclo);

      // Abortar la transacción más reciente
      const transReciente = Math.max(...deadlock.ciclo);
      transActualizadas = transActualizadas.map(t => {
        if (t.id === transReciente) {
          t.estado = 'abortada';
          cuentasActualizadas = cuentasActualizadas.map(c =>
            t.bloqueosAdquiridos.includes(c.id) ? { ...c, bloqueada: false } : c
          );
          setEstadisticas(prev => ({ ...prev, abortadas: prev.abortadas + 1, total: prev.total + 1 }));
          setHistorial(prev => [...prev, t]);
        }
        return t;
      });
    } else {
      setDeadlockActivo(false);
      setCicloDeadlock([]);
    }

    setCuentas(cuentasActualizadas);
    setTransacciones(transActualizadas.filter(t => t.estado !== 'exitosa' && t.estado !== 'abortada'));
    construirGrafoRAG(transActualizadas);
  };

  const detectarDeadlock = (trans) => {
    const transActivos = trans.filter(t => t.estado === 'bloqueada' || t.estado === 'en_progreso');

    for (let i = 0; i < transActivos.length; i++) {
      for (let j = i + 1; j < transActivos.length; j++) {
        const t1 = transActivos[i];
        const t2 = transActivos[j];

        if (
          t1.bloqueosAdquiridos.includes(t2.destino) &&
          t2.bloqueosAdquiridos.includes(t1.destino) &&
          t1.bloqueosEsperando.includes(t2.destino) &&
          t2.bloqueosEsperando.includes(t1.destino)
        ) {
          return { hay: true, ciclo: [t1.id, t2.id] };
        }
      }
    }

    return { hay: false, ciclo: [] };
  };

  const construirGrafoRAG = (trans) => {
    const grafo = {};

    trans.forEach(t => {
      if (t.estado !== 'exitosa' && t.estado !== 'abortada') {
        grafo[`T${t.id}`] = {
          posee: t.bloqueosAdquiridos.map(id => `R${id}`),
          espera: t.bloqueosEsperando.map(id => `R${id}`)
        };
      }
    });

    // Solo actualiza si hay transacciones activas; si no, se queda congelado en la última
    if (Object.keys(grafo).length > 0) {
      setGrafoRAG(grafo);
    }
  };

  const crearTransaccion = (e) => {
    e.preventDefault();
    const origen = parseInt(e.target.origen.value);
    const destino = parseInt(e.target.destino.value);
    const monto = parseInt(e.target.monto.value);

    if (origen === destino) {
      alert('Debe ser diferente');
      return;
    }

    const nuevaTrans = {
      id: Date.now(),
      origen,
      destino,
      monto,
      estado: 'esperando',
      bloqueosAdquiridos: [],
      bloqueosEsperando: []
    };

    setTransacciones([...transacciones, nuevaTrans]);
    e.target.reset();
  };

  const generarAleatorio = () => {
    const cantidad = 3;
    for (let i = 0; i < cantidad; i++) {
      const ids = [1, 2, 3, 4];
      const origen = ids[Math.floor(Math.random() * 4)];
      let destino = ids[Math.floor(Math.random() * 4)];
      while (destino === origen) destino = ids[Math.floor(Math.random() * 4)];

      const nuevaTrans = {
        id: Date.now() + i,
        origen,
        destino,
        monto: Math.floor(Math.random() * 300) + 50,
        estado: 'esperando',
        bloqueosAdquiridos: [],
        bloqueosEsperando: []
      };

      setTransacciones(prev => [...prev, nuevaTrans]);
    }
  };

  const reiniciar = () => {
    setCuentas([
      { id: 1, nombre: 'Cuenta A', saldo: 1000, bloqueada: false, color: '#64b5f6' },
      { id: 2, nombre: 'Cuenta B', saldo: 1000, bloqueada: false, color: '#81c784' },
      { id: 3, nombre: 'Cuenta C', saldo: 1000, bloqueada: false, color: '#ffb74d' },
      { id: 4, nombre: 'Cuenta D', saldo: 1000, bloqueada: false, color: '#ef5350' }
    ]);
    setTransacciones([]);
    setHistorial([]);
    setDeadlockActivo(false);
    setCicloDeadlock([]);
    setEstadisticas({ exitosas: 0, abortadas: 0, total: 0 });
    setTiempoTotal(0);
    setGrafoRAG({});
  };

  return (
    <>
      <style>{`
        .motor-wrap {
          width: 100%;
          box-sizing: border-box;
          padding: 14px;
          background-color: #263238;
          color: #b0bec5;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          border-radius: 8px;
          border: 2px solid #546e7a;
          margin: 20px 0;
        }
        .motor-panel {
          background-color: #37474f;
          padding: 12px;
          border-radius: 4px;
          border: 1px solid #546e7a;
          box-sizing: border-box;
          min-width: 0;
        }
        .motor-cuentas {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 8px;
        }
        .motor-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          align-items: start;
          margin-bottom: 12px;
        }
        .motor-rag {
          height: 380px;
          overflow: auto;
          background-color: #1a1a1a;
          padding: 12px;
          border-radius: 4px;
          box-sizing: border-box;
        }
        .motor-bottom {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 800px) {
          .motor-layout, .motor-bottom { grid-template-columns: 1fr; }
          .motor-rag { height: 320px; }
        }
      `}</style>

      <div className="motor-wrap">
        <h2 style={{ color: '#80deea', textAlign: 'center', margin: '0 0 12px', fontSize: '20px' }}>
          💳 MOTOR DE TRANSACCIONES CON DETECTOR DE DEADLOCKS
        </h2>

        {/* PANEL CONTROL */}
        <div className="motor-panel" style={{ marginBottom: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginBottom: '10px' }}>
            <button onClick={() => setPausa(!pausa)} style={{ backgroundColor: pausa ? '#ff9800' : '#81c784', color: '#000', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {pausa ? '▶️ Reanudar' : '⏸️ Pausar'}
            </button>
            <button onClick={generarAleatorio} style={{ backgroundColor: '#64b5f6', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              🎲 Aleatorio
            </button>
            <button onClick={reiniciar} style={{ backgroundColor: '#ef5350', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              🔄 Reiniciar
            </button>
          </div>
          <div style={{ fontSize: '13px', color: '#fff59d' }}>
            ⏱️ Tiempo: {tiempoTotal}s | ✅ Exitosas: {estadisticas.exitosas} | ❌ Abortadas: {estadisticas.abortadas} | 📊 En proceso: {transacciones.length}
          </div>
        </div>

        {/* CUENTAS */}
        <div className="motor-panel" style={{ marginBottom: '12px' }}>
          <h3 style={{ color: '#80deea', margin: '0 0 8px', fontSize: '16px' }}>🏦 Cuentas Bancarias</h3>
          <div className="motor-cuentas">
            {cuentas.map(cuenta => (
              <div key={cuenta.id} style={{ backgroundColor: cuenta.bloqueada ? '#5d1a1a' : '#263238', border: `2px solid ${cuenta.bloqueada ? '#ef5350' : cuenta.color}`, padding: '10px', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ color: cuenta.color, fontWeight: 'bold' }}>{cuenta.nombre}</div>
                <div style={{ color: '#fff59d', fontSize: '18px', fontWeight: 'bold', margin: '6px 0' }}>Q {cuenta.saldo.toFixed(2)}</div>
                <div style={{ color: cuenta.bloqueada ? '#ef5350' : '#81c784', fontSize: '12px' }}>
                  {cuenta.bloqueada ? '🔒 BLOQUEADA' : '🔓 Libre'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FILA 1: GRAFO | TRANSFERENCIA + ALERTA */}
        <div className="motor-layout">
          <div className="motor-panel">
            <h3 style={{ color: '#80deea', margin: '0 0 8px', fontSize: '16px' }}>🔗 Grafo de Asignación de Recursos (RAG)</h3>
            <div className="motor-rag">
              <GrafoSVG grafo={grafoRAG} ciclo={cicloDeadlock} historial={historial} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {deadlockActivo && (
              <div style={{ backgroundColor: '#5d1a1a', border: '2px solid #ef5350', padding: '12px', borderRadius: '4px' }}>
                <h3 style={{ color: '#ef5350', margin: '0 0 6px', fontSize: '16px' }}>🚨 DEADLOCK DETECTADO Y RESUELTO</h3>
                <div style={{ color: '#fff59d' }}>
                  Ciclo de espera circular. Se abortó la transacción más reciente.
                </div>
                <div style={{ marginTop: '6px', color: '#ffb74d', fontSize: '12px' }}>
                  Ciclo: {cicloDeadlock.map(id => `T${id}`).join(' ↔️ ')}
                </div>
              </div>
            )}

            <div className="motor-panel">
              <h3 style={{ color: '#fff59d', margin: '0 0 8px', fontSize: '16px' }}>➕ Nueva Transferencia</h3>
              <form onSubmit={crearTransaccion}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <select name="origen" required style={{ backgroundColor: '#263238', color: '#81c784', border: '1px solid #546e7a', padding: '6px' }}>
                    <option value="">Origen</option>
                    {cuentas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                  <select name="destino" required style={{ backgroundColor: '#263238', color: '#81c784', border: '1px solid #546e7a', padding: '6px' }}>
                    <option value="">Destino</option>
                    {cuentas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <input type="number" name="monto" min="50" max="500" defaultValue="100" style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#263238', color: '#81c784', border: '1px solid #546e7a', padding: '6px', marginBottom: '8px' }} />
                <button type="submit" style={{ backgroundColor: '#81c784', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>💸 Transferir</button>
              </form>
            </div>
          </div>
        </div>

        {/* FILA 2: ACTIVAS | HISTORIAL */}
        <div className="motor-bottom">
          <div className="motor-panel">
            <h3 style={{ color: '#80deea', margin: '0 0 8px', fontSize: '16px' }}>⏳ Transacciones Activas ({transacciones.length})</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#455a64' }}>
                    <th style={{ border: '1px solid #546e7a', padding: '6px', textAlign: 'left' }}>ID</th>
                    <th style={{ border: '1px solid #546e7a', padding: '6px', textAlign: 'left' }}>Ruta</th>
                    <th style={{ border: '1px solid #546e7a', padding: '6px', textAlign: 'left' }}>Monto</th>
                    <th style={{ border: '1px solid #546e7a', padding: '6px', textAlign: 'left' }}>Estado</th>
                    <th style={{ border: '1px solid #546e7a', padding: '6px', textAlign: 'left' }}>Locks</th>
                  </tr>
                </thead>
                <tbody>
                  {transacciones.length === 0 ? (
                    <tr><td colSpan="5" style={{ border: '1px solid #546e7a', padding: '6px', textAlign: 'center', color: '#90a4ae' }}>— Ninguno —</td></tr>
                  ) : (
                    transacciones.map(t => (
                      <tr key={t.id} style={{ backgroundColor: '#37474f', borderLeft: `3px solid ${t.estado === 'bloqueada' ? '#ffb74d' : '#81c784'}` }}>
                        <td style={{ border: '1px solid #546e7a', padding: '6px' }}>{t.id}</td>
                        <td style={{ border: '1px solid #546e7a', padding: '6px' }}>Cta {t.origen} → Cta {t.destino}</td>
                        <td style={{ border: '1px solid #546e7a', padding: '6px' }}>Q {t.monto}</td>
                        <td style={{ border: '1px solid #546e7a', padding: '6px', color: t.estado === 'bloqueada' ? '#ffb74d' : '#81c784' }}>
                          {t.estado === 'bloqueada' ? '🔒 Bloqueada' : '⚙️ Progreso'}
                        </td>
                        <td style={{ border: '1px solid #546e7a', padding: '6px' }}>{t.bloqueosAdquiridos.length}/2</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="motor-panel">
            <h3 style={{ color: '#64b5f6', margin: '0 0 8px', fontSize: '16px' }}>📋 Historial ({historial.length})</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#455a64' }}>
                    <th style={{ border: '1px solid #546e7a', padding: '6px', textAlign: 'left' }}>Ruta</th>
                    <th style={{ border: '1px solid #546e7a', padding: '6px', textAlign: 'left' }}>Monto</th>
                    <th style={{ border: '1px solid #546e7a', padding: '6px', textAlign: 'left' }}>Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.slice().reverse().slice(0, 8).map(t => (
                    <tr key={t.id} style={{ backgroundColor: '#37474f' }}>
                      <td style={{ border: '1px solid #546e7a', padding: '6px' }}>Cta {t.origen} → Cta {t.destino}</td>
                      <td style={{ border: '1px solid #546e7a', padding: '6px' }}>Q {t.monto}</td>
                      <td style={{ border: '1px solid #546e7a', padding: '6px', color: t.estado === 'exitosa' ? '#81c784' : '#ef5350' }}>
                        {t.estado === 'exitosa' ? '✅ Exitosa' : '❌ Abortada'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}