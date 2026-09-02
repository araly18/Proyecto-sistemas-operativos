import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SimuladorAvanzado() {
  // ==================== ESTADO ====================
  const [procesos, setProcesos] = useState([]);
  const [cola, setCola] = useState([]);
  const [finalizados, setFinalizados] = useState([]);
  const [ramDisponible, setRamDisponible] = useState(1024);
  const [pidContador, setPidContador] = useState(1);
  const [tiempoTotal, setTiempoTotal] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [algoritmo, setAlgoritmo] = useState('FIFO');
  const [historialRAM, setHistorialRAM] = useState([]);
  const [procesoActual, setProcesoActual] = useState(null);

  const RAM_TOTAL = 1024;
  const ramUsada = RAM_TOTAL - ramDisponible;
  const porcentaje = Math.round((ramUsada / RAM_TOTAL) * 100);

  // ==================== EFECTO PRINCIPAL - TEMPORIZADOR ====================
  useEffect(() => {
    if (pausado || (procesos.length === 0 && cola.length === 0)) return;

    const intervalo = setInterval(() => {
      setTiempoTotal(t => t + 1);

      // Actualizar duración de procesos ejecutando
      setProcesos(prevProcesos => {
        const actualizados = prevProcesos.map(p => ({
          ...p,
          tiempoRestante: Math.max(0, (p.tiempoRestante || p.duracion) - 1)
        }));

        // Verificar procesos terminados
        const terminados = actualizados.filter(p => p.tiempoRestante === 0);
        const activos = actualizados.filter(p => p.tiempoRestante > 0);

        terminados.forEach(p => {
          setRamDisponible(prev => prev + p.memoria);
          setFinalizados(prev => [...prev, { ...p, estado: 'finalizado' }].slice(-10));
        });

        setProcesos(activos);
        return activos;
      });

      // Registrar historial de RAM cada 5 segundos
      if (tiempoTotal % 5 === 0) {
        setHistorialRAM(prev => [...prev, { tiempo: tiempoTotal, ram: ramUsada }].slice(-50));
      }
    }, 1000);

    return () => clearInterval(intervalo);
  }, [pausado, tiempoTotal, ramUsada]);

  // ==================== FUNCIONES ====================
  const crearProceso = (e) => {
    e.preventDefault();
    const nombre = e.target.nombre.value || `Proc_${pidContador}`;
    const memoria = parseInt(e.target.memoria.value);
    const duracion = parseInt(e.target.duracion.value);
    const prioridad = parseInt(e.target.prioridad.value) || 1;

    const nuevoProceso = {
      pid: pidContador,
      nombre,
      memoria,
      duracion,
      tiempoRestante: duracion,
      prioridad,
      estado: 'nuevo',
      tiempoLlegada: tiempoTotal
    };

    setPidContador(pidContador + 1);

    if (memoria <= ramDisponible) {
      setProcesos([...procesos, { ...nuevoProceso, estado: 'ejecutando' }]);
      setRamDisponible(ramDisponible - memoria);
      setProcesoActual(nuevoProceso.pid);
    } else {
      setCola([...cola, nuevoProceso]);
    }

    e.target.reset();
  };

  const generarAleatorios = () => {
    const cantidad = parseInt(prompt('¿Cuántos procesos aleatorios?') || '5');
    const nombres = ['Chrome', 'Firefox', 'VSCode', 'Git', 'Python', 'Java', 'MySQL', 'Node', 'Spotify', 'Discord'];

    for (let i = 0; i < cantidad; i++) {
      const nombre = nombres[Math.floor(Math.random() * nombres.length)];
      const memoria = Math.floor(Math.random() * 400) + 64; // 64-464 MB
      const duracion = Math.floor(Math.random() * 15) + 3; // 3-18 seg
      const prioridad = Math.floor(Math.random() * 5) + 1;

      const nuevoProceso = {
        pid: pidContador + i,
        nombre: `${nombre}_${i + 1}`,
        memoria,
        duracion,
        tiempoRestante: duracion,
        prioridad,
        estado: 'nuevo',
        tiempoLlegada: tiempoTotal
      };

      if (memoria <= ramDisponible) {
        setProcesos(prev => [...prev, { ...nuevoProceso, estado: 'ejecutando' }]);
        setRamDisponible(prev => prev - memoria);
      } else {
        setCola(prev => [...prev, nuevoProceso]);
      }
    }

    setPidContador(pidContador + cantidad);
  };

  const aplicarAlgoritmo = () => {
    if (cola.length === 0 || ramDisponible === 0) return;

    let procesosOrdenados = [...cola];

    if (algoritmo === 'FIFO') {
      // Ya está ordenado
    } else if (algoritmo === 'Priority') {
      procesosOrdenados.sort((a, b) => a.prioridad - b.prioridad);
    } else if (algoritmo === 'SJF') {
      procesosOrdenados.sort((a, b) => a.duracion - b.duracion);
    }

    // Intentar ejecutar procesos de la cola
    const nuevosEnEjecucion = [];
    const nuevaCola = [];

    for (let p of procesosOrdenados) {
      if (p.memoria <= ramDisponible) {
        nuevosEnEjecucion.push({ ...p, estado: 'ejecutando' });
        setRamDisponible(prev => prev - p.memoria);
      } else {
        nuevaCola.push(p);
      }
    }

    setProcesos(prev => [...prev, ...nuevosEnEjecucion]);
    setCola(nuevaCola);
  };

  const terminarProceso = (pid) => {
    const proceso = procesos.find(p => p.pid === pid);
    if (proceso) {
      setProcesos(procesos.filter(p => p.pid !== pid));
      setRamDisponible(ramDisponible + proceso.memoria);
      setFinalizados([...finalizados, { ...proceso, estado: 'finalizado' }]);
    }
  };

  const limpiar = () => {
    setProcesos([]);
    setCola([]);
    setFinalizados([]);
    setRamDisponible(1024);
    setPidContador(1);
    setTiempoTotal(0);
    setPausado(false);
    setHistorialRAM([]);
    setProcesoActual(null);
  };

  const exportarReporte = () => {
    const reporte = {
      timestamp: new Date().toLocaleString(),
      tiempoTotal,
      ramFinal: ramDisponible,
      algoritmo,
      procesosFinalizados: finalizados.length,
      procesos: finalizados,
      historialRAM
    };

    const json = JSON.stringify(reporte, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-simulador-${Date.now()}.json`;
    a.click();
  };

  const getColorRam = () => {
    if (porcentaje < 60) return '#00ff00';
    if (porcentaje < 85) return '#ffff00';
    return '#ff0000';
  };

  const getColorEstado = (estado) => {
    const colores = {
      'nuevo': '#9900ff',
      'ejecutando': '#00ff00',
      'bloqueado': '#ffff00',
      'finalizado': '#00ffff'
    };
    return colores[estado] || '#ffffff';
  };

  return (
    <div style={{ fontFamily: 'Courier New, monospace', color: '#00ff00', backgroundColor: '#0a0a0a', padding: '20px', borderRadius: '8px', marginTop: '20px', border: '2px solid #00ff00' }}>
      <h2 style={{ color: '#00ffff', textAlign: 'center' }}>🚀 SIMULADOR AVANZADO DE GESTIÓN DE PROCESOS</h2>

      {/* ==================== PANEL DE CONTROL ==================== */}
      <div style={{ backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #00ff00' }}>
        <h3 style={{ color: '#ffff00', marginTop: '0' }}>⚙️ Panel de Control</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '10px' }}>
          <div>
            <label style={{ color: '#00ffff' }}>Algoritmo: </label>
            <select value={algoritmo} onChange={(e) => setAlgoritmo(e.target.value)} style={{ backgroundColor: '#1e1e1e', color: '#00ff00', border: '1px solid #00ff00', padding: '5px', width: '100%' }}>
              <option>FIFO</option>
              <option>Priority</option>
              <option>SJF</option>
            </select>
          </div>
          <div>
            <button onClick={() => setPausado(!pausado)} style={{ backgroundColor: pausado ? '#ff6600' : '#00ff00', color: '#000', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
              {pausado ? '▶️ Reanudar' : '⏸️ Pausar'}
            </button>
          </div>
          <div>
            <button onClick={generarAleatorios} style={{ backgroundColor: '#0066ff', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
              🎲 Generar
            </button>
          </div>
          <div>
            <button onClick={aplicarAlgoritmo} style={{ backgroundColor: '#ff00ff', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
              🔄 Aplicar
            </button>
          </div>
          <div>
            <button onClick={exportarReporte} style={{ backgroundColor: '#00cccc', color: '#000', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
              💾 Exportar
            </button>
          </div>
          <div>
            <button onClick={limpiar} style={{ backgroundColor: '#ff0000', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
              🗑️ Limpiar
            </button>
          </div>
        </div>
        <div style={{ fontSize: '12px', color: '#ffff00' }}>
          ⏱️ Tiempo: {tiempoTotal}s | 💾 Procesos finalizados: {finalizados.length} | 🔄 En cola: {cola.length}
        </div>
      </div>

      {/* ==================== BARRA RAM ==================== */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ color: '#00ffff' }}>📊 Uso de RAM</span>
          <span style={{ color: '#ffff00' }}>{ramUsada}MB / {RAM_TOTAL}MB ({porcentaje}%)</span>
        </div>
        <div style={{ backgroundColor: '#333', width: '100%', height: '40px', borderRadius: '4px', border: '2px solid #00ff00', overflow: 'hidden' }}>
          <div style={{ width: `${(porcentaje / 100) * 100}%`, height: '100%', backgroundColor: getColorRam(), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold', fontSize: '14px', transition: 'all 0.3s ease' }}>
            {porcentaje}%
          </div>
        </div>
      </div>

      {/* ==================== GRÁFICO RAM ==================== */}
      {historialRAM.length > 0 && (
        <div style={{ marginBottom: '20px', backgroundColor: '#1a1a1a', padding: '10px', borderRadius: '4px', border: '1px solid #00ff00' }}>
          <h4 style={{ color: '#00ffff', marginTop: '0' }}>📈 Historial de RAM</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={historialRAM}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="tiempo" stroke="#00ff00" />
              <YAxis stroke="#00ff00" domain={[0, 1024]} />
              <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #00ff00', color: '#00ff00' }} />
              <Legend />
              <Line type="monotone" dataKey="ram" stroke="#00ff00" dot={false} name="RAM usada (MB)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ==================== FORMULARIO CREAR PROCESO ==================== */}
      <div style={{ backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #ffff00' }}>
        <h3 style={{ color: '#ffff00', marginTop: '0' }}>➕ Crear nuevo proceso</h3>
        <form onSubmit={crearProceso}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label style={{ color: '#00ffff' }}>Nombre: </label>
              <input type="text" name="nombre" placeholder="Mi_App" style={{ backgroundColor: '#1e1e1e', color: '#00ff00', border: '1px solid #00ff00', padding: '8px', width: '100%', boxSizing: 'border-box', fontFamily: 'Courier New, monospace' }} />
            </div>
            <div>
              <label style={{ color: '#00ffff' }}>Memoria (MB): </label>
              <input type="number" name="memoria" defaultValue="256" min="1" max="1024" style={{ backgroundColor: '#1e1e1e', color: '#00ff00', border: '1px solid #00ff00', padding: '8px', width: '100%', boxSizing: 'border-box', fontFamily: 'Courier New, monospace' }} />
            </div>
            <div>
              <label style={{ color: '#00ffff' }}>Duración (s): </label>
              <input type="number" name="duracion" defaultValue="5" min="1" max="60" style={{ backgroundColor: '#1e1e1e', color: '#00ff00', border: '1px solid #00ff00', padding: '8px', width: '100%', boxSizing: 'border-box', fontFamily: 'Courier New, monospace' }} />
            </div>
            <div>
              <label style={{ color: '#00ffff' }}>Prioridad (1-5): </label>
              <input type="number" name="prioridad" defaultValue="1" min="1" max="5" style={{ backgroundColor: '#1e1e1e', color: '#00ff00', border: '1px solid #00ff00', padding: '8px', width: '100%', boxSizing: 'border-box', fontFamily: 'Courier New, monospace' }} />
            </div>
          </div>
          <button type="submit" style={{ backgroundColor: '#00ff00', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>➕ Crear proceso</button>
        </form>
      </div>

      {/* ==================== PROCESOS EN EJECUCIÓN ==================== */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#00ffff' }}>▶️ Procesos en ejecución ({procesos.length})</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#0066ff', color: '#fff' }}>
                <th style={{ border: '1px solid #00ff00', padding: '8px', textAlign: 'left' }}>PID</th>
                <th style={{ border: '1px solid #00ff00', padding: '8px', textAlign: 'left' }}>Nombre</th>
                <th style={{ border: '1px solid #00ff00', padding: '8px', textAlign: 'left' }}>Estado</th>
                <th style={{ border: '1px solid #00ff00', padding: '8px', textAlign: 'left' }}>Memoria (MB)</th>
                <th style={{ border: '1px solid #00ff00', padding: '8px', textAlign: 'left' }}>Duración</th>
                <th style={{ border: '1px solid #00ff00', padding: '8px', textAlign: 'left' }}>Prioridad</th>
                <th style={{ border: '1px solid #00ff00', padding: '8px', textAlign: 'left' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {procesos.length === 0 ? (
                <tr><td colSpan="7" style={{ border: '1px solid #444', padding: '8px', textAlign: 'center', color: '#888' }}>— Ninguno —</td></tr>
              ) : (
                procesos.map(p => (
                  <tr key={p.pid} style={{ backgroundColor: '#1a4d1a', borderLeft: `3px solid ${getColorEstado(p.estado)}` }}>
                    <td style={{ border: '1px solid #444', padding: '8px' }}>{p.pid}</td>
                    <td style={{ border: '1px solid #444', padding: '8px' }}>{p.nombre}</td>
                    <td style={{ border: '1px solid #444', padding: '8px', color: getColorEstado(p.estado) }}>{p.estado}</td>
                    <td style={{ border: '1px solid #444', padding: '8px' }}>{p.memoria}</td>
                    <td style={{ border: '1px solid #444', padding: '8px' }}>{p.tiempoRestante}s / {p.duracion}s</td>
                    <td style={{ border: '1px solid #444', padding: '8px' }}>⭐{p.prioridad}</td>
                    <td style={{ border: '1px solid #444', padding: '8px' }}>
                      <button onClick={() => terminarProceso(p.pid)} style={{ backgroundColor: '#ff0000', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '2px', cursor: 'pointer', fontSize: '10px' }}>✕</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== COLA DE ESPERA ==================== */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#ffff00' }}>⏳ Cola de espera ({cola.length})</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#664400', color: '#fff' }}>
                <th style={{ border: '1px solid #ffff00', padding: '8px', textAlign: 'left' }}>PID</th>
                <th style={{ border: '1px solid #ffff00', padding: '8px', textAlign: 'left' }}>Nombre</th>
                <th style={{ border: '1px solid #ffff00', padding: '8px', textAlign: 'left' }}>Memoria (MB)</th>
                <th style={{ border: '1px solid #ffff00', padding: '8px', textAlign: 'left' }}>Duración</th>
                <th style={{ border: '1px solid #ffff00', padding: '8px', textAlign: 'left' }}>Prioridad</th>
              </tr>
            </thead>
            <tbody>
              {cola.length === 0 ? (
                <tr><td colSpan="5" style={{ border: '1px solid #444', padding: '8px', textAlign: 'center', color: '#888' }}>— Ninguno —</td></tr>
              ) : (
                cola.map(p => (
                  <tr key={p.pid} style={{ backgroundColor: '#4d3300' }}>
                    <td style={{ border: '1px solid #444', padding: '8px' }}>{p.pid}</td>
                    <td style={{ border: '1px solid #444', padding: '8px' }}>{p.nombre}</td>
                    <td style={{ border: '1px solid #444', padding: '8px' }}>{p.memoria}</td>
                    <td style={{ border: '1px solid #444', padding: '8px' }}>{p.duracion}s</td>
                    <td style={{ border: '1px solid #444', padding: '8px' }}>⭐{p.prioridad}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== PROCESOS FINALIZADOS ==================== */}
      <div>
        <h3 style={{ color: '#00ffff' }}>✔️ Procesos finalizados ({finalizados.length})</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#333333', color: '#fff' }}>
                <th style={{ border: '1px solid #888', padding: '8px', textAlign: 'left' }}>PID</th>
                <th style={{ border: '1px solid #888', padding: '8px', textAlign: 'left' }}>Nombre</th>
                <th style={{ border: '1px solid #888', padding: '8px', textAlign: 'left' }}>Memoria (MB)</th>
                <th style={{ border: '1px solid #888', padding: '8px', textAlign: 'left' }}>Tiempo exec</th>
              </tr>
            </thead>
            <tbody>
              {finalizados.length === 0 ? (
                <tr><td colSpan="4" style={{ border: '1px solid #444', padding: '8px', textAlign: 'center', color: '#888' }}>— Ninguno —</td></tr>
              ) : (
                finalizados.map(p => (
                  <tr key={p.pid} style={{ backgroundColor: '#3d3d3d' }}>
                    <td style={{ border: '1px solid #444', padding: '8px' }}>{p.pid}</td>
                    <td style={{ border: '1px solid #444', padding: '8px' }}>{p.nombre}</td>
                    <td style={{ border: '1px solid #444', padding: '8px' }}>{p.memoria}</td>
                    <td style={{ border: '1px solid #444', padding: '8px' }}>{p.duracion}s</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
