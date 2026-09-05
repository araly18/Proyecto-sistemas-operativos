import React, { useState } from 'react';
import Link from '@docusaurus/Link';

export default function HomePage() {
  const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);

  const unidades = [
    {
      numero: 1,
      titulo: 'Introducción',
      subtitulo: 'Conceptos fundamentales del SO',
      icono: '📚',
      color: '#80deea',
      link: '/docs/unidad-1-introduccion/intro'
    },
    {
      numero: 2,
      titulo: 'Procesos & Control',
      subtitulo: 'System Calls + Simulador',
      icono: '⚙️',
      color: '#81c784',
      link: '/docs/unidad-2-procesos/system-calls'
    },
    {
      numero: 3,
      titulo: 'Concurrencia',
      subtitulo: 'Sincronización de procesos',
      icono: '🔄',
      color: '#ffb74d',
      link: '#'
    },
    {
      numero: 4,
      titulo: 'Deadlocks',
      subtitulo: 'Interbloqueos y prevención',
      icono: '🔗',
      color: '#ef5350',
      link: '#'
    },
    {
      numero: 5,
      titulo: 'Memoria',
      subtitulo: 'Administración de RAM',
      icono: '💾',
      color: '#ba68c8',
      link: '#'
    }
  ];

  return (
    <div style={{ 
      backgroundColor: '#263238', 
      color: '#b0bec5', 
      minHeight: '100vh', 
      padding: '40px 20px',
      fontFamily: 'Courier New, monospace'
    }}>
      
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: '60px', textAlign: 'center' }}>
          <h1 style={{ color: '#80deea', fontSize: '48px', marginBottom: '10px' }}>
            SISTEMAS OPERATIVOS 1
          </h1>
          <p style={{ color: '#fff59d', fontSize: '18px' }}>
            Aprende cómo funcionan los SO de forma interactiva y práctica
          </p>
        </div>

        {/* CONTENEDOR PRINCIPAL */}
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* LADO IZQUIERDO - UNIDADES */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
            
            {unidades.map((unidad) => (
              <Link
                key={unidad.numero}
                href={unidad.link}
                style={{ textDecoration: 'none' }}
              >
                <div
                  onMouseEnter={() => setUnidadSeleccionada(unidad.numero)}
                  onMouseLeave={() => setUnidadSeleccionada(null)}
                  style={{
                    backgroundColor: '#37474f',
                    border: `2px solid ${unidad.color}`,
                    padding: '20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: unidadSeleccionada === unidad.numero ? 'translateX(10px)' : 'translateX(0)',
                    boxShadow: unidadSeleccionada === unidad.numero 
                      ? `0 0 20px ${unidad.color}40` 
                      : 'none',
                    borderLeft: `4px solid ${unidad.color}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ fontSize: '32px' }}>{unidad.icono}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        color: unidad.color, 
                        fontSize: '18px', 
                        fontWeight: 'bold',
                        marginBottom: '5px'
                      }}>
                        Unidad {unidad.numero}: {unidad.titulo}
                      </div>
                      <div style={{ color: '#90a4ae', fontSize: '14px' }}>
                        {unidad.subtitulo}
                      </div>
                    </div>
                    <div style={{ color: unidad.color, fontSize: '20px' }}>→</div>
                  </div>
                </div>
              </Link>
            ))}

          </div>

          {/* LADO DERECHO - COMPUTADORA */}
          <div style={{ flex: 0.5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg 
              viewBox="0 0 200 180" 
              style={{ 
                width: '280px', 
                height: '280px',
                filter: 'drop-shadow(0 0 20px rgba(128, 222, 234, 0.3))'
              }}
            >
              {/* Monitor */}
              <rect 
                x="30" y="20" width="140" height="100" 
                fill="#455a64" 
                stroke="#80deea" 
                strokeWidth="2" 
                rx="5"
              />
              
              {/* Pantalla */}
              <rect 
                x="35" y="25" width="130" height="90" 
                fill="#1a1a1a" 
                rx="3"
              />
              
              {/* Líneas de código en pantalla */}
              <line x1="40" y1="35" x2="155" y2="35" stroke="#81c784" strokeWidth="1" opacity="0.6" />
              <line x1="40" y1="45" x2="145" y2="45" stroke="#81c784" strokeWidth="1" opacity="0.4" />
              <line x1="40" y1="55" x2="150" y2="55" stroke="#81c784" strokeWidth="1" opacity="0.6" />
              <line x1="40" y1="65" x2="140" y2="65" stroke="#ffb74d" strokeWidth="1" opacity="0.5" />
              <line x1="40" y1="75" x2="155" y2="75" stroke="#81c784" strokeWidth="1" opacity="0.4" />
              <line x1="40" y1="85" x2="145" y2="85" stroke="#ffb74d" strokeWidth="1" opacity="0.6" />
              <line x1="40" y1="95" x2="150" y2="95" stroke="#81c784" strokeWidth="1" opacity="0.5" />
              <line x1="40" y1="105" x2="135" y2="105" stroke="#81c784" strokeWidth="1" opacity="0.4" />
              
              {/* Base del monitor */}
              <rect 
                x="60" y="120" width="80" height="8" 
                fill="#455a64" 
                stroke="#80deea" 
                strokeWidth="1"
              />
              
              {/* Soporte */}
              <rect 
                x="85" y="128" width="30" height="25" 
                fill="#37474f" 
                stroke="#546e7a" 
                strokeWidth="1"
                rx="2"
              />
              
              {/* Indicador de energía */}
              <circle 
                cx="100" cy="160" r="4" 
                fill="#81c784" 
                opacity="0.8"
              />
              
              {/* Texto indicador */}
              <text 
                x="100" y="175" 
                textAnchor="middle" 
                fill="#80deea" 
                fontSize="12"
                fontFamily="monospace"
              >
                ON
              </text>
            </svg>
          </div>

        </div>

        {/* FOOTER CON STATS */}
        <div style={{ marginTop: '80px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', textAlign: 'center' }}>
          
          <div style={{ backgroundColor: '#37474f', padding: '20px', borderRadius: '8px', borderTop: '3px solid #80deea' }}>
            <div style={{ fontSize: '32px', color: '#80deea', fontWeight: 'bold' }}>5</div>
            <div style={{ color: '#90a4ae' }}>Unidades completas</div>
          </div>

          <div style={{ backgroundColor: '#37474f', padding: '20px', borderRadius: '8px', borderTop: '3px solid #81c784' }}>
            <div style={{ fontSize: '32px', color: '#81c784', fontWeight: 'bold' }}>∞</div>
            <div style={{ color: '#90a4ae' }}>Simulador interactivo</div>
          </div>

          <div style={{ backgroundColor: '#37474f', padding: '20px', borderRadius: '8px', borderTop: '3px solid #ffb74d' }}>
            <div style={{ fontSize: '32px', color: '#ffb74d', fontWeight: 'bold' }}>📋</div>
            <div style={{ color: '#90a4ae' }}>Prácticas en VM</div>
          </div>

        </div>

        {/* INFO FINAL */}
        <div style={{ marginTop: '60px', textAlign: 'center', borderTop: '1px solid #546e7a', paddingTop: '30px' }}>
          <p style={{ color: '#90a4ae', marginBottom: '10px' }}>
            Desarrollado por: <span style={{ color: '#80deea' }}>Herny & Cristian</span>
          </p>
          <p style={{ color: '#546e7a', fontSize: '12px' }}>
            Wiki colaborativa de Sistemas Operativos 1
          </p>
        </div>

      </div>

    </div>
  );
}
