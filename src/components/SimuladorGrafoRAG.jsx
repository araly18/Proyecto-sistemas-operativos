import React, { useState } from 'react';

const PROCS = ['P1', 'P2', 'P3'];
const RECS = ['R1', 'R2', 'R3'];
const PX = 90, RX = 270;
const PY = { P1: 60, P2: 150, P3: 240 };
const RY = { R1: 60, R2: 150, R3: 240 };

const ESCENARIOS = {
  libre: {
    nombre: 'Sin conflictos',
    asign: { R1: null, R2: null, R3: null },
    pide: { P1: null, P2: null, P3: null },
  },
  cruce: {
    nombre: 'Cruce de dos procesos',
    asign: { R1: 'P1', R2: 'P2', R3: null },
    pide: { P1: 'R2', P2: 'R1', P3: null },
  },
  cadena: {
    nombre: 'Cadena de espera (sin ciclo)',
    asign: { R1: 'P1', R2: 'P2', R3: 'P3' },
    pide: { P1: 'R2', P2: 'R3', P3: null },
  },
  triangulo: {
    nombre: 'Ciclo de tres procesos',
    asign: { R1: 'P1', R2: 'P2', R3: 'P3' },
    pide: { P1: 'R2', P2: 'R3', P3: 'R1' },
  },
};

const card = { backgroundColor: '#37474f', border: '1px solid #546e7a', borderRadius: '6px', padding: '12px' };
const select = { backgroundColor: '#263238', color: '#fff', border: '1px solid #546e7a', padding: '4px' };
const btn = (color, off) => ({
  backgroundColor: off ? '#455a64' : color, color: off ? '#90a4ae' : '#000',
  border: 'none', padding: '6px 12px', borderRadius: '4px',
  cursor: off ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '12px'
});

