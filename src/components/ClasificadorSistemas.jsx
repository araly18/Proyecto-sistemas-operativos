import React, { useState } from 'react';

const PREGUNTAS = [
  { id: 'red', texto: '¿Varias computadoras colaboran entre sí por una red para compartir recursos?' },
  { id: 'plazo', texto: '¿El sistema debe responder siempre dentro de un plazo estricto?' },
  { id: 'varios', texto: '¿Varios usuarios interactúan con el sistema al mismo tiempo?' },
  { id: 'directo', texto: '¿Una persona interactúa directamente con el sistema mientras trabaja?' },
  { id: 'multi', texto: '¿Esa persona puede ejecutar varias tareas al mismo tiempo?' },
];

const RESULTADOS = {
  distribuido: {
    nombre: 'Sistema distribuido',
    descripcion: 'Coordina varias computadoras conectadas en red. Ofrece escalabilidad y uso compartido de recursos, pero debe manejar retrasos de comunicación y fallos parciales.',
    ejemplos: 'Clústeres y servicios en la nube.',
    color: '#64b5f6',
  },
  tiempo_real: {
    nombre: 'Sistema de tiempo real',
    descripcion: 'Debe producir respuestas dentro de plazos determinados. No basta con que el resultado sea correcto: también debe llegar a tiempo.',
    ejemplos: 'FreeRTOS, QNX, VxWorks; equipos médicos, automotrices e industriales.',
    color: '#ef5350',
  },
  tiempo_compartido: {
    nombre: 'Sistema de tiempo compartido',
    descripcion: 'Varios usuarios interactúan con la misma computadora. Cada proceso recibe el procesador en intervalos breves llamados quantum.',
    ejemplos: 'CTSS, Multics, UNIX.',
    color: '#81c784',
  },
  personal: {
    nombre: 'Sistema para computadora personal',
    descripcion: 'Un solo usuario trabaja directamente con el equipo. Puede ser monotarea, como MS-DOS, o multitarea, como los sistemas de escritorio actuales.',
    ejemplos: 'MS-DOS (monotarea); Windows y Linux de escritorio (multitarea).',
    color: '#fff59d',
  },
  lotes: {
    nombre: 'Sistema por lotes',
    descripcion: 'Los trabajos se agrupan y se ejecutan uno tras otro, sin interacción directa del usuario durante la ejecución. Automatiza la secuencia, pero el procesador puede esperar en las operaciones de entrada y salida.',
    ejemplos: 'Monitores residentes de los años 50 y procesamiento de nóminas en lote.',
    color: '#ffb74d',
  },
};

function clasificar(r) {
  if (r.red) return 'distribuido';
  if (r.plazo) return 'tiempo_real';
  if (r.varios) return 'tiempo_compartido';
  if (r.directo) return 'personal';
  return 'lotes';
}

const btn = (color, activo) => ({
  backgroundColor: activo ? color : '#546e7a',
  color: activo ? '#000' : '#fff',
  border: 'none', padding: '6px 14px', borderRadius: '4px',
  cursor: 'pointer', fontWeight: 'bold', marginRight: '6px'
});

export default function ClasificadorSistemas() {
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState({});

  const terminado = paso >= PREGUNTAS.length;
  const tipo = terminado ? clasificar(respuestas) : null;
  const info = tipo ? RESULTADOS[tipo] : null;

  const responder = (valor) => {
    const id = PREGUNTAS[paso].id;
    setRespuestas(prev => ({ ...prev, [id]: valor }));
    setPaso(paso + 1);
  };

  const reiniciar = () => {
    setPaso(0);
    setRespuestas({});
  };

  return (
    <div style={{ backgroundColor: '#263238', color: '#b0bec5', fontFamily: "'Courier New', monospace", fontSize: '14px', padding: '14px', borderRadius: '8px', border: '2px solid #546e7a', margin: '20px 0' }}>
      <h3 style={{ color: '#80deea', marginTop: 0, fontSize: '16px' }}>¿Qué tipo de sistema operativo es?</h3>

      <div style={{ fontSize: '12px', marginBottom: '10px' }}>
        Responde cinco preguntas sobre el uso del sistema. Al final, el simulador te dirá qué clase corresponde.
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
        {PREGUNTAS.map((p, k) => (
          <div key={p.id} style={{ flex: 1, height: '6px', borderRadius: '3px', backgroundColor: k < paso ? '#80deea' : '#37474f' }} />
        ))}
      </div>

      {!terminado ? (
        <div style={{ backgroundColor: '#37474f', border: '1px solid #546e7a', borderRadius: '6px', padding: '14px' }}>
          <div style={{ color: '#fff59d', marginBottom: '12px' }}>
            Pregunta {paso + 1} de {PREGUNTAS.length}: {PREGUNTAS[paso].texto}
          </div>
          <button onClick={() => responder(true)} style={btn('#81c784', false)}>Sí</button>
          <button onClick={() => responder(false)} style={btn('#ef5350', false)}>No</button>
        </div>
      ) : (
        <div style={{ backgroundColor: '#37474f', border: `2px solid ${info.color}`, borderRadius: '6px', padding: '14px' }}>
          <div style={{ color: info.color, fontWeight: 'bold', fontSize: '17px', marginBottom: '8px' }}>{info.nombre}</div>
          <div style={{ marginBottom: '8px' }}>{info.descripcion}</div>
          <div style={{ fontSize: '12px', color: '#90a4ae' }}>Ejemplos: {info.ejemplos}</div>
        </div>
      )}

      <div style={{ marginTop: '12px' }}>
        {terminado && <button onClick={reiniciar} style={btn('#ef5350', true)}>🔄 Volver a empezar</button>}
        {!terminado && paso > 0 && <button onClick={() => setPaso(paso - 1)} style={btn('#64b5f6', false)}>« Anterior</button>}
      </div>
    </div>
  );
}