import React, { useState, useEffect } from 'react';

const btn = (color) => ({
  backgroundColor: color, color: '#000', border: 'none', padding: '8px 14px',
  borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '8px', marginBottom: '8px'
});
const caja = { backgroundColor: '#37474f', border: '1px solid #546e7a', borderRadius: '4px', padding: '12px' };

// ==================== ESCENARIO 1: DOS RECURSOS (D y C) ====================
const PASOS_DOS = {
  ingenuo: { P: ['D', 'C'], Q: ['C', 'D'] },
  orden:   { P: ['D', 'C'], Q: ['D', 'C'] }
};

const initDos = (modo) => ({
  modo,
  pc: { P: 0, Q: 0 },            // 0 y 1 = pedir; 2 = liberar; 3 = terminado
  dueno: { D: null, C: null },
  espera: { P: null, Q: null },
  bloqueado: false,
  msg: 'Listo. Pulsa Paso o Reproducir.'
});

function pasoDos(s) {
  if (s.bloqueado || (s.pc.P === 3 && s.pc.Q === 3)) return s;
  const pasos = PASOS_DOS[s.modo];
  const dueno = { ...s.dueno };
  const pc = { ...s.pc };
  const espera = { P: null, Q: null };
  let progreso = false;

  for (const p of ['P', 'Q']) {
    if (pc[p] === 3) continue;
    if (pc[p] < 2) {
      const recurso = pasos[p][pc[p]];
      if (dueno[recurso] === null) { dueno[recurso] = p; pc[p]++; progreso = true; }
      else espera[p] = recurso;
    } else if (pc[p] === 2) {
      pasos[p].forEach(r => { if (dueno[r] === p) dueno[r] = null; });
      pc[p] = 3; progreso = true;
    }
  }

  if (!progreso) {
    return { ...s, dueno, pc, espera, bloqueado: true,
      msg: '🚨 INTERBLOQUEO: P tiene un recurso y espera el de Q; Q tiene el de P y espera el suyo. Nadie puede avanzar.' };
  }
  const fin = pc.P === 3 && pc.Q === 3;
  return { ...s, dueno, pc, espera,
    msg: fin ? '✅ Ambos procesos terminaron sin interbloqueo.' : 'Avanzando...' };
}

function SimuladorDos() {
  const [modo, setModo] = useState('ingenuo');
  const [s, setS] = useState(initDos('ingenuo'));
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    if (!auto || s.bloqueado || (s.pc.P === 3 && s.pc.Q === 3)) return;
    const id = setInterval(() => setS(prev => pasoDos(prev)), 900);
    return () => clearInterval(id);
  }, [auto, s]);

  const cambiarModo = (m) => { setModo(m); setS(initDos(m)); setAuto(false); };
  const etiqueta = (p) => s.pc[p] === 3 ? 'terminado' : s.espera[p] ? `espera ${s.espera[p]}` : s.pc[p] === 2 ? 'liberando' : `pide ${PASOS_DOS[s.modo][p][s.pc[p]]}`;

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <button style={btn(modo === 'ingenuo' ? '#ef5350' : '#546e7a')} onClick={() => cambiarModo('ingenuo')}>P pide D→C, Q pide C→D</button>
        <button style={btn(modo === 'orden' ? '#81c784' : '#546e7a')} onClick={() => cambiarModo('orden')}>Ambos piden D→C (orden global)</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        {['D', 'C'].map(r => (
          <div key={r} style={{ ...caja, textAlign: 'center' }}>
            <div style={{ color: '#80deea', fontWeight: 'bold' }}>Recurso {r}</div>
            <div style={{ color: s.dueno[r] ? '#81c784' : '#90a4ae', marginTop: '6px' }}>
              {s.dueno[r] ? `lo tiene ${s.dueno[r]}` : 'libre'}
            </div>
          </div>
        ))}
        <div style={{ ...caja, fontSize: '12px' }}>
          <div>Estado de procesos:</div>
          <div style={{ color: '#fff59d' }}>P: {etiqueta('P')}</div>
          <div style={{ color: '#fff59d' }}>Q: {etiqueta('Q')}</div>
        </div>
      </div>

      <div style={{ color: s.bloqueado ? '#ef5350' : '#fff59d', marginBottom: '10px', fontSize: '13px' }}>{s.msg}</div>

      <button style={btn('#81c784')} onClick={() => setS(prev => pasoDos(prev))}>▶ Paso</button>
      <button style={btn(auto ? '#ff9800' : '#64b5f6')} onClick={() => setAuto(!auto)}>{auto ? '⏸ Pausar' : '⏩ Reproducir'}</button>
      <button style={btn('#ef5350')} onClick={() => { setS(initDos(modo)); setAuto(false); }}>🔄 Reiniciar</button>
    </div>
  );
}

// ==================== ESCENARIO 2: FILÓSOFOS COMENSALES ====================
const N = 5;

const initFil = (modo) => ({
  modo,
  forks: Array(N).fill(null),
  filo: Array.from({ length: N }, () => ({ fase: 'pensa', comidas: 0 })),
  bloqueado: false,
  msg: 'Listo. Pulsa Paso o Reproducir.'
});

const ordenFork = (i, modo) => {
  const izq = i, der = (i + 1) % N;
  if (modo === 'zurdo' && i === N - 1) return [der, izq];
  return [izq, der];
};

