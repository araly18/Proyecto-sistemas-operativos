---
sidebar_position: 4
---

# Memoria compartida y sincronización

La **memoria compartida** es un mecanismo de comunicación entre procesos o hilos en el que dos o más participantes pueden acceder a una misma región de memoria. Puede ser eficiente porque los datos no necesitan copiarse en cada intercambio, pero compartir una región no garantiza que el acceso sea seguro.

## ¿Dónde aparece?

- Entre hilos de un mismo proceso, que suelen compartir el espacio de direcciones y los datos globales.
- Entre procesos que establecen una región de memoria compartida mediante mecanismos del sistema operativo.
- En programas multiproceso que utilizan buffers, colas o estructuras comunes.

## El problema de la carrera

Si dos hilos incrementan la misma variable sin sincronización, ambos pueden leer el mismo valor anterior y escribir un resultado que pierde una actualización. Una operación aparentemente simple como `contador++` suele implicar leer, sumar y escribir, y no necesariamente es atómica.

## ¿Qué mecanismo se necesita?

| Mecanismo | Uso típico | Precaución |
|---|---|---|
| Mutex | Proteger una sección crítica para que entre un hilo a la vez | Todos los caminos deben liberar el mutex correctamente |
| Semáforo contador | Controlar el acceso a un número limitado de recursos o coordinar eventos | El valor y el orden de `wait`/`signal` deben ser correctos |
| Variables de condición | Esperar hasta que una condición compartida sea verdadera | Normalmente se comprueba la condición en un bucle mientras se mantiene el protocolo del mutex |
| Operaciones atómicas | Actualizar valores con garantías de atomicidad | La atomicidad no resuelve por sí sola toda coordinación entre varias variables |

## Ejemplo conceptual: búfer productor-consumidor

Un productor agrega elementos a una cola compartida y un consumidor los retira. En un búfer acotado se debe evitar que el productor escriba cuando está lleno y que el consumidor lea cuando está vacío. También se debe proteger la estructura para que las operaciones concurrentes no corrompan sus índices o enlaces.

Un patrón clásico utiliza:
- un mutex para proteger la estructura;
- un semáforo `empty` para contar espacios libres;
- un semáforo `full` para contar elementos disponibles.

La secuencia de adquisición y liberación es importante para no introducir interbloqueos. No se debe mantener el mutex mientras se espera indefinidamente una condición que requiere que otro hilo obtenga ese mismo mutex.

## Ventajas y riesgos

La memoria compartida puede reducir el costo de copiar grandes cantidades de datos, pero obliga a definir claramente quién puede leer y escribir, cuándo se publican los cambios y cómo se coordinan los participantes. Sin un protocolo de sincronización correcto, pueden aparecer condiciones de carrera, corrupción de datos o interbloqueos.

## Referencias

- Arpaci-Dusseau, R. y Arpaci-Dusseau, A. *Operating Systems: Three Easy Pieces*, capítulos sobre concurrencia y sincronización. https://pages.cs.wisc.edu/~remzi/OSTEP/
- The Open Group, POSIX specifications for threads and shared memory. https://pubs.opengroup.org/onlinepubs/9699919799/
