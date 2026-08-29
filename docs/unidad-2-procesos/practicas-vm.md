---
sidebar_position: 3
---

# Prácticas con System Calls en Máquina Virtual Linux

## Requisitos

- **VirtualBox** o **VMware** instalado
- **Imagen ISO de Linux** (Ubuntu 20.04 o posterior recomendado)
- **Al menos 2GB de RAM** asignada a la VM
- **5GB de espacio en disco** para la VM

---

## Configurar la Máquina Virtual

### Paso 1: Crear una nueva VM

1. Abre VirtualBox
2. Clic en **"Nueva"**
3. Configura:
   - **Nombre**: Ubuntu-SO1
   - **Tipo**: Linux
   - **Versión**: Ubuntu (64-bit)
   - **Memoria RAM**: 2048 MB
   - **Disco duro**: 20 GB (dinámico)

### Paso 2: Instalar Linux

1. Monta la ISO de Ubuntu
2. Sigue el asistente de instalación
3. Una vez instalado, actualiza:

```bash
sudo apt update
sudo apt upgrade -y
```

### Paso 3: Instalar herramientas de desarrollo

```bash
sudo apt install -y build-essential gcc g++ make gdb
```

---

## Práctica 1: Compilar y ejecutar ejemplos de fork()

### Crear el archivo

```bash
nano fork_ejemplo.c
```

Pega este código:

```c
#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    printf("Proceso padre (PID: %d)\n", getpid());
    
    pid_t pid = fork();
    
    if (pid == 0) {
        // Código del proceso hijo
        printf("Proceso hijo (PID: %d)\n", getpid());
        printf("Mi padre es PID: %d\n", getppid());
    } else {
        // Código del proceso padre
        printf("Creé un hijo con PID: %d\n", pid);
        wait(NULL); // Espera a que termine el hijo
        printf("El hijo terminó\n");
    }
    
    return 0;
}
```

### Compilar y ejecutar

```bash
gcc -o fork_ejemplo fork_ejemplo.c
./fork_ejemplo
```

**Resultado esperado:**
```
Proceso padre (PID: 1234)
Creé un hijo con PID: 1235
Proceso hijo (PID: 1235)
Mi padre es PID: 1234
El hijo terminó
```

---

## Práctica 2: exec() para ejecutar otros programas

### Crear el archivo

```bash
nano exec_ejemplo.c
```

```c
#include <unistd.h>
#include <stdio.h>
#include <sys/wait.h>

int main() {
    printf("Antes de exec (PID: %d)\n", getpid());
    
    pid_t pid = fork();
    
    if (pid == 0) {
        // El hijo ejecuta el comando 'ls'
        execl("/bin/ls", "ls", "-l", "/home", NULL);
        // Esta línea nunca se ejecuta si exec es exitoso
        printf("Si ves esto, exec falló\n");
    } else {
        // El padre espera
        wait(NULL);
        printf("Proceso hijo finalizó\n");
    }
    
    return 0;
}
```

### Compilar y ejecutar

```bash
gcc -o exec_ejemplo exec_ejemplo.c
./exec_ejemplo
```

---

## Práctica 3: Ver procesos en tiempo real

### Comando ps

```bash
# Ver todos los procesos
ps aux

# Ver procesos con árbol de relación padre-hijo
ps -ef --forest

# Ver solo tus procesos
ps -u $USER
```

### Monitoreo con top

```bash
top
```

Presiona `q` para salir.

---

## Práctica 4: Crear múltiples procesos

```bash
nano multi_fork.c
```

```c
#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    printf("Padre (PID: %d)\n", getpid());
    
    // Crear 3 procesos hijos
    for (int i = 0; i < 3; i++) {
        pid_t pid = fork();
        
        if (pid == 0) {
            printf("Hijo %d (PID: %d)\n", i + 1, getpid());
            sleep(2); // Simula trabajo
            return 0; // El hijo termina
        }
    }
    
    // El padre espera a todos los hijos
    for (int i = 0; i < 3; i++) {
        wait(NULL);
    }
    
    printf("Todos los hijos terminaron\n");
    return 0;
}
```

### Compilar y ejecutar

```bash
gcc -o multi_fork multi_fork.c
./multi_fork
```

**Mientras se ejecuta, abre otra terminal y corre:**

```bash
ps -ef --forest
```

Verás el árbol de procesos (padre e hijos).

---

## Práctica 5: Debugging con gdb

### Compilar con símbolos de debug

```bash
gcc -g -o programa programa.c
```

### Ejecutar bajo debugging

```bash
gdb ./programa
```

**Comandos útiles en gdb:**
```
run                 # Ejecutar el programa
break main          # Establecer breakpoint en main
step                # Ejecutar una línea
next                # Siguiente línea
print variable      # Imprimir valor de variable
continue            # Continuar hasta siguiente breakpoint
quit                # Salir
```

---

## Práctica 6: Conexión con el Simulador

El **Simulador de Gestión de Procesos** que ya tienen implementa conceptos reales:

1. **Crear proceso** ↔ `fork()`
2. **Usar memoria RAM** ↔ Asignación de stack/heap
3. **Ejecutar** ↔ Cambio de contexto de CPU
4. **Terminar** ↔ `exit()` y liberación de memoria

**Conexión:**
- Cuando ejecutas un programa fork/exec en la VM, internamente el SO:
  - Asigna un PID
  - Reserva memoria RAM
  - Lo coloca en la cola del scheduler
  - Lo ejecuta cuando la CPU está disponible

Esto es exactamente lo que simula vuestro programa.

---

## Comandos útiles en Linux

```bash
# Ver información de procesos
ps aux | grep nombredelapp

# Ver el árbol de procesos
pstree

# Enviar señal a un proceso
kill -9 PID

# Ver memoria usada
free -h

# Ver CPU usage
top -b -n 1

# Ver archivos abiertos por un proceso
lsof -p PID
```

---

## Troubleshooting

### Error: gcc: command not found
```bash
sudo apt install build-essential
```

### Error: fork: Cannot allocate memory
Tu VM está sin RAM. Aumenta la memoria en VirtualBox.

### El programa no termina
Presiona `Ctrl + C` para enviarlo una señal de terminación.

---

## Actividad propuesta

1. **Crea** un programa que:
   - Genera 5 procesos hijos con `fork()`
   - Cada hijo imprime su PID y el de su padre
   - Cada hijo duerme un tiempo aleatorio (1-5 segundos)
   - El padre espera a todos y luego termina

2. **Ejecutalo** en la VM y observa:
   - El orden de impresión (pueden no ser secuenciales)
   - Los PIDs asignados
   - El árbol de procesos con `ps -ef --forest`

3. **Compara** lo que ves en la VM con lo que simula vuestro programa

---

## Referencias

- Man pages en Linux:
  ```bash
  man fork
  man exec
  man wait
  man getpid
  ```

- Documentación oficial:
  - Linux man-pages: https://man7.org/
  - GNU C Library: https://www.gnu.org/software/libc/manual/
