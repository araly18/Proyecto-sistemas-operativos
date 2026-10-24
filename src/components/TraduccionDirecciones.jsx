import React, { useState } from 'react';

const btn = (activo) => ({
  backgroundColor: activo ? '#80deea' : '#546e7a', color: activo ? '#000' : '#fff',
  border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '8px'
});
const input = { backgroundColor: '#263238', color: '#81c784', border: '1px solid #546e7a', padding: '6px', width: '100%', boxSizing: 'border-box' };
const caja = { backgroundColor: '#37474f', border: '1px solid #546e7a', borderRadius: '6px', padding: '12px' };

function Paginacion() {
  const [tam, setTam] = useState(1000);
  const [dir, setDir] = useState(2150);
  const [marcos, setMarcos] = useState([4, 1, 7, null]);

  const pag = Math.floor(dir / tam);
  const desp = dir % tam;

  let res;
  if (!(tam > 0) || dir < 0) res = { error: 'El tamaño de página debe ser positivo y la dirección no negativa.' };
  else if (pag >= marcos.length) res = { error: `La página ${pag} no existe. El proceso tiene ${marcos.length} páginas (0 a ${marcos.length - 1}).` };
  else if (marcos[pag] === null) res = { error: `Fallo de página: la página ${pag} no está en memoria física.` };
  else res = { marco: marcos[pag], fisica: marcos[pag] * tam + desp };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <label>Tamaño de página (bytes)<input type="number" value={tam} onChange={e => setTam(Number(e.target.value))} style={input} /></label>
        <label>Dirección lógica<input type="number" value={dir} onChange={e => setDir(Number(e.target.value))} style={input} /></label>
      </div>

      <div style={{ ...caja, marginBottom: '12px' }}>
        <div style={{ color: '#80deea', marginBottom: '6px' }}>Tabla de páginas (vacío = no residente)</div>
        {marcos.map((m, k) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ width: '90px' }}>Página {k}</span>
            <span>→ marco</span>
            <input type="number" value={m === null ? '' : m} placeholder="—"
              onChange={e => setMarcos(prev => prev.map((x, idx) => idx === k ? (e.target.value === '' ? null : Number(e.target.value)) : x))}
              style={{ ...input, width: '90px' }} />
          </div>
        ))}
      </div>

      <div style={caja}>
        <div>Número de página = ⌊{dir} / {tam}⌋ = <b style={{ color: '#fff59d' }}>{pag}</b></div>
        <div>Desplazamiento = {dir} mod {tam} = <b style={{ color: '#fff59d' }}>{desp}</b></div>
        {res.error ? (
          <div style={{ color: '#ef5350', marginTop: '8px' }}>🚨 {res.error}</div>
        ) : (
          <>
            <div>Marco asignado = <b style={{ color: '#fff59d' }}>{res.marco}</b></div>
            <div style={{ marginTop: '8px', color: '#81c784', fontWeight: 'bold' }}>
              Dirección física = {res.marco} × {tam} + {desp} = {res.fisica}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Segmentacion() {
  const [segs, setSegs] = useState([
    { base: 4000, limite: 1000 }, { base: 8000, limite: 500 },
    { base: 12000, limite: 2000 }, { base: 16000, limite: 800 }
  ]);
  const [seg, setSeg] = useState(1);
  const [desp, setDesp] = useState(200);

  const fila = segs[seg];

  let res;
  if (!fila || seg < 0) res = { error: `El segmento ${seg} no existe en la tabla.` };
  else if (desp < 0 || desp >= fila.limite) res = { error: `Violación de límite: el desplazamiento ${desp} es igual o mayor que el límite ${fila.limite} del segmento ${seg}.` };
  else res = { fisica: fila.base + desp };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <label>Número de segmento<input type="number" value={seg} onChange={e => setSeg(Number(e.target.value))} style={input} /></label>
        <label>Desplazamiento (bytes)<input type="number" value={desp} onChange={e => setDesp(Number(e.target.value))} style={input} /></label>
      </div>

      <div style={{ ...caja, marginBottom: '12px' }}>
        <div style={{ color: '#80deea', marginBottom: '6px' }}>Tabla de segmentos (editable)</div>
        {segs.map((s, k) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ width: '90px' }}>Segmento {k}</span>
            <span>base</span>
            <input type="number" value={s.base} onChange={e => setSegs(p => p.map((x, i) => i === k ? { ...x, base: Number(e.target.value) } : x))} style={{ ...input, width: '90px' }} />
            <span>límite</span>
            <input type="number" value={s.limite} onChange={e => setSegs(p => p.map((x, i) => i === k ? { ...x, limite: Number(e.target.value) } : x))} style={{ ...input, width: '90px' }} />
          </div>
        ))}
      </div>

      <div style={caja}>
        {res.error ? (
          <div style={{ color: '#ef5350' }}>🚨 {res.error}</div>
        ) : (
          <>
            <div>Base del segmento {seg} = <b style={{ color: '#fff59d' }}>{fila.base}</b>, límite = <b style={{ color: '#fff59d' }}>{fila.limite}</b></div>
            <div>Validación: {desp} &lt; {fila.limite} ✅</div>
            <div style={{ marginTop: '8px', color: '#81c784', fontWeight: 'bold' }}>
              Dirección física = {fila.base} + {desp} = {res.fisica}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function TraduccionDirecciones() {
  const [modo, setModo] = useState('pag');

  return (
    <div style={{ backgroundColor: '#263238', color: '#b0bec5', fontFamily: "'Courier New', monospace", fontSize: '14px', padding: '14px', borderRadius: '8px', border: '2px solid #546e7a', margin: '20px 0' }}>
      <h3 style={{ color: '#80deea', marginTop: 0, fontSize: '16px' }}>Traducción de direcciones lógicas a físicas</h3>
      <div style={{ marginBottom: '12px' }}>
        <button onClick={() => setModo('pag')} style={btn(modo === 'pag')}>Paginación</button>
        <button onClick={() => setModo('seg')} style={btn(modo === 'seg')}>Segmentación</button>
      </div>
      {modo === 'pag' ? <Paginacion /> : <Segmentacion />}
    </div>
  );
}