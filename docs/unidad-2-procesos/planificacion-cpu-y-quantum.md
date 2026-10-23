---
sidebar_position: 5
---

# Planificación de CPU y quantum de tiempo

La planificación de CPU decide qué proceso o hilo listo recibe el procesador. En sistemas multitarea, esta decisión influye en la capacidad de respuesta, el tiempo de espera y el aprovechamiento de la CPU.

## Round Robin

**Round Robin (RR)** es un algoritmo preventivo que organiza los procesos listos en una cola circular. Cada proceso recibe la CPU durante un intervalo máximo llamado **quantum** o cuanto de tiempo. Si no termina ni se bloquea antes de que venza el quantum, el sistema lo interrumpe y lo coloca al final de la cola de listos.

## Ejemplo paso a paso

Supongamos tres procesos que llegan al mismo tiempo y necesitan CPU durante estos intervalos:

| Proceso | Tiempo de CPU requerido |
|---|---:|
| P1 | 5 unidades |
| P2 | 3 unidades |
| P3 | 1 unidad |

Con un quantum de 2 unidades, y sin considerar el costo de los cambios de contexto, la secuencia sería:

```text
0–2  P1 (restan 3)
2–4  P2 (resta 1)
4–5  P3 (termina)
5–7  P1 (resta 1)
7–8  P2 (termina)
8–9  P1 (termina)
```

El orden real puede cambiar si los procesos llegan en momentos diferentes o se bloquean por E/S. Este ejemplo solo muestra la mecánica básica.

## ¿Qué pasa si cambia el quantum?

| Quantum | Ventajas | Desventajas |
|---|---|---|
| Muy pequeño | Respuesta interactiva potencialmente más rápida | Más interrupciones y cambios de contexto; mayor overhead |
| Muy grande | Menos cambios de contexto | Round Robin se aproxima a FCFS; algunos procesos cortos pueden esperar más |
| Intermedio | Equilibra respuesta y costo administrativo | No existe un valor óptimo para todas las cargas |

El quantum no es lo mismo que el tiempo total que necesita un proceso. Es el máximo tiempo de CPU que recibe en un turno antes de volver a competir por el procesador.

## Métricas útiles

- **Tiempo de espera:** tiempo total que un proceso pasa en la cola de listos.
- **Tiempo de retorno (*turnaround*):** tiempo desde la llegada hasta la terminación.
- **Tiempo de respuesta:** tiempo hasta la primera respuesta o primera asignación de CPU, según la definición usada.
- **Throughput:** cantidad de trabajos completados por unidad de tiempo.

Un algoritmo puede mejorar una métrica y empeorar otra; la elección depende del tipo de sistema y sus objetivos.

## Referencias

- Arpaci-Dusseau, R. y Arpaci-Dusseau, A. *Operating Systems: Three Easy Pieces*, capítulo “Scheduling: The Multi-Level Feedback Queue” y materiales de CPU scheduling. https://pages.cs.wisc.edu/~remzi/OSTEP/
- Silberschatz, A., Galvin, P. y Gagne, G. *Operating System Concepts*. Wiley.
