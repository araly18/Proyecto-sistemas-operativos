---
sidebar_position: 1
---

# 💳 Motor de Transacciones Bancarias Concurrentes

## Detector Automático de Deadlocks (Interbloqueos)

**Proyecto 2 - Entregable 1 & 2**

import MotorTransaccionesAvanzado from '@site/src/components/MotorTransaccionesAvanzado';

<MotorTransaccionesAvanzado />

---

## 📚 Cómo Funciona

### **Arquitectura del Sistema**

```
┌────────────────────────────────────────────────┐
│   4 CUENTAS BANCARIAS CON LOCKS                │
├────────────────────────────────────────────────┤
│  Cuenta A  │  Cuenta B  │  Cuenta C  │  Cuenta D│
│  Q 1000.00 │  Q 1000.00 │  Q 1000.00 │  Q 1000.00
│  Lock: 🔓  │  Lock: 🔓  │  Lock: 🔓  │  Lock: 🔓
└────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────┐
│   TRANSACCIONES CONCURRENTES                   │
│   T1: A → B (Q 150)                            │
│   T2: B → C (Q 200)                            │
│   T3: D → A (Q 100)                            │
└────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────┐
│   DETECTOR DE DEADLOCKS (GRAFO RAG)            │
│   - Construye grafo de espera                  │
│   - Busca ciclos (T1 → T2 → T1)                │
│   - Resuelve abortando transacción reciente    │
└────────────────────────────────────────────────┘
```

---

## 🔒 Sistema de Locks

**Cada cuenta tiene un lock (mutex) que protege su saldo.**

### Orden de adquisición:
1. **Intenta adquirir lock de cuenta ORIGEN**
2. Si éxito → **Intenta adquirir lock de cuenta DESTINO**
3. Si ambos → **Ejecuta transferencia**
4. **Libera ambos locks**

### Estados de una transacción:
- 🟣 **Esperando**: No ha comenzado
- 🟡 **Bloqueada**: Esperando por un lock
- 🟢 **En progreso**: Tiene ambos locks
- ✅ **Exitosa**: Completó la transferencia
- ❌ **Abortada**: Cancelada por deadlock

---

## 💥 ¿Qué es un Deadlock?

**Ciclo de espera circular donde dos o más transacciones esperan infinitamente:**

```
Escenario de DEADLOCK:

Transacción 1: Cuenta A → Cuenta B
Transacción 2: Cuenta B → Cuenta A

Tiempo T1:
  T1 adquiere Lock_A
  T2 adquiere Lock_B

Tiempo T2:
  T1 intenta adquirir Lock_B (está ocupado, espera)
  T2 intenta adquirir Lock_A (está ocupado, espera)

RESULTADO:
  T1 espera a T2
  T2 espera a T1
  ↳ DEADLOCK CIRCULAR ∞
```

### Grafo de Espera (RAG):
```
T1 → R_B
R_B → T2
T2 → R_A
R_A → T1
↓
CICLO DETECTADO = DEADLOCK
```

---

## 🔍 Detección Automática

### **Algoritmo DFS (Depth-First Search)**

El sistema busca ciclos en el grafo de asignación de recursos:

