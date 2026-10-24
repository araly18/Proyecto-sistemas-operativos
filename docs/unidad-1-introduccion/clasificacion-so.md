---
sidebar_position: 4
---

# Clasificación de los sistemas operativos

No existe una sola clasificación de los sistemas operativos. Un mismo sistema puede pertenecer a varias categorías al mismo tiempo: por ejemplo, Linux puede ser multiusuario, multitarea y utilizarse tanto en servidores centralizados como en sistemas distribuidos. Por eso, las categorías siguientes describen dimensiones diferentes, no grupos mutuamente excluyentes.

## Según el número de usuarios

- **Monousuario:** diseñado para que un usuario utilice el sistema a la vez, aunque internamente pueda ejecutar múltiples procesos.
- **Multiusuario:** permite que varias cuentas o sesiones utilicen los recursos del sistema con separación de permisos y, en algunos casos, simultáneamente.

La distinción no depende simplemente de que exista una pantalla de inicio de sesión. También importa cómo el sistema representa las cuentas, controla permisos y comparte recursos.

## Según la cantidad de tareas

- **Monotarea:** solo permite que una tarea se ejecute como actividad principal en un momento dado.
- **Multitarea:** administra varios procesos y alterna el uso de la CPU entre ellos; en equipos multinúcleo algunos pueden ejecutarse literalmente al mismo tiempo.

La multitarea puede ser preventiva —el sistema puede retirar la CPU a un proceso— o cooperativa, donde las tareas deben ceder el control en puntos apropiados.

## Según la organización del sistema

| Tipo | Característica | Ejemplo de uso |
|---|---|---|
| Centralizado | Los recursos y servicios principales se administran desde un sistema central. | Servidor de una aplicación institucional |
| Distribuido | Varios equipos cooperan mediante una red para ofrecer servicios o procesar tareas. | Clúster de cómputo o sistema distribuido de almacenamiento |

Que un equipo esté conectado a una red no significa por sí solo que su sistema operativo sea distribuido. La categoría describe cómo se coordinan los recursos y servicios entre varios nodos.

## Según el tipo de dispositivo y los requisitos temporales

- **De propósito general:** busca atender variedad de aplicaciones, como equipos de escritorio y servidores.
- **Embebido:** está integrado en un dispositivo con una función concreta, como un router, una cámara o un controlador industrial.
- **De tiempo real:** debe responder dentro de límites temporales definidos. En tiempo real duro, incumplir un plazo puede considerarse un fallo del sistema; en tiempo real suave, la tardanza degrada el servicio pero no siempre lo invalida.

Un sistema embebido no es necesariamente de tiempo real, aunque muchos controladores embebidos sí tienen requisitos temporales.

## Ejemplos de clasificación combinada

| Sistema o entorno | Clasificación posible | Matiz |
|---|---|---|
| Equipo personal moderno | Multitarea, propósito general | Puede tener una sola persona frente a la pantalla, pero ejecutar muchos procesos |
| Servidor Unix/Linux | Multiusuario, multitarea | Puede atender múltiples sesiones y servicios |
| Controlador de frenos automotriz | Embebido y de tiempo real | Sus respuestas deben respetar plazos críticos |
| Clúster de cómputo | Distribuido | Los nodos cooperan mediante una red |

## Cómo clasificar sin confundir categorías

Para clasificar un sistema, conviene preguntar por separado: ¿cuántos usuarios puede atender?, ¿cómo ejecuta tareas?, ¿dónde se administran los recursos?, ¿qué tipo de dispositivo controla? y ¿tiene plazos temporales estrictos? Las respuestas pueden combinarse.

## Referencias

- Arpaci-Dusseau, R. y Arpaci-Dusseau, A. *Operating Systems: Three Easy Pieces*. https://pages.cs.wisc.edu/~remzi/OSTEP/
- Silberschatz, A., Galvin, P. y Gagne, G. *Operating System Concepts*. Wiley.