function pasoFil(s) {
  if (s.bloqueado) return s;
  const forks = [...s.forks];
  const filo = s.filo.map(f => ({ ...f }));
  let progreso = false;

  for (let i = 0; i < N; i++) {
    const f = filo[i];
    const [a, b] = ordenFork(i, s.modo);

    if (f.fase === 'pensa') {
      const sentados = filo.filter(x => x.fase === 'izq').length;
      if (s.modo === 'comedor' && sentados >= N - 1) continue;
      if (forks[a] === null) { forks[a] = i; f.fase = 'izq'; progreso = true; }
    } else if (f.fase === 'izq') {
      if (forks[b] === null) { forks[b] = i; f.fase = 'come'; progreso = true; }
    } else if (f.fase === 'come') {
      forks[a] = null; forks[b] = null;
      f.fase = 'pensa'; f.comidas++; progreso = true;
    }
  }

  const hayEsperando = filo.some(f => f.fase === 'izq');
  if (!progreso && hayEsperando) {
    return { ...s, forks, filo, bloqueado: true,
      msg: '🚨 INTERBLOQUEO: cada filósofo tiene el tenedor izquierdo y espera el derecho. Nadie come.' };
  }
  return { ...s, forks, filo, msg: 'Avanzando...' };
}

function SimuladorFilosofos() {
  const [modo, setModo] = useState('ingenuo');
  const [s, setS] = useState(initFil('ingenuo'));
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    if (!auto || s.bloqueado) return;
    const id = setInterval(() => setS(prev => pasoFil(prev)), 900);
    return () => clearInterval(id);
  }, [auto, s]);

  const cambiarModo = (m) => { setModo(m); setS(initFil(m)); setAuto(false); };
  const colorFase = { pensa: '#546e7a', izq: '#ffb74d', come: '#81c784' };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <button style={btn(modo === 'ingenuo' ? '#ef5350' : '#546e7a')} onClick={() => cambiarModo('ingenuo')}>Ingenuo</button>
        <button style={btn(modo === 'comedor' ? '#81c784' : '#546e7a')} onClick={() => cambiarModo('comedor')}>Comedor (N-1)</button>
        <button style={btn(modo === 'zurdo' ? '#81c784' : '#546e7a')} onClick={() => cambiarModo('zurdo')}>Zurdo</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '10px' }}>
        {s.filo.map((f, i) => (
          <div key={i} style={{ ...caja, textAlign: 'center', borderColor: colorFase[f.fase], borderWidth: '2px', padding: '8px' }}>
            <div style={{ color: '#80deea', fontWeight: 'bold' }}>F{i}</div>
            <div style={{ color: colorFase[f.fase], fontSize: '12px', margin: '4px 0' }}>{f.fase}</div>
            <div style={{ color: '#90a4ae', fontSize: '11px' }}>comidas: {f.comidas}</div>
          </div>
        ))}
      </div>

      <div style={{ color: '#90a4ae', fontSize: '12px', marginBottom: '8px' }}>
        Tenedores: {s.forks.map((o, i) => `T${i}=${o === null ? 'libre' : 'F' + o}`).join(' | ')}
      </div>
      <div style={{ color: s.bloqueado ? '#ef5350' : '#fff59d', marginBottom: '10px', fontSize: '13px' }}>{s.msg}</div>

      <button style={btn('#81c784')} onClick={() => setS(prev => pasoFil(prev))}>▶ Paso</button>
      <button style={btn(auto ? '#ff9800' : '#64b5f6')} onClick={() => setAuto(!auto)}>{auto ? '⏸ Pausar' : '⏩ Reproducir'}</button>
      <button style={btn('#ef5350')} onClick={() => { setS(initFil(modo)); setAuto(false); }}>🔄 Reiniciar</button>
    </div>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function SimuladorInterbloqueos() {
  const [tab, setTab] = useState('dos');

  return (
    <div style={{ backgroundColor: '#263238', color: '#b0bec5', fontFamily: "'Courier New', monospace", fontSize: '14px', padding: '14px', borderRadius: '8px', border: '2px solid #546e7a', margin: '20px 0' }}>
      <h2 style={{ color: '#80deea', textAlign: 'center', margin: '0 0 12px', fontSize: '20px' }}>
        🔒 SIMULADOR DE INTERBLOQUEOS
      </h2>

      <div style={{ marginBottom: '12px' }}>
        <button style={btn(tab === 'dos' ? '#80deea' : '#546e7a')} onClick={() => setTab('dos')}>Dos recursos (D y C)</button>
        <button style={btn(tab === 'fil' ? '#80deea' : '#546e7a')} onClick={() => setTab('fil')}>Filósofos comensales</button>
      </div>

      <div style={caja}>
        {tab === 'dos' ? <SimuladorDos /> : <SimuladorFilosofos />}
      </div>

      <div style={{ ...caja, marginTop: '12px', fontSize: '12px' }}>
        <div style={{ color: '#80deea', fontWeight: 'bold', marginBottom: '6px' }}>Condiciones de Coffman</div>
        <div>Exclusión mutua: un recurso solo lo tiene un proceso a la vez.</div>
        <div>Retención y espera: se tiene un recurso mientras se espera otro.</div>
        <div>Sin expropiación: el sistema no quita recursos por la fuerza.</div>
        <div>Espera circular: cada proceso espera un recurso que tiene el siguiente.</div>
        <div style={{ marginTop: '6px', color: '#fff59d' }}>
          Para romper el interbloqueo basta quitar una condición: orden global (ambos piden D→C), comedor (N-1) o zurdo.
        </div>
      </div>
    </div>
  );
}