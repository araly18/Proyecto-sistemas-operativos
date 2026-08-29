---
sidebar_position: 2
---

# Simulador de Gestión de Procesos en Memoria

## Descripción General

Es un programa interactivo que simula cómo un sistema operativo gestiona procesos con recursos limitados (CPU, RAM). Muestra:

- **1 CPU** para ejecutar procesos
- **1 GB (1024 MB) de RAM** disponible
- **Cola de espera** para procesos que no caben en memoria
- **Ejecución concurrente** usando hilos (threading)

---

## Objetivo del Simulador

Aprender visualmente cómo:
1. Se crean procesos con identidades únicas (PID)
2. Se asigna memoria RAM a cada proceso
3. Qué pasa cuando la memoria se agota (cola de espera)
4. Se libera memoria cuando termina un proceso
5. Los procesos en cola pueden ejecutarse cuando hay espacio

---

## Características principales

### Tabla de Procesos en Ejecución
Muestra todos los procesos que están usando CPU y RAM en este momento.

**Columnas:**
- **PID**: Identificador único del proceso
- **Nombre**: Nombre descriptivo (ej. "Navegador", "Editor")
- **Memoria (MB)**: Cuánta RAM usa
- **Duración (s)**: Cuántos segundos se ejecuta

### Tabla de Cola de Espera
Muestra los procesos que están esperando porque no cabe memoria disponible.

### Tabla de Procesos Finalizados
Muestra los últimos 5 procesos que terminaron y liberaron su memoria.

### Barra de Uso de RAM
Indicador visual del porcentaje de memoria usada:
- **Verde** (0-60%): Memoria disponible
- **Amarillo** (60-85%): Memoria alta
- **Rojo** (85-100%): Memoria crítica

---

## Cómo ejecutar el Simulador

### Requisitos previos

```bash
# Instalar dependencias de Python
pip install rich
```

### Ejecutar el programa

```bash
python3 simulador.py
```

---

## Uso interactivo

El menú tiene 3 opciones:

### 1. Crear proceso
- **Nombre**: (Enter = genera uno automático)
- **Memoria (MB)**: Cuánta RAM necesita (ej. 256)
- **Duración (segundos)**: Cuánto tiempo se ejecuta (ej. 5)

**Ejemplo:**
```
Nombre del proceso: Mi_App
Memoria requerida (MB): 512
Duración (segundos): 10
```

Si no hay memoria disponible, el proceso se agrega a la cola de espera.

### 2. Actualizar pantalla
Redibuja la pantalla con el estado actual del sistema.

### 3. Salir
Termina el simulador.

---

## Ejemplo de sesión

```
SIMULADOR DE GESTIÓN DE PROCESOS EN MEMORIA
═══════════════════════════════════════════

Uso de RAM: [████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 30%
(307 MB usados / 1024 MB totales)

Procesos en ejecución:
┃ PID │ Nombre           │ Memoria (MB) │ Duración (s)
┣─────┼──────────────────┼──────────────┼──────────────
┃ 1   │ Navegador_1      │ 256 MB       │ 15s
┃ 2   │ Editor_2         │ 128 MB       │ 8s
┃ 3   │ Compilador_3     │ 384 MB       │ 20s

Cola de espera:
┃ PID │ Nombre           │ Memoria (MB) │ Duración (s)
┣─────┼──────────────────┼──────────────┼──────────────
┃ 4   │ Antivirus_4      │ 256 MB       │ 10s
┃ 5   │ Backup_5         │ 512 MB       │ 25s

1. Crear proceso
2. Actualizar pantalla
3. Salir
```

---

## Conceptos simulados

### PID (Process ID)
Cada proceso obtiene un número único que lo identifica. En el simulador se asignan secuencialmente (1, 2, 3...).

### Estado del Proceso
- **en_espera**: Esperando a que haya memoria disponible
- **ejecutando**: Usando CPU y memoria RAM
- **finalizado**: Terminó y liberó su memoria

### Memoria RAM
- Se reserva cuando un proceso comienza
- Se libera automáticamente cuando termina
- Los procesos en cola se ejecutan apenas queda espacio

### Concurrencia
Todos los procesos se ejecutan "al mismo tiempo" usando **hilos (threads)** de Python, simulando una CPU compartida.

---

## Código fuente

El simulador está disponible en la carpeta `simulador/` de este repositorio.

### Clases principales:

**Proceso**: Representa un proceso individual con:
- PID único
- Nombre
- Memoria requerida
- Duración

**GestorMemoria**: Administra:
- RAM disponible
- Cola de espera
- Procesos en ejecución
- Procesos finalizados

---

## Extensiones posibles

El simulador se puede mejorar con:
- Diferentes algoritmos de planificación (FIFO, Round Robin, Priority)
- Estados adicionales (suspendido, pausado)
- Sincronización entre procesos
- Interfaz gráfica (Tkinter, PyQt)

---

## Relación con System Calls

En un SO real, las operaciones que el simulador representa (crear, ejecutar, terminar procesos) usan estas system calls:

| Operación | System Call |
|-----------|------------|
| Crear proceso | `fork()` |
| Cargar programa | `exec()` |
| Terminar proceso | `exit()` |
| Esperar hijo | `wait()` |
| Obtener PID | `getpid()` |
| Obtener info memoria | `sbrk()`, `mmap()` |
