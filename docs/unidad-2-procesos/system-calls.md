---
sidebar_position: 1
---

# System Calls en Linux

## ¿Qué son las System Calls?

Las **system calls** (llamadas al sistema) son interfaces que permiten a los programas en espacio de usuario solicitar servicios del kernel del sistema operativo. Son la puerta de comunicación entre las aplicaciones y el SO.

### Características principales:

- **Cambio de contexto**: Pasan de modo usuario a modo kernel
- **Protección**: El kernel valida la solicitud antes de ejecutarla
- **Servicios del SO**: Acceso a memoria, archivos, dispositivos, procesos, etc.

---

## System Calls más importantes

### 1. **fork()** — Crear un nuevo proceso

```c
#include <stdio.h>
#include <unistd.h>

int main() {
    pid_t pid = fork();
    
    if (pid == 0) {
        printf("Soy el proceso hijo (PID: %d)\n", getpid());
    } else {
        printf("Soy el proceso padre (PID: %d, hijo: %d)\n", getpid(), pid);
    }
    
    return 0;
}
```

**Qué hace:** Crea una copia exacta del proceso actual.

**Retorna:**
- `0` en el proceso hijo
- El PID del hijo en el proceso padre
- `-1` si hay error

---

### 2. **exec()** — Reemplazar el proceso actual

```c
#include <unistd.h>
#include <stdio.h>

int main() {
    printf("Antes de exec\n");
    
    // Reemplaza el proceso actual con /bin/ls
    execl("/bin/ls", "ls", "-la", NULL);
    
    printf("Esto nunca se ejecutará\n"); // No llega aquí
    
    return 0;
}
```

**Qué hace:** Reemplaza la imagen del proceso actual con un nuevo programa.

**Variantes:**
- `execl()` — lista de argumentos
- `execv()` — vector de argumentos
- `execvp()` — busca en PATH

---

### 3. **wait()** — Esperar a que termine un proceso hijo

```c
#include <sys/wait.h>
#include <unistd.h>
#include <stdio.h>

int main() {
    pid_t pid = fork();
    
    if (pid == 0) {
        printf("Hijo ejecutándose\n");
        sleep(2);
    } else {
        int status;
        wait(&status); // Padre espera a que termine el hijo
        printf("Hijo finalizó. Estado: %d\n", status);
    }
    
    return 0;
}
```

**Qué hace:** El proceso padre espera a que termine un hijo.

**Retorna:** El PID del proceso hijo que terminó.

---

### 4. **exit()** — Terminar un proceso

```c
#include <stdlib.h>

int main() {
    printf("Programa terminando\n");
    exit(0); // 0 = éxito, otros números = error
    return 0;
}
```

**Qué hace:** Termina el proceso actual y retorna un código de salida.

---

### 5. **getpid() y getppid()** — Obtener IDs de procesos

```c
#include <unistd.h>
#include <stdio.h>

int main() {
    printf("Mi PID: %d\n", getpid());
    printf("PID del padre: %d\n", getppid());
    
    return 0;
}
```

---

## Ejemplo práctico: fork + exec + wait

```c
#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    printf("Proceso padre (PID: %d)\n", getpid());
    
    pid_t pid = fork();
    
    if (pid == 0) {
        // Proceso hijo
        printf("Hijo (PID: %d) ejecutando ls\n", getpid());
        execl("/bin/ls", "ls", "-l", NULL);
    } else {
        // Proceso padre
        int status;
        wait(&status);
        printf("Padre: hijo terminó. Estado: %d\n", status);
    }
    
    return 0;
}
```

---

## Compilar y ejecutar en Linux

```bash
gcc -o programa programa.c
./programa
```

---

## Analogía con el Simulador

En el **Simulador de Gestión de Procesos**:
- `fork()` → Crear un nuevo proceso
- `exec()` → Cargar un programa en memoria
- `wait()` → Esperar a que termine (simula la duración)
- Memoria RAM → Espacio disponible para procesos
- Cola de espera → Procesos esperando memoria
