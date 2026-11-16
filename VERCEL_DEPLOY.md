# Guía Oficial de Despliegue en Vercel (Dominio Gratis .vercel.app)

Esta guía explica paso a paso cómo migrar y publicar **HoopManager** en **Vercel** para obtener un dominio público gratuito con certificado SSL automático (por ejemplo: `https://hoopmanager-app.vercel.app`).

---

## 🏗️ Arquitectura Adaptada para Vercel

El proyecto ya fue configurado y estructurado con compatibilidad serverless nativa:

1. **Frontend**: Los archivos estáticos (`frontend/index.html`, `styles.css`, `app.js`, etc.) se sirven de manera instantánea y ultrarrápida a través de la red CDN global de Vercel gracias a las reglas configuradas en [`vercel.json`](file:///home/ubuntu/Documents/SM/vercel.json).
2. **Backend Serverless**: La API REST (`/api/*`) ahora se ejecuta como una función serverless en Python mediante [`api/index.py`](file:///home/ubuntu/Documents/SM/api/index.py) con dependencias en [`requirements.txt`](file:///home/ubuntu/Documents/SM/requirements.txt).
3. **Autenticación Serverless**: Se adaptó el sistema de sesiones para persistir tokens tanto en memoria como en la tabla `app_sessions` de PostgreSQL, garantizando inicios de sesión válidos entre diferentes invocaciones serverless.
4. **Base de Datos en la Nube**: Vercel es una plataforma serverless y no aloja bases de datos PostgreSQL locales (`localhost`). Para persistir los datos de equipos, jugadores y partidos entre todos los usuarios, se conecta a una base de datos PostgreSQL gratuita en la nube mediante la variable de entorno `DATABASE_URL`.

---

## 🚀 Pasos para Desplegar (en 5 Minutos)

### Paso 1: Crear una Base de Datos PostgreSQL Gratuita en la Nube

Recomendamos **Neon** o **Supabase** (ambos ofrecen planes 100% gratuitos y configurables en 1 minuto):

#### Opción A: Neon (Recomendado - Socio oficial de Vercel)
1. Entra a [neon.tech](https://neon.tech) e inicia sesión con tu cuenta de GitHub o correo.
2. Haz clic en **"Create Project"**, dale un nombre (ej. `hoopmanager-db`) y selecciona una región cercana.
3. Copia la cadena de conexión (**Connection String**). Tendrá un formato similar a:
   ```text
   postgresql://usuario:contraseña@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. En el panel de Neon, ve a la pestaña **SQL Editor**, copia y pega el contenido de [`backend/database/schema.sql`](file:///home/ubuntu/Documents/SM/backend/database/schema.sql) y [`backend/database/seed.sql`](file:///home/ubuntu/Documents/SM/backend/database/seed.sql), y haz clic en **Run**. ¡Listo, tus tablas y datos iniciales quedan creados!

#### Opción B: Supabase
1. Entra a [supabase.com](https://supabase.com) y crea un nuevo proyecto gratuito.
2. Ve a **Project Settings -> Database** y copia el **URI de conexión**.
3. En el **SQL Editor**, ejecuta los scripts de `schema.sql` y `seed.sql`.

---

### Paso 2: Subir el Proyecto a tu Cuenta de GitHub

1. En tu cuenta de [GitHub](https://github.com), crea un nuevo repositorio (puede ser público o privado), por ejemplo: `hoopmanager`.
2. En tu terminal local (dentro de la carpeta `/home/ubuntu/Documents/SM`), vincula y sube el código:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/hoopmanager.git
   git branch -M main
   git push -u origin main
   ```

---

### Paso 3: Conectar e Importar en Vercel

1. Ingresa a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de **GitHub**.
2. En el panel principal, haz clic en **"Add New..." -> "Project"**.
3. Verás la lista de tus repositorios de GitHub. Haz clic en **"Import"** al lado de `hoopmanager`.
4. En la pantalla de configuración:
   - **Framework Preset**: Puedes dejarlo en *Other* (la configuración la lee automáticamente desde [`vercel.json`](file:///home/ubuntu/Documents/SM/vercel.json)).
   - **Root Directory**: `./` (dejar por defecto).
5. Despliega la sección **Environment Variables** y agrega la siguiente variable:
   - **Key**: `DATABASE_URL`
   - **Value**: *(Pega aquí la cadena de conexión de Neon o Supabase copiada en el Paso 1)*
6. Haz clic en el botón azul **"Deploy"**.

---

### Paso 4: ¡Tu Dominio Gratis está Activo! 🎉

En menos de 60 segundos, Vercel compilará y desplegará tu aplicación. Al finalizar, verás una pantalla de felicitaciones con el dominio gratuito asignado:

👉 `https://hoopmanager-tu-usuario.vercel.app`

- **HTTPS automático**: Certificado SSL gratuito ya activo.
- **Actualizaciones automáticas**: Cada vez que hagas `git push` a tu repositorio, Vercel desplegará automáticamente la nueva versión.
- **Acceso Administrativo**: Podrás iniciar sesión con las credenciales oficiales:
  - **Usuario**: `admin`
  - **Contraseña**: `admin2026`

---

## 📁 Archivos Clave del Despliegue
- [`vercel.json`](file:///home/ubuntu/Documents/SM/vercel.json): Configuración de rutas y reescritura hacia la API serverless y el frontend.
- [`api/index.py`](file:///home/ubuntu/Documents/SM/api/index.py): Punto de entrada de funciones serverless de Vercel.
- [`requirements.txt`](file:///home/ubuntu/Documents/SM/requirements.txt): Dependencias Python requeridas para Vercel (`psycopg2-binary`).
- [`backend/database/schema.sql`](file:///home/ubuntu/Documents/SM/backend/database/schema.sql): Esquema DDL para inicializar cualquier base de datos en la nube.
- [`backend/database/seed.sql`](file:///home/ubuntu/Documents/SM/backend/database/seed.sql): Datos iniciales de torneos, equipos, jugadores y partidos.
