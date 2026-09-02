---
sidebar_position: 2
---

# Simulador Avanzado de Gestión de Procesos

import SimuladorAvanzado from '@site/src/components/SimuladorAvanzado';

## 🚀 Simulador interactivo completo

Aquí puedes experimentar con un **simulador profesional** que incluye:

✅ **Temporizador automático** — Los procesos se ejecutan en tiempo real  
✅ **Algoritmos de planificación** — FIFO, Priority, SJF  
✅ **Estados detallados** — Nuevo, Ejecutando, Bloqueado, Finalizado  
✅ **Gráfico en vivo** — Historial de uso de RAM  
✅ **Pausar/Reanudar** — Control total de la simulación  
✅ **Generar procesos aleatorios** — Para pruebas rápidas  
✅ **Exportar reporte** — Descargar datos en JSON  
✅ **Prioridades** — Soporte para procesos prioritarios  

---

<SimuladorAvanzado />

---

## Cómo usarlo

### 1️⃣ Crear un proceso manualmente
Rellena el formulario con:
- **Nombre**: Identificador del proceso
- **Memoria**: Cuántos MB necesita
- **Duración**: Cuántos segundos se ejecutará
- **Prioridad**: Nivel de prioridad (1-5, siendo 1 la más alta)

### 2️⃣ Generar procesos aleatorios
Usa el botón **🎲 Generar** para crear varios procesos automáticamente.

### 3️⃣ Cambiar algoritmo de planificación
Selecciona entre:
- **FIFO** (First In, First Out) — Procesa en orden de llegada
- **Priority** — Procesa por prioridad
- **SJF** (Shortest Job First) — Procesa tareas cortas primero

### 4️⃣ Aplicar algoritmo
Haz clic en **🔄 Aplicar** para reorganizar la cola según el algoritmo seleccionado.

### 5️⃣ Pausar la simulación
Usa **⏸️ Pausar** para detener temporalmente la ejecución.

### 6️⃣ Exportar reporte
Descarga un archivo JSON con el historial completo usando **💾 Exportar**.

### 7️⃣ Limpiar todo
Reinicia la simulación con **🗑️ Limpiar**.

---

## Conceptos representados

### Estados de procesos
- 🟣 **Nuevo** — Acaba de crearse
- 🟢 **Ejecutando** — Usando CPU y RAM
- 🟡 **Bloqueado** — Esperando recursos
- 🔵 **Finalizado** — Terminó y liberó memoria

### Uso de RAM
- 🟢 **Verde** (0-60%) — Memoria disponible
- 🟡 **Amarillo** (60-85%) — Memoria alta
- 🔴 **Rojo** (85-100%) — Memoria crítica

### Cola de espera
Si la memoria se agota, los nuevos procesos van a la **cola de espera** hasta que haya espacio.

---

## Algoritmos de planificación

### FIFO (First In, First Out)
Los procesos se ejecutan en el orden que llegan. **Ventaja:** simple. **Desventaja:** procesos largos bloquean a otros.

### Priority (Prioridad)
Se ejecutan primero los de mayor prioridad. **Ventaja:** respeta importancia. **Desventaja:** puede haber inanición (procesos bajos nunca se ejecutan).

### SJF (Shortest Job First)
Se ejecutan primero los procesos más cortos. **Ventaja:** menor tiempo medio. **Desventaja:** favorece procesos cortos.

---

## Conexión con conceptos reales

Lo que ves aquí sucede también en un **Sistema Operativo real**:

| En el simulador | En el SO real (Linux/Windows) |
|-----------------|-------------------------------|
| Crear proceso | `fork()` / `CreateProcess()` |
| Usar memoria | Stack + Heap allocation |
| Ejecutar | Cambio de contexto (context switch) |
| Terminar | `exit()` + liberación de memoria |
| Algoritmos | Kernel scheduler (CFS, Round Robin, etc.) |

---

## Exportar reporte

Cuando hagas clic en **💾 Exportar**, se descarga un archivo `reporte-simulador-TIMESTAMP.json` con:
- Tiempo total de simulación
- Procesos finalizados
- Historial de uso de RAM
- Algoritmo utilizado

Puedes abrir este archivo en cualquier editor de texto o analizarlo en herramientas como Excel.
