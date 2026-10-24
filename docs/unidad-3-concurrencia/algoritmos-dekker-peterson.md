---
sidebar_position: 2
---

# Algoritmos de Dekker y Peterson

Dekker y Peterson son algoritmos clásicos de software para ilustrar cómo dos procesos pueden coordinar el acceso a una sección crítica. Son importantes para comprender la exclusión mutua y las propiedades de una solución, aunque en sistemas modernos no suelen utilizarse directamente como sustituto de las primitivas de sincronización del sistema operativo o del lenguaje.

## Propiedades que debe cumplir una solución

1. **Exclusión mutua:** como máximo un proceso entra a la sección crítica a la vez.
2. **Progreso:** si la sección crítica está libre y hay procesos que quieren entrar, la decisión sobre quién entra no debe posponerse indefinidamente por procesos que no participan.
3. **Espera acotada:** después de que un proceso solicita entrar, existe un límite a la cantidad de veces que otros pueden entrar antes que él.

## Desarrollo conceptual de Dekker: cinco intentos

En los textos clásicos se presentan varias versiones sucesivas para mostrar por qué una solución aparentemente simple falla. Los nombres exactos de “intento 1” a “intento 5” pueden variar entre libros y apuntes; lo importante es identificar el defecto de cada estrategia.

### Intento 1: usar una variable de turno

Una variable `turn` indica qué proceso tiene permiso. Esto evita que ambos entren a la vez, pero si el turno pertenece al otro proceso y este no quiere entrar, el primero puede quedarse esperando. Falla el progreso.

### Intento 2: usar una bandera de intención

Cada proceso levanta una bandera para indicar que quiere entrar. Si ambos levantan su bandera al mismo tiempo, ambos observan la intención del otro y pueden esperar indefinidamente. Se evita la entrada simultánea, pero puede fallar el progreso.

### Intento 3: bajar la bandera al detectar conflicto

Un proceso puede retirar temporalmente su bandera si encuentra la del otro, y luego volver a intentarlo. Si ambos retiran y vuelven a levantar sus banderas de forma sincronizada, puede repetirse el conflicto o producirse espera indefinida. La idea de “ceder” por sí sola no basta.

### Intento 4: combinar banderas y turno

Se combinan las banderas de intención con una variable de turno para resolver el conflicto. El turno determina cuál de los dos debe ceder cuando ambos quieren entrar. Esta combinación evita que ambos esperen para siempre en el mismo estado, pero el orden exacto de las instrucciones es esencial.

### Intento 5: algoritmo de Dekker

Dekker combina dos banderas de intención (`wants[0]`, `wants[1]`) y una variable `turn`. Si ambos quieren entrar, el proceso que no tiene el turno cede temporalmente su bandera y espera hasta que el turno le permita competir de nuevo. Al salir de la sección crítica, el proceso concede el turno al otro y baja su bandera.

Pseudocódigo ilustrativo para el proceso `i`, donde `j` es el otro proceso:

```text
wants[i] = true
while wants[j]:
    if turn == j:
        wants[i] = false
        while turn == j:
            esperar
        wants[i] = true

sección_crítica()

turn = j
wants[i] = false
```

El pseudocódigo omite detalles de implementación y presupone un modelo de memoria secuencialmente consistente. Las implementaciones reales en lenguajes modernos necesitan atender las reglas de memoria y reordenamiento del compilador y procesador.

## Solución de Peterson

Peterson ofrece otra solución clásica para dos procesos usando dos banderas y una variable `turn`. Cada proceso expresa su intención y cede prioridad al otro escribiendo su identificador en `turn`.

```text
// Código del proceso i; j es el otro proceso
flag[i] = true
turn = j
while flag[j] and turn == j:
    esperar

sección_crítica()

flag[i] = false
```

Bajo las suposiciones clásicas del modelo, Peterson satisface exclusión mutua, progreso y espera acotada para dos procesos.

## Comparación

| Aspecto | Dekker | Peterson |
|---|---|---|
| Variables principales | Dos banderas y `turn` | Dos banderas y `turn` |
| Manejo del conflicto | Un proceso retira temporalmente su bandera si debe ceder | El último que escribe `turn` cede prioridad al otro |
| Valor didáctico | Muestra el desarrollo de una solución de exclusión mutua | Pseudocódigo más compacto |
| Uso práctico moderno | Principalmente académico | Principalmente académico |

## Limitaciones prácticas

Estos algoritmos no deben copiarse sin más a programas concurrentes modernos. El modelo de memoria, las optimizaciones del compilador y las arquitecturas multiprocesador pueden invalidar las suposiciones simples. En aplicaciones reales se prefieren mutexes, semáforos, variables atómicas y primitivas documentadas por el lenguaje o el sistema.

## Referencias

- Dijkstra, E. W. trabajos clásicos sobre exclusión mutua y programación concurrente.
- Peterson, G. L. (1981). “Myths About the Mutual Exclusion Problem”. *Information Processing Letters*.
- Arpaci-Dusseau, R. y Arpaci-Dusseau, A. *Operating Systems: Three Easy Pieces*. https://pages.cs.wisc.edu/~remzi/OSTEP/