export default function SimuladorGrafoRAG() {
  const [asign, setAsign] = useState({ ...ESCENARIOS.cruce.asign });
  const [pide, setPide] = useState({ ...ESCENARIOS.cruce.pide });
  const [elegido, setElegido] = useState({ P1: 'R1', P2: 'R2', P3: 'R3' });
  const [log, setLog] = useState(['Escenario cargado: Cruce de dos procesos']);

  const anotar = (m) => setLog(l => [...l, m].slice(-6));

  const cargar = (k) => {
    setAsign({ ...ESCENARIOS[k].asign });
    setPide({ ...ESCENARIOS[k].pide });
    setLog([`Escenario cargado: ${ESCENARIOS[k].nombre}`]);
  };

  const solicitar = (p) => {
    const r = elegido[p];
    if (asign[r] === p) return anotar(`${p} ya tiene ${r}`);
    if (pide[p]) return anotar(`${p} ya está esperando ${pide[p]}`);
    if (asign[r] === null) {
      setAsign({ ...asign, [r]: p });
      anotar(`${p} obtiene ${r}`);
    } else {
      setPide({ ...pide, [p]: r });
      anotar(`${p} pide ${r}, que tiene ${asign[r]}, y queda esperando`);
    }
  };

  const liberar = (r) => {
    const dueno = asign[r];
    if (!dueno) return;
    const siguiente = PROCS.find(q => pide[q] === r);
    const nuevoPide = { ...pide };
    if (siguiente) nuevoPide[siguiente] = null;
    setAsign({ ...asign, [r]: siguiente || null });
    setPide(nuevoPide);
    anotar(siguiente ? `${dueno} libera ${r}; ${siguiente} lo obtiene` : `${dueno} libera ${r}`);
  };

  const terminar = (p) => {
    const a = { ...asign }, pd = { ...pide };
    pd[p] = null;
    RECS.forEach(r => {
      if (a[r] === p) {
        const w = PROCS.find(q => pd[q] === r);
        a[r] = w || null;
        if (w) pd[w] = null;
      }
    });
    setAsign(a);
    setPide(pd);
    anotar(`Se termina ${p} y libera sus recursos`);
  };

  // ===== Análisis del grafo =====
  const siguiente = (p) => (pide[p] ? asign[pide[p]] : null);

  const hallarCiclo = () => {
    for (const s of PROCS) {
      const camino = [];
      let act = s;
      while (act && !camino.includes(act)) {
        camino.push(act);
        act = siguiente(act);
      }
      if (act && camino.includes(act)) return camino.slice(camino.indexOf(act));
    }
    return null;
  };

  const ciclo = hallarCiclo();
  const enCiclo = new Set(ciclo || []);
  const reqEnCiclo = new Set((ciclo || []).map(p => pide[p]));
  const hayEspera = PROCS.some(p => pide[p]);
  const retencionEspera = PROCS.some(p => pide[p] && RECS.some(r => asign[r] === p));
  const victima = ciclo ? ciclo[ciclo.length - 1] : null;

  const coffman = [
    { n: 'Exclusión mutua', ok: true, t: 'Cada recurso tiene una sola unidad: solo un proceso lo usa a la vez.' },
    { n: 'Retención y espera', ok: retencionEspera, t: 'Un proceso conserva un recurso mientras espera otro.' },
    { n: 'Sin expropiación', ok: true, t: 'El sistema no quita recursos por su cuenta. Solo la recuperación lo hace.' },
    { n: 'Espera circular', ok: !!ciclo, t: 'Cada proceso del ciclo espera al siguiente, y el último espera al primero.' },
  ];

  let estado;
  if (ciclo) {
    estado = { color: '#ef5350', texto: `🚨 INTERBLOQUEO: ${[...ciclo, ciclo[0]].join(' → ')}. Ninguno puede avanzar.` };
  } else if (hayEspera) {
    estado = { color: '#ffb74d', texto: 'Hay procesos esperando, pero no hay ciclo. Cuando se libere el recurso, la espera avanza.' };
  } else {
    estado = { color: '#81c784', texto: '✅ Sin interbloqueo. Ningún proceso está esperando.' };
  }

  // ===== Dibujo de aristas =====
  const arista = (key, x1, y1, x2, y2, color, dashed, marcador, grosor) => (
    <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color}
      strokeWidth={grosor} strokeDasharray={dashed ? '6 4' : undefined}
      markerEnd={`url(#flecha-${marcador})`} />
  );

  const aristasAsignacion = RECS.filter(r => asign[r]).map(r => {
    const p = asign[r];
    const rojo = enCiclo.has(p) && reqEnCiclo.has(r);
    return arista(`a-${r}`, RX - 22, RY[r], PX + 24, PY[p],
      rojo ? '#ef5350' : '#81c784', false, rojo ? 'rojo' : 'verde', rojo ? 3 : 2);
  });

  const aristasEspera = PROCS.filter(p => pide[p]).map(p => {
    const r = pide[p];
    const rojo = enCiclo.has(p);
    return arista(`w-${p}`, PX + 24, PY[p], RX - 22, RY[r],
      rojo ? '#ef5350' : '#ffb74d', true, rojo ? 'rojo' : 'naranja', rojo ? 3 : 2);
  });

  return (
    <div style={{ backgroundColor: '#263238', color: '#b0bec5', fontFamily: "'Courier New', monospace", fontSize: '14px', padding: '14px', borderRadius: '8px', border: '2px solid #546e7a', margin: '20px 0' }}>
      <h3 style={{ color: '#80deea', marginTop: 0, fontSize: '16px' }}>Grafo de asignación de recursos</h3>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
        {Object.entries(ESCENARIOS).map(([k, e]) => (
          <button key={k} onClick={() => cargar(k)} style={btn('#80deea', false)}>{e.nombre}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
        <div style={{ ...card, flex: '1 1 320px', minWidth: 0 }}>
          <svg viewBox="0 0 360 300" width="100%" style={{ display: 'block' }}>
            <defs>
              {[['verde', '#81c784'], ['naranja', '#ffb74d'], ['rojo', '#ef5350']].map(([id, c]) => (
                <marker key={id} id={`flecha-${id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M0,0 L10,5 L0,10 z" fill={c} />
                </marker>
              ))}
            </defs>

            {aristasAsignacion}
            {aristasEspera}

            {RECS.map(r => (
              <g key={r}>
                <rect x={RX - 22} y={RY[r] - 22} width="44" height="44" rx="4" fill="#1a1a1a" stroke="#fff59d" strokeWidth="2" />
                <text x={RX} y={RY[r] - 2} textAnchor="middle" fill="#fff59d" fontSize="13" fontWeight="bold">{r}</text>
                <text x={RX} y={RY[r] + 12} textAnchor="middle" fill="#90a4ae" fontSize="9">{asign[r] || 'libre'}</text>
              </g>
            ))}

            {PROCS.map(p => (
              <g key={p}>
                <circle cx={PX} cy={PY[p]} r="24" fill={enCiclo.has(p) ? '#5d1a1a' : '#37474f'}
                  stroke={enCiclo.has(p) ? '#ef5350' : '#80deea'} strokeWidth="2" />
                <text x={PX} y={PY[p] + 5} textAnchor="middle" fill="#80deea" fontSize="13" fontWeight="bold">{p}</text>
              </g>
            ))}
          </svg>
          <div style={{ fontSize: '11px', marginTop: '6px', lineHeight: 1.6 }}>
            Flecha verde sólida: el recurso está asignado al proceso. Línea naranja punteada: el proceso espera el recurso. Rojo: parte del ciclo.
          </div>
        </div>

        <div style={{ ...card, flex: '1 1 300px', minWidth: 0 }}>
          <div style={{ color: '#80deea', fontWeight: 'bold', marginBottom: '8px' }}>Procesos: pedir recurso</div>
          {PROCS.map(p => (
            <div key={p} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
              <b style={{ width: '30px', color: enCiclo.has(p) ? '#ef5350' : '#80deea' }}>{p}</b>
              <select value={elegido[p]} onChange={e => setElegido({ ...elegido, [p]: e.target.value })} style={select}>
                {RECS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <button onClick={() => solicitar(p)} disabled={!!pide[p]} style={btn('#64b5f6', !!pide[p])}>Pedir</button>
              <span style={{ fontSize: '12px', color: pide[p] ? '#ffb74d' : '#81c784' }}>
                {pide[p] ? `espera ${pide[p]}` : 'activo'}
              </span>
            </div>
          ))}

          <div style={{ color: '#80deea', fontWeight: 'bold', margin: '12px 0 8px' }}>Recursos: liberar</div>
          {RECS.map(r => (
            <div key={r} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
              <b style={{ width: '30px', color: '#fff59d' }}>{r}</b>
              <span style={{ width: '80px', fontSize: '12px' }}>{asign[r] ? `lo tiene ${asign[r]}` : 'libre'}</span>
              <button onClick={() => liberar(r)} disabled={!asign[r]} style={btn('#ffb74d', !asign[r])}>Liberar</button>
            </div>
          ))}

          {ciclo && (
            <button onClick={() => terminar(victima)} style={{ ...btn('#ef5350', false), marginTop: '10px' }}>
              🛠 Recuperar: terminar {victima}
            </button>
          )}
        </div>
      </div>

      <div style={{ ...card, borderColor: estado.color, marginBottom: '12px', color: estado.color, fontWeight: 'bold' }}>
        {estado.texto}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', marginBottom: '12px' }}>
        {coffman.map(c => (
          <div key={c.n} style={{ ...card, borderColor: c.ok ? '#ef5350' : '#546e7a' }}>
            <div style={{ color: c.ok ? '#ef5350' : '#81c784', fontWeight: 'bold' }}>
              {c.ok ? '● Se cumple' : '○ No se cumple'}: {c.n}
            </div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>{c.t}</div>
          </div>
        ))}
      </div>

      <div style={{ ...card, maxHeight: '140px', overflowY: 'auto', fontSize: '12px' }}>
        {log.map((l, k) => <div key={k}>› {l}</div>)}
      </div>
    </div>
  );
}