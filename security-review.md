# Security Review - Alertas Payroll Backend

**Fecha:** 2026-03-20
**Revisor:** Security Reviewer (automated)
**Alcance:** `backend/AlertasPayroll.API/`
**Severidad:** CRITICA / ALTA / MEDIA / BAJA / OK

---

## 1. Credenciales hardcodeadas en appsettings.json

**Severidad: OK (con observacion)**

`appsettings.json` usa placeholders `${DB_SERVER}`, `${DB_USER}`, `${DB_PASSWORD}` en la connection string. Estos NO son interpolados por .NET (es texto literal), pero la logica en `Program.cs` (lineas 26-40) correctamente lee las credenciales desde variables de entorno y solo usa el appsettings como fallback.

- Las credenciales reales NO estan en appsettings.json.
- El patron de env vars en `Program.cs` es correcto.

**Observacion:** El placeholder `${DB_SERVER}` en appsettings.json es engañoso porque .NET no interpola esa sintaxis bash. Si las env vars no estan definidas, la connection string literal con `${DB_SERVER}` se usara tal cual y fallara. Considerar reemplazar con un valor descriptivo como `REQUIRED_VIA_ENV_VARS`.

---

## 2. .gitignore - Exclusion de .env y user-secrets

**Severidad: OK**

El `.gitignore` incluye correctamente:

```
.env
*.env
!.env.example    (permite commitear el ejemplo sin secretos)
secrets.json
*.user
```

Archivos `.env` y secretos de usuario estan protegidos.

---

## 3. Connection String - Encrypt=True

**Severidad: OK**

Ambas connection strings (appsettings.json y Program.cs linea 34) incluyen:

```
Encrypt=True;TrustServerCertificate=False;
```

La comunicacion con SQL Server Azure esta cifrada y valida el certificado del servidor. Configuracion correcta.

---

## 4. SQL Injection en Controllers

**Severidad: OK**

Se encontro un unico controller (`HealthController.cs`) con una consulta SQL directa:

```csharp
command.CommandText = "SELECT GETDATE()";
```

Esta consulta es una cadena estatica SIN concatenacion de input del usuario. No hay riesgo de SQL injection.

`ApplicationDbContext` esta configurado correctamente via Entity Framework Core, que parametriza automaticamente las consultas.

---

## 5. Secrets expuestos en archivos del proyecto

**Severidad: CRITICA**

### 5a. `credentials.txt` (raiz del proyecto)

El archivo `credentials.txt` contiene credenciales de produccion en texto plano:

```
Usuario: sqlSoporteAnalista
Pass: PayrollKfcSoporte2025$
URL: sqldbpayroll-ec.650b0dbba4d7.database.windows.net
```

**Este archivo NO esta en .gitignore** y sera commiteado si se inicializa un repositorio git.

### 5b. `.env` (raiz del proyecto)

El archivo `.env` contiene las mismas credenciales reales:

```
DB_SERVER=sqldbpayroll-ec.650b0dbba4d7.database.windows.net
DB_USER=sqlSoporteAnalista
DB_PASSWORD=PayrollKfcSoporte2025$
```

**Mitigado:** `.env` SI esta en `.gitignore`. Sin embargo, si el repo ya fue inicializado y el .env fue commiteado antes de agregar la regla al .gitignore, las credenciales podrian estar en el historial de git.

---

## 6. credentials.txt - Recomendacion

**Severidad: CRITICA**

`credentials.txt` DEBE ser agregado a `.gitignore` de forma inmediata. Ademas:

1. **Agregar a .gitignore:** `credentials.txt` y `credentials*` como patron.
2. **Eliminar del repositorio:** Si ya fue commiteado, ejecutar `git rm --cached credentials.txt` y limpiar el historial con `git filter-branch` o BFG Repo Cleaner.
3. **Rotar credenciales:** Asumir que las credenciales estan comprometidas si el repositorio fue compartido o publicado. Cambiar la contraseña del usuario `sqlSoporteAnalista` en Azure SQL.
4. **Migrar a un vault:** Mover credenciales a Azure Key Vault, GitHub Secrets, o similar. Nunca almacenar credenciales en archivos planos en el proyecto.

---

## Hallazgos adicionales

### 7. Swagger habilitado en produccion

**Severidad: MEDIA**

`Program.cs` (lineas 49-55) habilita Swagger en todos los ambientes, no solo en Development. Esto expone la documentacion completa de la API en produccion.

**Recomendacion:** Envolver en `if (app.Environment.IsDevelopment())`.

### 8. Leak de informacion en errores

**Severidad: BAJA**

`HealthController.cs` linea 48 retorna `ex.Message` al cliente en respuestas 503. Los mensajes de excepcion de SQL Server pueden contener nombres de servidor, bases de datos, o detalles de configuracion.

**Recomendacion:** Retornar un mensaje generico al cliente y loguear el detalle internamente.

### 9. Directorio bin/ contiene copia de appsettings.json

**Severidad: BAJA**

`bin/Debug/net8.0/appsettings.json` es una copia del appsettings original. Esta cubierto por `.gitignore` (`bin/`), pero verificar que no se incluya accidentalmente en imagenes Docker o despliegues.

---

## Resumen de acciones requeridas

| Prioridad | Accion | Estado |
|-----------|--------|--------|
| CRITICA | Agregar `credentials.txt` y `credentials*` a `.gitignore` | Pendiente |
| CRITICA | Eliminar `credentials.txt` del tracking de git si fue commiteado | Pendiente |
| CRITICA | Rotar credenciales de `sqlSoporteAnalista` si el repo fue compartido | Pendiente |
| CRITICA | Migrar credenciales a Azure Key Vault o servicio de secretos | Pendiente |
| MEDIA | Deshabilitar Swagger en produccion | Pendiente |
| BAJA | Sanitizar mensajes de error en HealthController | Pendiente |

---

*Reporte generado automaticamente como parte de la revision de seguridad del equipo Alertas Payroll.*
