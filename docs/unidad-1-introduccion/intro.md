---
sidebar_position: 2
---

# Evolución histórica de los sistemas operativos

La evolución de los sistemas operativos está relacionada con la necesidad de aprovechar mejor los recursos de las computadoras, reducir el trabajo manual y facilitar la interacción de los usuarios. Cada etapa incorporó mecanismos que respondían a las limitaciones de los sistemas anteriores.

## 1. Línea de tiempo

```mermaid
flowchart LR
    A["Años 40 y 50<br/>Operación manual"] --> B["Años 50<br/>Monitores residentes y lotes"]
    B --> C["Años 60<br/>Multiprogramación"]
    C --> D["Años 60 y 70<br/>Tiempo compartido"]
    D --> E["Años 70 y 80<br/>Computadoras personales"]
    E --> F["Años 80 y 90<br/>Sistemas distribuidos"]
    F --> G["De los 2000 a hoy<br/>Virtualización y contenedores"]
    G --> H["Sistemas de tiempo real<br/>Presentes en distintas etapas"]
```

## 2. Principales etapas históricas

### 2.1. Sistemas sin sistema operativo (años 40 y 50)

Las primeras computadoras se programaban directamente en lenguaje máquina y eran operadas manualmente. Los programadores debían cargar los programas, preparar la ejecución y recoger los resultados.

**Limitación:** se perdía mucho tiempo en la preparación de cada trabajo y el procesador podía permanecer inactivo durante esas operaciones.

### 2.2. Monitores residentes y sistemas por lotes (años 50)

Los sistemas por lotes (*batch*) permitieron agrupar trabajos para ejecutarlos consecutivamente. Un programa denominado **monitor residente** permanecía en memoria y controlaba la secuencia de ejecución, cargando el siguiente trabajo cuando terminaba el anterior.

**Ventaja:** se redujo la intervención manual entre trabajos.

**Limitación:** el procesador podía quedar esperando mientras se realizaban operaciones de entrada y salida.

### 2.3. Multiprogramación (años 60)

La multiprogramación permitió mantener varios programas en memoria simultáneamente. Cuando uno debía esperar una operación de entrada o salida, el sistema operativo podía asignar el procesador a otro programa.

La IBM System/360 y su sistema OS/360 fueron importantes en la implementación de estas ideas.

**Ventaja:** mejor aprovechamiento del procesador.

**Limitación:** aumentó la complejidad de la administración de memoria, la planificación y la protección entre programas.

### 2.4. Tiempo compartido (años 60 y 70)

El tiempo compartido extendió la multiprogramación para permitir que varios usuarios interactuaran con el sistema. El procesador se asignaba a cada proceso durante intervalos breves, conocidos como *quantum*.

Entre los sistemas y proyectos representativos se encuentran CTSS, Multics y UNIX.

**Ventaja:** permitió una interacción más directa con la computadora.

**Limitación:** exigió una planificación más compleja y mayores mecanismos de protección.

### 2.5. Computadoras personales (años 70 y 80)

El desarrollo de los microprocesadores favoreció la expansión de las computadoras personales. Sistemas como MS-DOS, lanzado en 1981, ofrecían un entorno para ejecutar programas en equipos individuales.

Posteriormente se extendieron las interfaces gráficas, la multitarea y los mecanismos de protección entre procesos.

**Ventaja:** la computación se volvió más accesible para las personas y las organizaciones.

**Limitación inicial:** algunos sistemas personales tenían capacidades limitadas de multitarea y protección.

### 2.6. Sistemas distribuidos (años 80 y 90)

Los sistemas distribuidos permiten coordinar varias computadoras conectadas mediante una red para compartir recursos y ejecutar tareas.

Entre sus beneficios se encuentran la escalabilidad y el uso compartido de recursos. Sin embargo, deben gestionar retrasos de comunicación, fallos parciales y problemas de coordinación entre máquinas.

Los clústeres y numerosos servicios en la nube utilizan principios relacionados con este enfoque.

### 2.7. Sistemas de tiempo real

Los sistemas de tiempo real deben producir respuestas dentro de plazos determinados. No basta con obtener un resultado correcto: también importa que llegue a tiempo.

- **Tiempo real estricto:** incumplir un plazo puede representar un fallo grave.
- **Tiempo real flexible:** incumplirlo puede reducir la calidad del servicio sin provocar necesariamente un fallo total.

Se utilizan en aplicaciones industriales, automotrices y médicas. Algunos sistemas conocidos en este ámbito son FreeRTOS, QNX y VxWorks.

### 2.8. Virtualización y contenedores (de los años 2000 hasta la actualidad)

La virtualización permite ejecutar varias máquinas virtuales en un mismo equipo físico mediante un hipervisor. Cada máquina virtual puede disponer de su propio sistema operativo.

Los contenedores ofrecen aislamiento de aplicaciones con menor sobrecarga en muchos escenarios. En Linux, mecanismos como *namespaces* y *cgroups* permiten aislar recursos y controlar su utilización.

La diferencia principal es que las máquinas virtuales pueden ejecutar kernels independientes, mientras que los contenedores tradicionales comparten el kernel del sistema anfitrión.

## 3. Comparación de las etapas

| Etapa | Necesidad atendida | Limitación o desafío |
|---|---|---|
| Operación manual | Ejecutar programas en las primeras computadoras | Mucha preparación manual |
| Sistemas por lotes | Automatizar la secuencia de trabajos | Esperas durante las operaciones de entrada y salida |
| Multiprogramación | Aprovechar la CPU durante las esperas | Mayor complejidad de administración y protección |
| Tiempo compartido | Facilitar la interacción de varios usuarios | Planificación y protección más exigentes |
| Computadoras personales | Acercar la computación al usuario individual | Capacidades limitadas en los primeros sistemas |
| Sistemas distribuidos | Compartir recursos entre computadoras | Coordinación y comunicación por red |
| Tiempo real | Responder dentro de plazos específicos | Cumplimiento de restricciones temporales |
| Virtualización y contenedores | Aislar entornos y aprovechar el hardware | Costos de virtualización y diferencias de aislamiento |

## 4. Análisis de la evolución

La historia de los sistemas operativos muestra una transición desde la ejecución manual hacia entornos capaces de administrar múltiples procesos, atender a varios usuarios y coordinar recursos distribuidos.

Los avances no eliminaron todos los problemas anteriores; incorporaron nuevas soluciones y también nuevos desafíos. La protección, la administración de memoria, la planificación y la utilización eficiente de los recursos siguen siendo funciones fundamentales en los sistemas actuales.

## Referencias

- Stallings, W. (2005). *Sistemas operativos: aspectos internos y principios de diseño* (5.ª ed.). Pearson Educación.
- Tanenbaum, A. S., y Bos, H. (2015). *Modern Operating Systems* (4.ª ed.). Pearson.
