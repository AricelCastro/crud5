

# 🚀 Guía Completa: Despliegue de Aplicación CRUD a Azure

## ✅ Estado Actual
- ✅ Backend (Spring Boot) compilado: `alumnos\target\alumnos-0.0.1-SNAPSHOT.jar`
- ✅ Frontend (Vue) listo: `front_alumnos\`
- ✅ Base de datos: MySQL

---

## 📋 Pasos para Desplegar

### **Paso 1: Crear Suscripción de Azure (Si no tienes)**

1. Ve a: https://azure.microsoft.com/free/
2. Inicia sesión (crea cuenta si es necesario)
3. Activa la **prueba gratuita** (recibirás $200 USD de crédito por 30 días)
4. ✅ Deberías tener una suscripción activa

---

### **Paso 2: Instalar Azure CLI**

Abre PowerShell como Administrador y ejecuta:

```powershell
# Opción A: Con Chocolatey (si está instalado)
choco install azure-cli -y

# Opción B: Descargar directamente
# Ve a: https://aka.ms/installazurecliwindows
# Descarga y ejecuta el installer
```

**Verifica la instalación:**
```powershell
az --version
```

---

### **Paso 3: Iniciar Sesión en Azure**

```powershell
az login
```

Se abrirá un navegador para que inicies sesión. Cuando termine, regresa a la terminal.

---

### **Paso 4: Obtener tu Subscription ID**

```powershell
az account show --query id -o tsv
```

**Copia el ID que aparezca** (formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

---

### **Paso 5: Configurar el pom.xml**

Edita `alumnos\pom.xml` y reemplaza:

```xml
<subscriptionId>TU_SUBSCRIPTION_ID</subscriptionId>
```

Por tu ID real obtenido en el paso anterior.

**Ejemplo:**
```xml
<subscriptionId>12345678-1234-1234-1234-123456789012</subscriptionId>
```

---

### **Paso 6: Crear SQL Database en Azure**

```powershell
# Crear servidor SQL
az sql server create `
  --resource-group rg-alumnos-crud `
  --name alumnos-sql-server `
  --admin-user sqladmin `
  --admin-password "SqlPwd123!Secure"

# Crear base de datos
az sql db create `
  --resource-group rg-alumnos-crud `
  --server alumnos-sql-server `
  --name alumnos_tec_alumnos `
  --edition Free
```

**Anota:**
- Servidor: `alumnos-sql-server.database.windows.net`
- Usuario: `sqladmin@alumnos-sql-server`
- Contraseña: `SqlPwd123!Secure`
- Base de datos: `alumnos_tec_alumnos`

---

### **Paso 7: Crear la Tabla en SQL Database**

Abre Azure Portal y:

1. Ve a tu **SQL Database** → `alumnos_tec_alumnos`
2. Haz clic en **"Editor de consultas"**
3. Inicia sesión con:
   - Usuario: `sqladmin@alumnos-sql-server`
   - Contraseña: `SqlPwd123!Secure`
4. Copia y ejecuta este SQL:

```sql
CREATE TABLE alumno (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    numero_control VARCHAR(50),
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100),
    carrera VARCHAR(100),
    imagen_url TEXT
);
```

5. Haz clic en **"Ejecutar"**

---

### **Paso 8: Actualizar application-azure.properties**

Edita `alumnos\src\main\resources\application-azure.properties`:

```properties
spring.datasource.url=jdbc:sqlserver://alumnos-sql-server.database.windows.net:1433;database=alumnos_tec_alumnos;user=sqladmin@alumnos-sql-server;password=SqlPwd123!Secure;encrypt=yes;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30;
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.database-platform=org.hibernate.dialect.SQLServerDialect
```

---

### **Paso 9: Actualizar pom.xml para SQL Server**

Edita `alumnos/pom.xml` y añade esta dependencia en la sección `<dependencies>`:

```xml
<dependency>
    <groupId>com.microsoft.sqlserver</groupId>
    <artifactId>mssql-jdbc</artifactId>
    <scope>runtime</scope>
