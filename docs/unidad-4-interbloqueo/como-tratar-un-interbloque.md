---
sidebar_position: 3
---

# Cómo se trata un interbloqueo

Hay cuatro formas de enfrentarse a un interbloqueo, y cada una tiene su costo. Se puede **prevenir** (hacer que sea imposible), **evitar** (dejar que sea posible pero revisar con cuidado cada petición), **detectar y recuperarse** (dejar que pase y arreglarlo después), o **ignorarlo** y esperar que no ocurra. Los libros las presentan casi siempre en ese orden, de la más estricta a la más relajada.

## 1. Prevención

La prevención consiste en romper al menos una de las cuatro condiciones de Coffman antes de que el programa corra, de modo que el interbloqueo no pueda formarse. Cada condición se ataca de forma distinta.

**Exclusión mutua.** Casi nunca se puede quitar, porque hay recursos que por naturaleza solo pueden ser usados por uno a la vez, como una impresora. Un truco que menciona Tanenbaum es el *spooling*: los procesos no usan la impresora directamente, sino que dejan su trabajo en una cola y un solo proceso se encarga de imprimir. Así ningún proceso se queda "reteniendo" la impresora.

**Retención y espera.** Se puede obligar a que cada proceso pida todos sus recursos de una vez al empezar, o a que suelte lo que tiene antes de pedir algo nuevo. El problema es que muchas veces no se sabe de antemano qué se va a necesitar, y se desperdician recursos reservados que todavía no se usan. Además, un proceso que necesita muchos recursos populares puede esperar muchísimo.

**Sin expropiación.** Se puede permitir que se le quite un recurso a un proceso. Si pide algo que no está libre, suelta lo que tiene y vuelve a intentarlo después. Funciona con recursos cuyo estado se puede guardar y restaurar (como la CPU o la memoria), pero no con una impresora a mitad de un trabajo. En el laboratorio se probó una versión de esto con `D.acquire(timeout=0.3)`: si no consigue el segundo candado en 0.3 segundos, el hilo suelta el primero, espera un tiempo al azar y reintenta. El costo es trabajo repetido, y existe el riesgo de que dos hilos se cedan el paso una y otra vez sin avanzar.

**Espera circular.** Es la más usada. Se numeran los recursos y todos los procesos los piden siempre en orden creciente. Así nunca puede formarse un ciclo, porque para eso alguien tendría que esperar un recurso "menor" mientras sostiene uno "mayor", y la regla no lo permite (esta técnica de ordenar los recursos ya aparece en el trabajo de Dijkstra sobre ordenamiento jerárquico, de 1971). En código es tan simple como esto:

```python
# regla: siempre se pide primero el recurso con id más bajo
primero, segundo = sorted([cuenta_origen, cuenta_destino], key=lambda c: c.id)
with primero.lock:
    with segundo.lock:
        ...  # aquí se hace la operación
```

Es justamente lo que se plantea para la versión corregida del Proyecto 2, con transferencias bancarias entre cuentas. La desventaja es que obliga a pedir los recursos en un orden que quizás no es el natural para el programa.

## 2. Evitación

Aquí se permite que las cuatro condiciones existan, pero el sistema operativo revisa cada petición de recursos y solo la concede si el sistema queda en un estado seguro. Para poder hacerlo necesita saber de antemano el máximo que cada proceso podría llegar a pedir.

### Estado seguro y estado inseguro

Un estado es **seguro** si existe al menos un orden en el que todos los procesos pueden terminar, aunque todos pidan su máximo. Es **inseguro** si no hay garantía de que eso se pueda. Ojo con esto: *inseguro* no es lo mismo que *interbloqueo*. Un estado inseguro solo significa que podría llegar a haberlo, dependiendo de cómo pidan los procesos después.

### El algoritmo del banquero

Lo propuso Dijkstra y se llama así por la idea de un banquero que solo presta dinero si puede asegurar que todos sus clientes podrán terminar y devolver lo prestado. Para verlo, tomemos el ejemplo clásico de Silberschatz con un solo tipo de recurso y 12 unidades (por ejemplo, 12 unidades de cinta):

