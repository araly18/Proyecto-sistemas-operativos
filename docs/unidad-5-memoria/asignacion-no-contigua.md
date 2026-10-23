---
sidebar_position: 3
---

# Asignación no contigua de memoria

En la asignación no contigua, un proceso no necesita ocupar una única región continua de memoria física. El sistema operativo puede distribuir las partes del espacio lógico del proceso en distintas ubicaciones físicas y mantener estructuras que permiten traducir las direcciones utilizadas por el programa.

Este enfoque facilita la utilización flexible de la memoria y permite que procesos más grandes que un bloque físico continuo puedan ejecutarse. A cambio, necesita mecanismos de traducción y estructuras de administración adicionales.

## Dos técnicas principales

### Paginación

Divide el espacio lógico en bloques de tamaño fijo llamados **páginas** y la memoria física en bloques del mismo tamaño llamados **marcos**. Una tabla de páginas relaciona cada página con el marco donde está almacenada. Una TLB puede guardar traducciones recientes para acelerar los accesos.

Consulta el subtema: [Paginación de memoria](./paginacion.md).

### Segmentación

Divide el espacio lógico en unidades de tamaño variable que reflejan partes del programa, como código, datos y pila. La tabla de segmentos registra información como la base y el límite de cada segmento, según el diseño utilizado.

Consulta el subtema: [Segmentación de memoria](./segmentacion.md).

## Comparación general

| Aspecto | Paginación | Segmentación |
|---|---|---|
| Unidad de división | Bloques de tamaño fijo | Unidades lógicas de tamaño variable |
| Correspondencia | Página → marco | Segmento → base y límite |
| Fragmentación característica | Puede producir fragmentación interna en la última página | Puede producir fragmentación externa con asignación contigua de segmentos |
| Perspectiva | Principalmente física y de traducción | Más cercana a la organización lógica del programa |

La comparación es conceptual: algunos sistemas históricos combinan segmentación y paginación, y los detalles dependen de la arquitectura.

## Referencias

- Arpaci-Dusseau, R. y Arpaci-Dusseau, A. *Operating Systems: Three Easy Pieces*, capítulos sobre paginación y segmentación. https://pages.cs.wisc.edu/~remzi/OSTEP/
- Documentación del kernel de Linux sobre administración de memoria. https://docs.kernel.org/admin-guide/mm/
