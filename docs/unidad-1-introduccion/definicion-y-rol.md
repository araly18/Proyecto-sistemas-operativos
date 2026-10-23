---
sidebar_position: 1
---

# Definición y rol del sistema operativo

Un **sistema operativo (SO)** es el software que coordina la ejecución de programas y administra los recursos de una computadora, como el procesador, la memoria, los dispositivos de entrada/salida y el almacenamiento. También ofrece interfaces y abstracciones que permiten desarrollar y ejecutar aplicaciones sin tener que controlar cada detalle del hardware directamente.

## El SO como gestor de recursos

Varios procesos pueden competir por la CPU, la memoria, archivos y dispositivos. El sistema operativo decide cómo asignar esos recursos, mantiene información sobre su uso y aplica reglas de protección.

Ejemplos:
- El planificador distribuye el tiempo de CPU entre procesos listos.
- La administración de memoria asigna espacios de direcciones y limita accesos.
- El sistema de archivos organiza datos persistentes y aplica permisos.
- Los controladores coordinan operaciones con dispositivos.

## El SO como máquina extendida

El hardware puede ser complejo y variar entre equipos. El SO ofrece abstracciones más cómodas y consistentes: archivos en lugar de manipular sectores del disco, procesos e hilos en lugar de controlar manualmente el procesador, y memoria virtual en lugar de administrar directamente cada ubicación física.

Esta idea se denomina a menudo **máquina extendida**: el sistema operativo oculta detalles de bajo nivel y proporciona operaciones más fáciles de utilizar.

## El SO como entorno virtual aislado

El sistema también crea una ilusión de ejecución independiente para cada proceso. Por ejemplo, cada proceso puede tener su propio espacio de direcciones virtuales, aunque la memoria física sea compartida entre muchas aplicaciones. Los permisos, el modo dual y la traducción de direcciones ayudan a impedir que un programa interfiera libremente con otro.

Esta “máquina virtual” es una abstracción que ofrece el SO a los procesos. No es exactamente lo mismo que una máquina virtual completa ejecutada sobre un hipervisor, aunque ambos conceptos utilizan virtualización y aislamiento.

## Dos perspectivas complementarias

| Perspectiva | Pregunta principal | Ejemplo |
|---|---|---|
| Máquina extendida | ¿Qué interfaz sencilla ofrece el SO al programa? | Leer un archivo mediante una API |
| Gestor de recursos | ¿Cómo comparte y protege el SO los recursos físicos? | Asignar CPU y validar permisos |
| Entorno aislado | ¿Cómo evita que una ejecución interfiera con otra? | Espacios de direcciones separados |

## Referencias

- Arpaci-Dusseau, R. y Arpaci-Dusseau, A. *Operating Systems: Three Easy Pieces*. https://pages.cs.wisc.edu/~remzi/OSTEP/
- Silberschatz, A., Galvin, P. y Gagne, G. *Operating System Concepts*. Wiley.