| Proceso | Máximo que puede pedir | Tiene ahora | Le falta |
|---|---|---|---|
| P0 | 10 | 5 | 5 |
| P1 | 4 | 2 | 2 |
| P2 | 9 | 2 | 7 |

Hay 12 en total y 9 ya están asignadas, así que **quedan 3 disponibles**. ¿Es seguro este estado? Se busca un proceso que pueda terminar con lo que hay:

1. P1 necesita 2 y hay 3, así que puede terminar. Al acabar devuelve sus 4, y quedan **5** disponibles.
2. P0 necesita 5 y hay 5, así que también termina. Devuelve sus 10 y quedan **10**.
3. P2 necesita 7 y hay 10, así que termina.

El orden P1, P0, P2 funciona, por lo tanto el estado es **seguro**.

Ahora supongamos que P2 pide 1 unidad más y el sistema se la da. Quedarían 2 disponibles. P1 todavía puede terminar (necesita 2), y al hacerlo devuelve sus 4, así que quedan 4. Pero P0 necesita 5 y P2 necesita 6, y con 4 ninguno de los dos puede terminar. Ese estado es **inseguro**, así que el banquero responde que no: P2 tiene que esperar, aunque en ese momento sí hubiera una unidad libre.

Con varios tipos de recursos la lógica es la misma, solo que se usan matrices (asignación, máximo, necesidad y disponible). El problema práctico es que exige conocer los máximos por adelantado, que el número de procesos y de recursos sea fijo, y que cada petición implique cálculos. Por eso casi no se usa en sistemas de propósito general.

## 3. Detección y recuperación

La otra idea es no restringir nada, dejar que el interbloqueo ocurra, y revisar cada cierto tiempo si ya pasó.

### Detección

Cuando cada recurso es de una sola unidad, detectar es buscar un ciclo en el grafo de espera (quién espera a quién). Hay que decidir cada cuánto correr la revisión. Se puede hacer en cada petición que no se concede (detecta rápido, pero cuesta mucho), cada cierto tiempo, o cuando la utilización de la CPU baja, que es una pista de que hay procesos bloqueados.

El script `detector.py` del laboratorio hace justo eso con candados de archivo. Lee `/proc/locks`, arma un diccionario de "qué PID espera a qué PID" y sigue las flechas. Si vuelve a un PID por el que ya pasó, hay un ciclo. En la prueba del laboratorio imprimió:

```
Espera-a: {1516: 1510, 1510: 1516}
INTERBLOQUEO entre los PID: [1516, 1510]
```

### Recuperación

Una vez detectado, hay que romper el ciclo. Las opciones que presentan los libros son tres:

- Terminar todos los procesos del ciclo. Es lo más drástico, pero seguro.
- Terminarlos de uno en uno hasta que el ciclo desaparezca. Se elige la víctima según su prioridad, cuánto trabajo lleva hecho o cuántos recursos tiene.
- Quitarle recursos a un proceso (expropiar) y devolverlo a un punto anterior guardado, lo que se llama *rollback*.

En todos los casos hay que cuidar que no se escoja siempre a la misma víctima, porque eso la dejaría en inanición. En el laboratorio, la recuperación fue terminar el primer PID del ciclo con `kill`. El kernel liberó sus candados, el otro proceso pudo continuar (`P tiene ambos`), y al volver a correr el detector decía `Sin interbloqueo`. Los gestores de bases de datos usan una idea parecida: cuando detectan un interbloqueo entre transacciones, abortan una y dejan seguir a las demás (así lo documenta PostgreSQL).

Esta es la estrategia que se plantea en el Proyecto 2: provocar un interbloqueo real entre hilos, armar el grafo desde el estado real de los candados, buscar el ciclo con una búsqueda en profundidad y terminar una de las transacciones.

## 4. El algoritmo del avestruz

