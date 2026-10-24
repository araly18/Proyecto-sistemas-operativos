---
sidebar_position: 2
---

# Las cuatro condiciones de Coffman

Un interbloqueo (*deadlock*) puede producirse cuando varios procesos esperan recursos de forma circular. Coffman y sus colaboradores identificaron cuatro condiciones que deben cumplirse simultáneamente para que ocurra un interbloqueo en el modelo clásico de recursos.

## 1. Exclusión mutua

Al menos un recurso solo puede ser utilizado por un proceso a la vez. Por ejemplo, un recurso no compartible puede requerir acceso exclusivo mientras se usa.

## 2. Retención y espera

Un proceso conserva uno o más recursos que ya obtuvo mientras solicita otros recursos adicionales. Si no pudiera retener recursos al pedir otros, esta condición podría romperse.

## 3. No expropiación

Los recursos no se retiran por la fuerza al proceso que los posee; el proceso debe liberarlos voluntariamente después de terminar de utilizarlos. Esta condición no se cumple para todos los recursos: la CPU, por ejemplo, puede retirarse de un proceso mediante planificación preventiva.

## 4. Espera circular

Existe una cadena circular de procesos donde cada proceso espera un recurso retenido por el siguiente. Por ejemplo, P1 espera un recurso de P2, P2 espera uno de P3 y P3 espera uno de P1.

```mermaid
flowchart LR
    P1["Proceso P1"] -->|"espera recurso de"| P2["Proceso P2"]
    P2 -->|"espera recurso de"| P3["Proceso P3"]
    P3 -->|"espera recurso de"| P1
```

## ¿Por qué son importantes?

En el modelo clásico, las cuatro condiciones son necesarias para que se forme un interbloqueo. Las estrategias de **prevención** buscan garantizar que al menos una condición no pueda darse. La **evitación** no elimina necesariamente las condiciones: evalúa si conceder una solicitud puede dejar al sistema en un estado inseguro.

Tener las cuatro condiciones presentes no siempre demuestra por sí solo que ya existe un interbloqueo; la asignación concreta de recursos y las dependencias entre procesos también importan. Para recursos de una sola instancia por tipo, un ciclo en el grafo de asignación puede indicar interbloqueo; con múltiples instancias, un ciclo por sí solo no siempre basta.

## Ejemplo

P1 mantiene bloqueado el recurso A y solicita B. P2 mantiene B y solicita A. Si ambos recursos son exclusivos y no pueden retirarse, cada proceso conserva un recurso mientras espera el otro y se forma una espera circular. Los cuatro requisitos quedan presentes y ninguno puede avanzar.

## Referencias

- Coffman, E. G., Elphick, M. J. y Shoshani, A. (1971). “System Deadlocks”. *ACM Computing Surveys*.
- Arpaci-Dusseau, R. y Arpaci-Dusseau, A. *Operating Systems: Three Easy Pieces*. https://pages.cs.wisc.edu/~remzi/OSTEP/
