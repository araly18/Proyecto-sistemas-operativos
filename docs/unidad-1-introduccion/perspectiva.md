---
sidebar_position: 5
---

# Perspectivas del sistema operativo

Un sistema operativo (SO) es el software fundamental que administra los recursos de una computadora y permite la interacción entre el usuario, los programas y el hardware. Su función puede comprenderse desde dos perspectivas complementarias: la del usuario y la del propio sistema.

## 1. Perspectiva del usuario y perspectiva del sistema

| Aspecto | Perspectiva del usuario | Perspectiva del sistema |
|---|---|---|
| Concepto | Máquina extendida o máquina virtual | Gestor de recursos |
| Enfoque | Facilitar el uso de la computadora | Administrar eficientemente los recursos físicos |
| Objetivo | Simplificar la interacción con el hardware | Distribuir y controlar los recursos disponibles |
| Funciones | Proporcionar interfaces para ejecutar programas y administrar archivos | Gestionar CPU, memoria, almacenamiento y dispositivos de entrada y salida |
| Ejemplo | Guardar un archivo sin conocer cómo se almacena físicamente | Asignar tiempo de CPU a los procesos que necesitan ejecutarse |

### 1.1. El sistema operativo como máquina extendida

Desde la perspectiva del usuario, el sistema operativo oculta parte de la complejidad del hardware y proporciona herramientas más sencillas para utilizar la computadora.

Por ejemplo, al guardar un archivo, el usuario no necesita conocer los sectores físicos del disco donde se almacenará la información. El sistema operativo se encarga de realizar las operaciones necesarias y presenta una interfaz fácil de utilizar.

Esta abstracción permite trabajar con los recursos de la computadora sin tener que controlar directamente sus componentes electrónicos.

### 1.2. El sistema operativo como gestor de recursos

Desde la perspectiva del sistema, el sistema operativo administra los recursos físicos y decide cómo se utilizan. Debe distribuir el tiempo del procesador, asignar memoria, controlar los dispositivos y coordinar la ejecución de los procesos.

Por ejemplo, cuando varios programas necesitan utilizar el procesador, el sistema operativo organiza su ejecución para evitar conflictos y aprovechar los recursos disponibles.

Esta función también implica aplicar mecanismos de protección para impedir que un proceso interfiera indebidamente con otros o acceda a recursos que no le corresponden.

## 2. Relación entre ambas perspectivas

Las dos perspectivas se complementan. La máquina extendida busca que la computadora sea más fácil de utilizar, mientras que el gestor de recursos procura que sus componentes funcionen de manera organizada y eficiente.

Un sistema operativo debe combinar ambas funciones: ofrecer un entorno accesible para el usuario y, al mismo tiempo, controlar los recursos que necesitan los programas.

## Referencias

- Stallings, W. (2005). *Sistemas operativos: aspectos internos y principios de diseño* (5.ª ed.). Pearson Educación.
- Tanenbaum, A. S., y Bos, H. (2015). *Modern Operating Systems* (4.ª ed.). Pearson.