Es la más simple: ignorar el problema, como el avestruz que mete la cabeza en la arena. Tanenbaum la llama así a propósito. El razonamiento es práctico: prevenir o evitar cuesta rendimiento y le pone restricciones a los programas, y los interbloqueos ocurren pocas veces. Según él, los matemáticos querrían eliminarlos a toda costa, mientras que los ingenieros preguntan qué tan seguido pasan en comparación con otros fallos, como un error de hardware o del sistema. Por eso UNIX, Linux y Windows no previenen los interbloqueos entre recursos de las aplicaciones, y le dejan ese cuidado al programador.

Linux sí ayuda en algunos casos puntuales:

- Con los candados de archivo POSIX (`fcntl` / `lockf`), el kernel detecta el ciclo y le devuelve el error `EDEADLK` a uno de los procesos en lugar de dejarlo bloqueado para siempre. En el laboratorio, uno de los procesos recibió el error, liberó su candado y el otro terminó. Esto es posible porque el kernel sabe quién tiene cada candado, a diferencia de un `threading.Lock`, que es solo una variable dentro del programa.
- Para los desarrolladores del propio kernel existe `lockdep`, un validador que revisa en qué orden se toman los candados y avisa si detecta un ciclo posible. Hace muchísimas comprobaciones, por eso se usa para depurar y no en el uso normal.

## Los filósofos comensales

Es el problema clásico para practicar todo lo anterior. Cinco filósofos están en una mesa con cinco tenedores, uno entre cada par. Para comer necesitan los dos tenedores de sus lados. Si todos toman primero el de la izquierda, todos se quedan con uno en la mano esperando el otro, y es un interbloqueo.

En el laboratorio se programó con cinco procesos reales (`multiprocessing`) y tres modos:

| Modo | Qué hace | Resultado |
|---|---|---|
| `ingenuo` | Todos toman primero el izquierdo | Interbloqueo (a los 10 segundos el programa lo detecta y termina los procesos) |
| `comedor` | Un semáforo deja sentarse a solo 4 filósofos a la vez, así que al menos uno puede tomar los dos tenedores | Todos comieron |
| `zurdo` | El último filósofo toma primero el tenedor derecho, lo que rompe la simetría del ciclo | Todos comieron |

Los dos arreglos se relacionan con lo que vimos: el modo `zurdo` rompe la espera circular, y el modo `comedor` limita cuántos procesos compiten a la vez para que el ciclo no pueda cerrarse.

## Resumen de las estrategias

| Estrategia | Idea | Costo |
|---|---|---|
| Prevención | Romper una de las condiciones de Coffman antes de empezar | Restricciones, desperdicio de recursos |
| Evitación | Conceder cada petición solo si el estado sigue siendo seguro | Conocer los máximos por adelantado, cálculos constantes |
| Detección y recuperación | Dejar que pase, detectar el ciclo y romperlo | Revisar cada cierto tiempo, y perder trabajo del proceso que se termina |
| Avestruz | Ignorarlo | Si ocurre, se resuelve a mano (por ejemplo, reiniciando) |

## Referencias

- Stallings, W. (2005). *Sistemas operativos: aspectos internos y principios de diseño* (5.ª ed.), cap. 6. Pearson Educación.
- Tanenbaum, A. S., & Bos, H. (2015). *Modern operating systems* (4.ª ed.), cap. 6. Pearson.
- Silberschatz, A., Galvin, P. B., & Gagne, G. (2018). *Operating system concepts* (10.ª ed.), cap. 8. Wiley.
- Dijkstra, E. W. (1971). Hierarchical ordering of sequential processes. *Acta Informatica, 1*(2), 115-138.
- Linux kernel documentation. *Runtime locking correctness validator.* https://docs.kernel.org/locking/lockdep-design.html
- Linux man-pages project. *fcntl(2).* https://man7.org/linux/man-pages/man2/fcntl.2.html
- PostgreSQL Global Development Group. *Explicit locking: deadlocks.* https://www.postgresql.org/docs/current/explicit-locking.html