</dependency>
```

---

### **Paso 10: Compilar JAR (última vez)**

```powershell
cd c:\Users\HP\Desktop\crud4\alumnos
mvn clean package -DskipTests
```

El JAR estará en: `c:\Users\HP\Desktop\crud4\alumnos\target\alumnos-0.0.1-SNAPSHOT.jar`

Guárdalo en un lugar accesible, lo usaremos en Azure.

---

### **Paso 11: Crear App Service en Azure Portal (MANUAL)**

1. Abre: https://portal.azure.com
2. Haz clic en **"+ Crear un recurso"**
3. Busca y selecciona **"App Service"**
4. Haz clic en **"Crear"**

**Completa el formulario así:**

| Campo | Valor |
|-------|-------|
| **Suscripción** | Tu suscripción activa |
| **Grupo de recursos** | `rg-alumnos-crud` (el que ya creaste) |
| **Nombre** | `alumnos-crud-api` |
| **Publicar** | Código |
| **Pila en tiempo de ejecución** | Java 17 |
| **Sistema operativo** | Linux |
| **Región** | Centro de EE.UU. (centralus) |
| **Plan App Service** | Crear nuevo (F1 - Gratuito) |

5. Haz clic en **"Revisar + crear"** → **"Crear"**
6. Espera a que se despliegue (2-3 minutos)

---

### **Paso 12: Obtener credenciales FTP para subir el JAR**

Una vez creado el App Service:

1. Ve a tu recurso `alumnos-crud-api`
2. En el menú izquierdo, busca **"Centro de implementación"**
3. Selecciona la pestaña **"FTP"**
4. Verás un panel con:
   - **Nombre de host FTP**
   - **Nombre de usuario**
   - **Contraseña**

Copia estos datos.

---

### **Paso 13: Subir el JAR por FTP**

**Opción A: Con FileZilla (Recomendado)**

1. Descarga FileZilla: https://filezilla-project.org/
2. Abre FileZilla
3. Ve a **Archivo → Gestor de sitios**
4. Crea nuevo sitio con:
   - **Protocolo**: FTP
   - **Host**: `[Tu Nombre de host FTP]`
   - **Usuario**: `[Tu usuario FTP]`
   - **Contraseña**: `[Tu contraseña FTP]`
5. Conecta
6. Navega a `/site/wwwroot`
7. **Arrastra el JAR** desde tu PC a esta carpeta

**Opción B: Con Azure Portal (Kudu)**

1. En tu App Service, ve a **"Herramientas avanzadas"** → **"Ir"**
2. Se abrirá Kudu
3. Ve a **"Debug console"** → **"PowerShell"**
4. Navega a `/site/wwwroot`
5. Sube el archivo manualmente

---

### **Paso 14: Configurar el Startup Command**

En tu App Service en Azure Portal:

1. Ve a **"Configuración"**
2. Busca **"Comando de inicio"** (Startup Command)
3. Ingresa:
   ```
   java -jar alumnos-0.0.1-SNAPSHOT.jar --server.port=80
   ```
4. Haz clic en **"Guardar"**

---

### **Paso 15: Configurar Variables de Entorno para SQL Database**

En **"Configuración"** → **"Configuración de la aplicación"**, añade estas variables:

| Nombre | Valor |
|--------|-------|
| `SPRING_PROFILES_ACTIVE` | `azure` |
| `SPRING_DATASOURCE_URL` | `jdbc:sqlserver://alumnos-sql-server.database.windows.net:1433;database=alumnos_tec_alumnos;encrypt=yes;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30;` |
| `SPRING_DATASOURCE_USERNAME` | `sqladmin@alumnos-sql-server` |
| `SPRING_DATASOURCE_PASSWORD` | `SqlPwd123!Secure` |

Haz clic en **"Guardar"**

---

### **Paso 16: Reiniciar el App Service**

1. En la página principal de tu App Service
2. Haz clic en **"Reiniciar"**
3. Espera 1-2 minutos

---

### **Paso 17: Probar el Backend**

Abre en tu navegador:
```
https://alumnos-crud-api.azurewebsites.net/alumnos/traer-alumnos
```

✅ Deberías ver: `[]` (lista vacía) o un JSON con tus alumnos

---

### **Paso 18: Compilar Frontend**

```powershell
cd c:\Users\HP\Desktop\crud4\front_alumnos
npm run build
```

Esto generará la carpeta `dist\` con los archivos optimizados.

---

### **Paso 19: Crear App Service para Frontend (MANUAL)**

Repite el proceso del Paso 11, pero con estos datos:

| Campo | Valor |
|-------|-------|
| **Nombre** | `alumnos-frontend` |
| **Pila en tiempo de ejecución** | Node.js 20 LTS |
| **Grupo de recursos** | `rg-alumnos-crud` (el mismo) |
| **Plan App Service** | F1 - Gratuito |

---

### **Paso 20: Actualizar URL del API en Frontend**

Edita `front_alumnos/src/App.vue` línea 20:

**Cambiar de:**
```javascript
const API = 'http://localhost:8081/alumnos';
```

**A:**
```javascript
const API = 'https://alumnos-crud-api.azurewebsites.net/alumnos';
```

Luego compila de nuevo:
```powershell
cd c:\Users\HP\Desktop\crud4\front_alumnos
npm run build
```

---

### **Paso 21: Subir Frontend por FTP**

Usa el mismo proceso del Paso 13, pero esta vez:

1. Abre FTP con las credenciales del App Service `alumnos-frontend`
2. Navega a `/site/wwwroot`
3. Sube **TODO el contenido de la carpeta `dist`** 
   - index.html
   - assets/ (carpeta completa)

---

### **Paso 22: Configurar Startup Command para Frontend**

En `alumnos-frontend` App Service:

1. Ve a **"Configuración"**
2. **Comando de inicio:**
   ```
   pm2 serve /home/site/wwwroot/index.html --no-daemon --spa
   ```
3. Guarda

---

### **Paso 23: Probar la Aplicación Completa**

Abre en navegador:
```
https://alumnos-frontend.azurewebsites.net
```

✅ Deberías ver tu aplicación Vue funcionando completamente

---

## 🎯 URLs Finales

| Servicio | URL |
|----------|-----|
| **Backend** | `https://alumnos-crud-api.azurewebsites.net` |
| **Frontend** | `https://alumnos-frontend.azurewebsites.net` |
| **Base de Datos** | `alumnos-sql-server.database.windows.net` |

---

## 💳 Costos Estimados

- **App Service Tier F1 (Backend)**: Gratis (12 meses)
- **App Service Tier F1 (Frontend)**: Gratis (12 meses)
- **SQL Database Free Tier**: Gratis (primeros 12 meses)
- **Total en período gratuito**: $0

---

## 🔧 Solución de Problemas

### Error: "Connection refused" o "Unknown database"
→ Verifica que creaste la tabla en SQL Database (Paso 7)

### Error: "Authentication failed" en SQL
→ Verifica las credenciales: `sqladmin@alumnos-sql-server` y contraseña

### El frontend no conecta al backend
→ Actualiza la URL en `App.vue` con la URL correcta de Azure

---

## 📞 Próximos Pasos

1. **Configura un dominio personalizado** (opcional)
2. **Configura CI/CD** con GitHub Actions
3. **Configura SSL/TLS** (automático con Azure)
4. **Monitorea logs** en Azure Portal

¡Listo! Tu aplicación estará en producción en Azure. 🎉