1. **Construye el grafo RAG**
   - Nodos: Transacciones (T#) y Recursos/Cuentas (R#)
   - Aristas:
     - T → R: Transacción ESPERA recurso
     - R → T: Transacción POSEE recurso

2. **Ejecuta DFS para encontrar back-edges**
   - Back-edge = Ciclo
   - Si encuentra ciclo → Deadlock

3. **Resuelve automáticamente**
   - Aborta la transacción MÁS RECIENTE en el ciclo
   - Libera sus locks
   - La otra transacción continúa

---

## ⚡ Recuperación de Deadlock

Cuando se detecta un ciclo:

```
ANTES (Deadlock):
  T1: Locks=[A], Esperando=[B]
  T2: Locks=[B], Esperando=[A]
  ↳ Ambas bloqueadas para siempre

DETECCIÓN:
  DFS encuentra ciclo T1 → T2 → T1

RESOLUCIÓN:
  1. Identifica T2 (más reciente)
  2. Aborta T2
  3. Libera Lock_B de T2
  4. T1 adquiere Lock_B
  5. T1 completa exitosamente

DESPUÉS (Resuelto):
  T1: ✅ Exitosa
  T2: ❌ Abortada (puede reintentar)
```

---

## 🎮 Cómo Usar el Simulador

### **1. Crear Transferencias Manualmente**
- Selecciona Cuenta Origen
- Selecciona Cuenta Destino
- Ingresa Monto
- Click "💸 Transferir"

### **2. Generar Transferencias Aleatorias**
- Click "🎲 Aleatorio"
- Crea 3 transferencias simultáneas

### **3. Pausar/Reanudar**
- Click "⏸️ Pausar" para pausar la simulación
- Click "▶️ Reanudar" para continuar

### **4. Observar en Tiempo Real**
- **Tabla de Cuentas**: Qué está bloqueado
- **Grafo RAG**: Quién espera a quién
- **Transacciones Activas**: Estado de cada una
- **Alerta Roja**: Cuando hay deadlock

### **5. Ver Historial**
- Las últimas 8 transacciones completadas
- Marca si fueron ✅ Exitosas o ❌ Abortadas

---

## 📊 Invariante de Integridad

**El dinero total del banco NUNCA cambia:**

```
Saldo Total Inicial = 4 cuentas × Q 1000 = Q 4000

Durante toda la simulación:
  - Con transacciones exitosas ✅
  - Con deadlocks detectados 💥
  - Con transacciones abortadas ❌

Saldo Total Final = Q 4000 (SIEMPRE)
```

**¿Por qué?** Los locks garantizan que cada transferencia es atómica (todo o nada).

---

## 🎯 Conceptos Demostrados

✅ **Concurrencia** - Múltiples transacciones simultáneas  
✅ **Mutual Exclusion** - Locks protegiendo recursos  
✅ **Race Conditions** - Contención sobre saldos  
✅ **Deadlock** - Ciclo de espera circular  
✅ **Resource Allocation Graph (RAG)** - Visualización de dependencias  
✅ **Cycle Detection** - DFS para encontrar ciclos  
✅ **Recovery** - Abort and Retry (compensación)  
✅ **Atomicity** - Transferencias "todo o nada"  

---

## 🔴 Cuando Ocurren Deadlocks

Los deadlocks son **más probables cuando:**

1. **Muchas transacciones simultáneas** (muchas T's)
2. **Órdenes de locks opuestos** (A→B vs B→A)
3. **Tiempos de ejecución variables**

**Probabilidad baja pero NO CERO** → Por eso es crítico detectar y resolver

---

## 📈 Estadísticas

El panel muestra:

- **✅ Exitosas**: Transferencias completadas sin problema
- **❌ Abortadas**: Canceladas por deadlock (pueden reintentar)
- **📊 En proceso**: Esperando por locks o ejecutándose

---

## 🚀 Entregables Completados

**Entregable 0:** ✅ Propuesta del proyecto  
**Entregable 1:** ✅ Motor con detección de deadlocks  
**Entregable 2:** ✅ Visualización de RAG + Recuperación automática  
**Entregable 3:** ⏳ Documentación completa en Wiki  

---

## 💡 Conexión con Unidad 4

**Unidad 4 (Deadlocks) Cubre:**
- Condiciones de Coffman (4 necesarias para deadlock)
- Prevención vs Detección vs Recuperación
- Resource Allocation Graph (RAG)
- Algoritmos de detección

**Este simulador demuestra TODO esto en vivo** 🎯

---

## 📝 Notas Técnicas

- El sistema es **completamente seguro contra race conditions**
- Deadlocks se resuelven **automáticamente** sin intervención
- El dashboard se actualiza **en tiempo real**
- Los saldos son **atómicamente actualizados**
- La recuperación es **no-preemptive** (aborta, no roba recursos)

---

**¡Experimenta con el simulador y observa cómo se detectan y resuelven los deadlocks! 🎮**
