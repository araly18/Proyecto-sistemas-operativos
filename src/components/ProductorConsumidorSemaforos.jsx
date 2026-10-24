import React, { useState } from 'react';

const btn = (color, deshabilitado) => ({
  backgroundColor: deshabilitado ? '#455a64' : color,
  color: deshabilitado ? '#90a4ae' : '#000',
  border: 'none', padding: '8px 14px', borderRadius: '4px',
  cursor: deshabilitado ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginRight: '8px', marginBottom: '8px'
});

const inicial = (cap, orden) => ({
  cap, orden,
  e: cap, n: 0, s: 1,
  buffer: [],
  contador: 1,
  bloqueado: null,
  log: [`Estado inicial: e = ${cap}, n = 0, s = 1`]
});

export default function ProductorConsumidorSemaforos() {
  const [st, setSt] = useState(inicial(3, 'correcto'));

  const reiniciar = (cap = st.cap, orden = st.orden) => setSt(inicial(cap, orden));

  const producir = () => setSt(p => {
    if (p.bloqueado) return p;
    if (p.e === 0) return { ...p, log: [...p.log, 'Productor: semWait(e) se bloquea, el búfer está lleno'] };
    const dato = 'D' + p.contador;
    return {
      ...p,
      e: p.e - 1,
      n: p.n + 1,
      buffer: [...p.buffer, dato],
      contador: p.contador + 1,
      log: [...p.log, `Productor agrega ${dato}: e = ${p.e - 1}, n = ${p.n + 1}`]
    };
  });

  const consumir = () => setSt(p => {
    if (p.bloqueado) return p;

    if (p.orden === 'incorrecto' && p.n === 0) {
      return {
        ...p,
        s: 0,
        bloqueado: 'INTERBLOQUEO: el consumidor tomó s (exclusión mutua) y espera n. El productor necesita s para agregar un dato, y nadie puede liberarlo.',
        log: [...p.log, 'Consumidor: semWait(s) toma el búfer, luego semWait(n) se bloquea']
      };
    }

    if (p.n === 0) return { ...p, log: [...p.log, 'Consumidor: semWait(n) se bloquea, no hay datos'] };

    const [dato, ...resto] = p.buffer;
    return {
      ...p,
      n: p.n - 1,
      e: p.e + 1,
      buffer: resto,
      log: [...p.log, `Consumidor extrae ${dato}: e = ${p.e + 1}, n = ${p.n - 1}`]
    };
  });

  const colorSem = { e: '#81c784', n: '#64b5f6', s: '#ffb74d' };

  return (
    <div style={{ backgroundColor: '#263238', color: '#b0bec5', fontFamily: "'Courier New', monospace", fontSize: '14px', padding: '14px', borderRadius: '8px', border: '2px solid #546e7a', margin: '20px 0' }}>
      <h3 style={{ color: '#80deea', marginTop: 0, fontSize: '16px' }}>Productor-consumidor con semáforos</h3>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '12px', fontSize: '12px' }}>
        <label>Capacidad del búfer:&nbsp;
          <select value={st.cap} onChange={ev => reiniciar(Number(ev.target.value), st.orden)} style={{ backgroundColor: '#37474f', color: '#fff', border: '1px solid #546e7a' }}>
            {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label>Orden del consumidor:&nbsp;
          <select value={st.orden} onChange={ev => reiniciar(st.cap, ev.target.value)} style={{ backgroundColor: '#37474f', color: '#fff', border: '1px solid #546e7a' }}>
            <option value="correcto">Correcto (n, luego s)</option>
            <option value="incorrecto">Incorrecto (s, luego n)</option>
          </select>
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
        {[['e', 'espacios libres'], ['n', 'datos disponibles'], ['s', 'mutex del búfer']].map(([k, desc]) => (
          <div key={k} style={{ backgroundColor: '#37474f', border: '1px solid #546e7a', borderRadius: '4px', padding: '8px', textAlign: 'center' }}>
            <div style={{ color: colorSem[k], fontWeight: 'bold', fontSize: '18px' }}>{k} = {st[k]}</div>
            <div style={{ fontSize: '11px' }}>{desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        {Array.from({ length: st.cap }).map((_, k) => (
          <div key={k} style={{ flex: 1, minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: st.buffer[k] ? '#1b5e20' : '#1a1a1a', border: '1px dashed #546e7a', borderRadius: '4px', color: '#fff59d' }}>
            {st.buffer[k] || '—'}
          </div>
        ))}
      </div>

      {st.bloqueado && (
        <div style={{ backgroundColor: '#5d1a1a', border: '2px solid #ef5350', padding: '10px', borderRadius: '4px', color: '#fff59d', marginBottom: '12px' }}>
          🚨 {st.bloqueado}
        </div>
      )}

      <button onClick={producir} disabled={!!st.bloqueado} style={btn('#81c784', !!st.bloqueado)}>▶ Producir</button>
      <button onClick={consumir} disabled={!!st.bloqueado} style={btn('#64b5f6', !!st.bloqueado)}>◀ Consumir</button>
      <button onClick={() => reiniciar()} style={btn('#ef5350', false)}>🔄 Reiniciar</button>

      <div style={{ backgroundColor: '#1a1a1a', borderRadius: '4px', padding: '10px', marginTop: '8px', maxHeight: '180px', overflowY: 'auto', fontSize: '12px' }}>
        {st.log.slice(-10).map((l, k) => <div key={k}>› {l}</div>)}
      </div>
    </div>
  );
}