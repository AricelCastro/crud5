# Guía de Despliegue en Azure - Aplicación CRUD de Alumnos

## 🚨 Prerequisito: Suscripción de Azure

Tu cuenta `gerardo.noe07@gmail.com` no tiene ninguna suscripción activa de Azure.

### Activar Suscripción Gratuita de Azure

1. Ve a: https://azure.microsoft.com/free/
2. Inicia sesión con tu cuenta `gerardo.noe07@gmail.com`
3. Completa el registro (requiere tarjeta de crédito/débito para verificación)
4. **Beneficios gratuitos por 12 meses:**
   - $200 USD de crédito para usar en 30 días
   - App Service gratis (F1) - ideal para este proyecto
   - Azure Database for MySQL gratis por 12 meses
   - 750 horas/mes de máquinas virtuales B1s

**No te cobrarán si no superas los límites gratuitos.**

---

## 📦 Preparación (Ya hecho)

✅ Backend compilado: `alumnos/target/alumnos-0.0.1-SNAPSHOT.jar`
✅ Plugin Azure configurado en `pom.xml`
✅ Perfiles de configuración listos (local, azure)

---

## 🚀 Opción 1: Despliegue Automático con Maven (Recomendado)

### Paso 1: Obtener tu Subscription ID

```powershell
az login
az account show --query id -o tsv
```

Copia el ID que aparezca (formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Paso 2: Configurar Subscription ID en pom.xml

Abre `alumnos/pom.xml` y reemplaza:

```xml
<subscriptionId>TU_SUBSCRIPTION_ID</subscriptionId>
```

Por tu ID real.

### Paso 3: Desplegar

```powershell
cd c:\Users\gerar\OneDrive\Desktop\crud\CRUD\alumnos
.\mvnw.cmd azure-webapp:deploy
```

El plugin creará automáticamente:
- Grupo de recursos: `rg-alumnos-crud`
- App Service: `alumnos-crud-api` (tier gratuito F1)
- Región: East US

Tu API estará en: `https://alumnos-crud-api.azurewebsites.net`

### Paso 4: Actualizar Frontend

Edita `front_alumnos/src/App.vue` línea 20:

```javascript
const API = 'https://alumnos-crud-api.azurewebsites.net/alumnos';
```

---

## 🚀 Opción 2: Despliegue Manual con Azure Portal

### Backend (Spring Boot)

1. **Crear App Service:**
   - Portal Azure → "Crear recurso" → "App Service"
   - Nombre: `alumnos-crud-api`
   - Runtime: Java 21
   - Tier: F1 (Free)
   - Región: East US

2. **Configurar variables de entorno:**
   - En "Configuración" → "Variables de entorno":
     ```
     SPRING_PROFILES_ACTIVE=local
     ```

3. **Desplegar JAR:**
   - En "Centro de implementación" → selecciona "Local Git" o "FTP"
   - O usa: `az webapp deploy --resource-group rg-alumnos-crud --name alumnos-crud-api --src-path target/alumnos-0.0.1-SNAPSHOT.jar --type jar`

### Frontend (Vue/Vite)

1. **Compilar para producción:**
   ```powershell
   cd c:\Users\gerar\OneDrive\Desktop\crud\CRUD\front_alumnos
   npm run build
   ```

2. **Crear Static Web App:**
   - Portal Azure → "Crear recurso" → "Static Web App"
   - Nombre: `alumnos-crud-web`
   - Tier: Free
   - Sube la carpeta `dist` generada

---

## 🗄️ Opción 3: Agregar Base de Datos MySQL en Azure (Opcional)

Si quieres usar MySQL en lugar de H2 en Azure:

### 1. Crear MySQL Flexible Server

```powershell
az login

# Crear servidor MySQL
az mysql flexible-server create \
  --resource-group rg-alumnos-crud \
  --name alumnos-mysql-server \
  --location eastus \
  --admin-user adminuser \
  --admin-password "TuPassword123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 8.0.21 \
  --storage-size 32

# Crear base de datos
az mysql flexible-server db create \
  --resource-group rg-alumnos-crud \
  --server-name alumnos-mysql-server \
  --database-name alumnos

# Permitir acceso desde Azure
az mysql flexible-server firewall-rule create \
  --resource-group rg-alumnos-crud \
  --name alumnos-mysql-server \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### 2. Actualizar configuración del App Service

En "Configuración" → "Variables de entorno":

```
SPRING_PROFILES_ACTIVE=azure
AZURE_DB_URL=jdbc:mysql://alumnos-mysql-server.mysql.database.azure.com:3306/alumnos?useSSL=true&requireSSL=true&serverTimezone=UTC
AZURE_DB_USERNAME=adminuser
AZURE_DB_PASSWORD=TuPassword123!
```

### 3. Reiniciar App Service

```powershell
az webapp restart --name alumnos-crud-api --resource-group rg-alumnos-crud
```

---

## 🧪 Verificar Despliegue

### Backend
```powershell
curl https://alumnos-crud-api.azurewebsites.net/alumnos/traer-alumnos
```

### Frontend
Abre en navegador: `https://alumnos-crud-web.azurewebsites.net`

---

## 📝 Resumen de Recursos Creados

| Recurso | Nombre | Tier | Costo |
|---------|--------|------|-------|
| Resource Group | rg-alumnos-crud | - | Gratis |
| App Service Plan | ASP-rgalumnoscrud | F1 | Gratis |
| App Service (API) | alumnos-crud-api | F1 | Gratis |
| Static Web App (Frontend) | alumnos-crud-web | Free | Gratis |
| MySQL (Opcional) | alumnos-mysql-server | Burstable B1ms | ~$15/mes |

---

## 🔧 Comandos Útiles

```powershell
# Ver logs en tiempo real
az webapp log tail --name alumnos-crud-api --resource-group rg-alumnos-crud

# Reiniciar app
az webapp restart --name alumnos-crud-api --resource-group rg-alumnos-crud

# Ver configuración
az webapp config appsettings list --name alumnos-crud-api --resource-group rg-alumnos-crud

# Eliminar todo
az group delete --name rg-alumnos-crud --yes
```

---

## ❓ Soporte

Si tienes problemas:
1. Verifica que tengas suscripción activa: `az account list --output table`
2. Revisa logs: Portal Azure → App Service → "Log stream"
3. Valida que el JAR se generó: `ls alumnos/target/*.jar`

---

**Nota:** La base de datos H2 en modo `file` no funcionará correctamente en Azure App Service porque el sistema de archivos es efímero. Para producción real, usa MySQL con el perfil `azure` o cambia H2 a modo memoria (`jdbc:h2:mem:alumnosdb`).
