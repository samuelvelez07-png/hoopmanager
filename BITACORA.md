# Bitácora de Cambios del Proyecto

Este documento registra de forma cronológica todas las modificaciones, adiciones y eliminaciones realizadas en el código base y configuración del proyecto.

---

## [2026-11-20] - Modificación y Eliminación de Partidos Programados
- **Descripción**: Se implementó la capacidad completa de modificar y eliminar partidos directamente desde la interfaz del sistema, permitiendo corregir asignaciones erróneas de equipos, jornadas, fechas u horarios:
  1. **Modal de Edición de Partidos (`#modal-match-edit`)**:
     - Modal dedicado con diseño responsive y soporte para selección de Equipo Local y Visitante (con validación para impedir seleccionar el mismo equipo en ambos lados).
     - Campos para editar Número de Jornada, Fecha (`<input type="date">`), Hora (`<input type="time">`) y Sede / Cancha.
     - Botón de acción destructiva `🗑️ Eliminar Partido` integrado en el modal y botón `Guardar Cambios`.
  2. **Controles en Cada Tarjeta de Partido (`renderMatches`)**:
     - Incorporación del botón `✏️ Editar` para abrir directamente el formulario de modificación con todos los datos pre-cargados del partido.
     - Incorporación del botón `🗑️` para eliminación rápida con confirmación previa del usuario.
  3. **Endpoints en Backend y Persistencia en PostgreSQL**:
     - `POST /api/matches/update`: Actualiza `round`, `home_team_id`, `away_team_id`, `match_date`, `match_time`, `venue` y limpia de forma segura estadísticas huérfanas en `match_player_stats` si los equipos participantes cambiaron.
     - `DELETE /api/matches?id=...` y `POST /api/matches/delete` (fallback): Elimina el partido en PostgreSQL y sus registros asociados por cascada referencial.
  4. **Sincronización Local y Notificaciones**:
     - Métodos `store.updateMatch` y `store.deleteMatch` con actualización inmediata del estado local (`localStorage`), re-renderizado reactivo de la vista y alertas Toast de éxito.
- **Archivos Modificados**:
  - `[MODIFICADO]` [`backend/server.py`](file:///home/ubuntu/Documents/SM/backend/server.py) - Endpoints `/api/matches/update`, `/api/matches/delete` y soporte `DELETE /api/matches`.
  - `[MODIFICADO]` [`index.html`](file:///home/ubuntu/Documents/SM/index.html) y [`frontend/index.html`](file:///home/ubuntu/Documents/SM/frontend/index.html) - Modal `#modal-match-edit` con formulario `#form-edit-match`.
  - `[MODIFICADO]` [`app.js`](file:///home/ubuntu/Documents/SM/app.js) y [`frontend/app.js`](file:///home/ubuntu/Documents/SM/frontend/app.js) - Métodos `updateMatch`, `deleteMatch`, `openEditMatchModal`, `confirmDeleteMatch`, botones en tarjeta y listener de formulario.
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Registro de cambios.
- **Estado de Verificación**: Pruebas de integración API en backend y pruebas automáticas de interfaz con Chromium headless verificando renderizado de botones y apertura de modal con valores precargados.

---

## [2026-11-16] - Corrección Error 404 en Vercel: Ubicación de Assets en Raíz y Limpieza de Configuración
- **Descripción**: Se solucionó el error `404: NOT_FOUND` al acceder al dominio en Vercel. La causa raíz fue que Vercel, al compilar un repositorio estático con directorio raíz `./`, busca obligatoriamente el archivo `index.html` en la raíz del proyecto. Al estar ubicado únicamente dentro de `frontend/`, Vercel no encontraba la página inicial.
  1. **Assets Estáticos en Raíz**: Se copiaron `index.html`, `styles.css`, `app.js` y `html2pdf.bundle.min.js` a la raíz del repositorio, manteniéndolos también en `frontend/`.
  2. **Actualización de `vercel.json`**: Se simplificó la regla de enrutamiento para que sirva directamente los archivos estáticos de la raíz y reescriba `/api/*` hacia el túnel seguro que conecta con el PostgreSQL local.
  3. **Limpieza de Archivos Vite Residuales**: Se archivaron `frontend/package.json`, `frontend/vite.config.js` y `frontend/src/` para evitar que Vercel intente ejecutar comandos de compilación automáticos innecesarios.
  4. **Compatibilidad Local**: Se actualizó `FRONTEND_DIR` en `backend/server.py` para resolver dinámicamente desde la raíz o desde `frontend/`.
- **Archivos Modificados**:
  - `[MODIFICADO]` [`vercel.json`](file:///home/ubuntu/Documents/SM/vercel.json) - Enrutamiento directo y limpio.
  - `[NUEVO]` [`index.html`](file:///home/ubuntu/Documents/SM/index.html), [`styles.css`](file:///home/ubuntu/Documents/SM/styles.css), [`app.js`](file:///home/ubuntu/Documents/SM/app.js) en la raíz.
  - `[MODIFICADO]` [`backend/server.py`](file:///home/ubuntu/Documents/SM/backend/server.py) - Resolución de `FRONTEND_DIR`.
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Documentación.
- **Estado de Verificación**: Validación mediante `curl -I` localmente y a través del túnel seguro Cloudflare, confirmando respuesta exitosa `HTTP/2 200 OK` para `index.html`.

---

## [2026-11-16] - Migración y Preparación para Despliegue en Vercel (Dominio Gratis .vercel.app)
- **Descripción**: Se estructuró y preparó el proyecto completo para su despliegue en **Vercel**, permitiendo obtener un dominio público gratuito con certificado SSL automático (`https://[nombre].vercel.app`), entrega ultrarrápida mediante CDN global y funciones serverless:
  1. **Configuración de Rutas en Vercel (`vercel.json`)**:
     - Se definió el mapeo y reescritura de peticiones para servir los archivos estáticos del frontend (`frontend/index.html`, `styles.css`, `app.js`, etc.) y dirigir todas las peticiones `/api/*` hacia la función serverless de Python.
  2. **Punto de Entrada Serverless (`api/index.py`)**:
     - Creación del handler serverless oficial de Vercel compatible con la arquitectura REST de `HoopManagerHandler`.
     - Definición de dependencias de producción en `requirements.txt` (`psycopg2-binary>=2.9.9`).
  3. **Compatibilidad con Bases de Datos PostgreSQL en la Nube**:
     - Se actualizó `get_db_connection()` en `backend/server.py` para soportar variables de entorno estándar `DATABASE_URL` o `POSTGRES_URL` con modo SSL obligatorio (`sslmode=require`), permitiendo conectar proveedores cloud gratuitos (Neon.tech, Supabase o Vercel Postgres).
     - Se mantiene total compatibilidad de fallback con PostgreSQL local para desarrollo en esta máquina.
  4. **Persistencia de Sesiones Serverless**:
     - Creación de la tabla `app_sessions` en PostgreSQL para almacenar y validar tokens de autenticación entre distintas instancias de funciones serverless, evitando desconexiones de sesión en entornos stateless.
  5. **Control de Versiones y Documentación**:
     - Inicialización del repositorio Git local con exclusiones en `.gitignore` y `.vercelignore`.
     - Redacción de la guía paso a paso [`VERCEL_DEPLOY.md`](file:///home/ubuntu/Documents/SM/VERCEL_DEPLOY.md) detallando la creación de la base de datos cloud gratuita, vinculación con GitHub e importación en el panel de Vercel.
- **Archivos Creados/Modificados**:
  - `[NUEVO]` [`vercel.json`](file:///home/ubuntu/Documents/SM/vercel.json) - Enrutamiento para Vercel.
  - `[NUEVO]` [`api/index.py`](file:///home/ubuntu/Documents/SM/api/index.py) - Handler serverless de Python.
  - `[NUEVO]` [`requirements.txt`](file:///home/ubuntu/Documents/SM/requirements.txt) - Dependencias Python para Vercel.
  - `[NUEVO]` [`.vercelignore`](file:///home/ubuntu/Documents/SM/.vercelignore) y [`.gitignore`](file:///home/ubuntu/Documents/SM/.gitignore) - Reglas de exclusión.
  - `[NUEVO]` [`VERCEL_DEPLOY.md`](file:///home/ubuntu/Documents/SM/VERCEL_DEPLOY.md) - Guía completa de despliegue.
  - `[MODIFICADO]` [`backend/server.py`](file:///home/ubuntu/Documents/SM/backend/server.py) - Soporte para `DATABASE_URL` y persistencia de sesiones en tabla `app_sessions`.
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Registro cronológico.
- **Estado de Verificación**: Prueba local de importación e inicialización del handler serverless (`python3 -c "from api.index import handler"`) confirmando compatibilidad y ejecución sin errores.

---

## [2026-11-16] - Consola de Partido: Checkbox de Disputó Partido y Ajuste en Cálculo de Promedios
- **Descripción**: Se añadió un control interactivo (checkbox con badge indicador de estado `SÍ / NO`) en la **Consola de Partido** al lado de la columna de faltas personales (`FP`) para registrar si el jugador disputó activamente el encuentro. Este dato es crucial para las estadísticas individuales y el cálculo real de promedios:
  1. **Consola de Partido (Box Score Interactivo)**:
     - Incorporación de columna con encabezado `¿DISPUTÓ?` situada inmediatamente al lado de la columna de faltas (`FP`).
     - Checkbox interactivo estilizado con acento verde y etiqueta visual `SÍ` (verde `#10b981`) o `NO` (rojo `#f87171`).
     - Al desmarcar el checkbox (`togglePlayerPlayed`): la fila se atenúa visualmente (opacidad 0.45), los campos numéricos (PTS, REB, AST, FP) se deshabilitan y pasan a 0 para evitar estadísticas accidentales en jugadores que no ingresaron al partido (DNP - Did Not Play).
     - Al re-marcar el checkbox: los campos se reactivan para permitir el ingreso normal de números.
  2. **Persistencia en PostgreSQL**:
     - Migración automática en backend (`server.py`) asegurando la columna `played BOOLEAN DEFAULT TRUE` en la tabla `match_player_stats`.
     - Actualización del endpoint `POST /api/matches/player-stats` para recibir y realizar upsert del estado `played`.
     - La persistencia automática al guardar o exportar (`persistConsoleMatchData`) sincroniza el valor booleano en la base de datos PostgreSQL.
  3. **Cálculo de Promedios y Partidos Jugados (`PJ`)**:
     - En `store.getPlayerStatsLeaderboard()`: si un jugador no disputó el partido (`stats.played === false`), dicho partido **NO** se computa dentro de sus Partidos Jugados (`gamesPlayed / PJ`) ni suma ceros artificiales que penalicen sus promedios.
     - Los promedios (`PPG`, `RPG`, `APG`, `FPG`) se calculan con exactitud matemática dividiendo las estadísticas acumuladas únicamente entre los partidos en los que el jugador efectivamente vio acción en cancha.
  4. **Exportaciones CSV y Box Score PDF**:
     - En la planilla CSV (`exportMatchConsoleCSV`): se añade la columna `Disputo Partido` con valores `SI` o `NO (DNP)`.
     - En el reporte PDF (`exportMatchConsolePDF`): los jugadores que no disputaron el partido se muestran con distintivo `DNP` y estilo atenuado profesional.
- **Archivos Modificados**:
  - `[MODIFICADO]` [`backend/server.py`](file:///home/ubuntu/Documents/SM/backend/server.py) - Migración de columna `played` y soporte en `POST /api/matches/player-stats`.
  - `[MODIFICADO]` [`frontend/app.js`](file:///home/ubuntu/Documents/SM/frontend/app.js) - Interfaz de checkbox en consola, función `togglePlayerPlayed`, persistencia en DB, lógica de promedios en `getPlayerStatsLeaderboard` y soporte en exportaciones CSV/PDF.
  - `[MODIFICADO]` [`frontend/index.html`](file:///home/ubuntu/Documents/SM/frontend/index.html) - Incremento de versión de caché a `v=20261116_01`.
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Documentación técnica y registro cronológico del cambio.
- **Estado de Verificación**: Validación mediante script automatizado con Chromium headless (`scratch/test_match_console_played.py`):
  - Apertura exitosa de la consola de partido con checkboxes interactivos.
  - Validación de desmarcado, deshabilitación de inputs y guardado en PostgreSQL verificando `played = false` en la tabla `match_player_stats`.
  - Validación de exclusión del partido en el cálculo de `gamesPlayed` y promedios individuales.
  - Generación de captura de pantalla de verificación: [`match_console_played_preview.png`](file:///home/ubuntu/.gemini/antigravity-ide/brain/07077038-39d4-4a7b-a890-782926d4964a/match_console_played_preview.png).

---

## [2026-11-15] - Ajuste PDF: Top 10 en Estadísticas y Eliminación de Playoffs y Totales en Posiciones
- **Descripción**: Se aplicaron los ajustes solicitados por el usuario en las exportaciones oficiales a PDF:
  1. **Top 10 en Estadísticas Individuales**:
     - En el reporte individual por categoría (`exportCategoryStatsPDF`): ahora se limita la clasificación estrictamente a los mejores 10 jugadores (`.slice(0, 10)`), actualizando subtítulo y totales a `TOTALES TOP 10`.
     - En el reporte consolidado (`exportStatsLeaderboardPDF`): se limitó la tabla general consolidada y los rankings individuales por categoría (Puntos, Rebotes, Asistencias y Faltas) al Top 10 de jugadores clasificados, ajustando los títulos y la fila de totales y promedios a `TOTALES Y PROMEDIOS (TOP 10)`.
  2. **Tabla de Posiciones (`exportStandingsPDF`)**:
     - Se eliminó completamente la etiqueta y distintivo de `Playoffs` en la columna de equipos y en las filas.
     - Se eliminó la fila final de `TOTALES ACUMULADOS`, logrando una presentación más limpia y directa de la clasificación.
     - Se depuró la nota explicativa al pie de la tabla para no incluir menciones a playoffs o zonas de clasificación.
- **Archivos Modificados**:
  - `[MODIFICADO]` [`frontend/app.js`](file:///home/ubuntu/Documents/SM/frontend/app.js) - Limitación al Top 10 en estadísticas, retiro de texto "Playoffs" y de la fila de totales acumulados en posiciones.
  - `[MODIFICADO]` [`frontend/index.html`](file:///home/ubuntu/Documents/SM/frontend/index.html) - Incremento de versión de caché a `v=20261115_02`.
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Registro de cambios.
- **Estado de Verificación**: Generación y verificación de capturas de pantalla con Chromium headless (`scratch/test_exports_pdf.py`):
  - `standings_pdf_preview.png`: Verificado sin badge/texto de Playoffs y sin fila de totales acumulados.
  - `stats_pdf_preview.png` y `cat_points_pdf_preview.png`: Verificados mostrando estrictamente los 10 mejores jugadores clasificados con sus totales correspondientes.

---

## [2026-11-15] - Exportación PDF Oficial de Posiciones y Estadísticas Individuales (Criterio Box Score)
- **Descripción**: Se aplicó el mismo criterio oficial de exportación a PDF utilizado en la planilla Box Score a la **Tabla de Posiciones** y a las **Estadísticas Individuales** de los jugadores. Se diseñaron documentos con fondo blanco de alto contraste, dimensiones estándar para impresión A4 portrait (720px), encabezado oficial HoopManager en azul oscuro con línea naranja, tarjetas resumen y podios de destacados, tablas con insignias de podio y totales, pie de página oficial con fecha y hora de emisión, y sin bloques de firmas:
  1. **Tabla Oficial de Posiciones en PDF (`exportStandingsPDF`)**:
     - Encabezado oficial con identificación de torneo, total de equipos y regla de desempate activa (`Diferencia PF-PC` o `Basket Average PF/PC`).
     - Banner resumen de tres tarjetas: Puntero del Torneo, Estadísticas Globales (partidos disputados, puntos totales y promedio de puntos por juego) y Regla de Puntuación (+2 pts victoria / +1 pt derrota).
     - Tabla completa con columnas `POS` (insignias 🥇, 🥈, 🥉, `#4`), `EQUIPO` (con logo, nombre, siglas y distintivo verde `Playoffs` para los 4 primeros clasificados), `PJ`, `PG`, `PP`, `PF`, `PC`, `DIF`, `AVG` y `PTS` (destacada en naranja).
     - Fila final de Totales Acumulados y nota informativa al pie explicando la zona de clasificación a semifinales/playoffs.
  2. **Reporte General de Estadísticas Individuales en PDF (`exportStatsLeaderboardPDF`)**:
     - Encabezado con total de jugadores evaluados y torneo activo.
     - 4 Tarjetas de Líderes Destacados del Torneo: Máximo Anotador (PTS, PPG en naranja), Líder en Rebotes (REB, RPG en verde), Líder en Asistencias (AST, APG en azul) y Control de Faltas (FP, FPG en rojo).
     - Tabla consolidada completa con insignias de ranking, dorsal, jugador, equipo con logo, posición, PJ, PTS, PPG, REB, RPG, AST, APG, FP y FPG.
     - Fila de Totales y Promedios globales al final de la tabla.
  3. **Reporte PDF por Categoría Individual (`exportCategoryStatsPDF`)**:
     - Módulo para exportar rankings individuales de Puntos (`pts`), Rebotes (`reb`), Asistencias (`ast`) o Faltas (`fouls`).
     - Tarjetas destacadas de Podio Oficial (🥇 1° Lugar, 🥈 2° Lugar y 🥉 3° Lugar) con foto/dorsal, equipo, total y promedio.
     - Tabla detallada de la categoría con columna de estadística resaltada con el color temático de la métrica y fila de totales.
  4. **Exportación de Vista Actual en PDF (`exportCurrentStatsPDF`)**:
     - Botón inteligente que detecta la categoría activa seleccionada por el usuario en la interfaz y exporta de inmediato su PDF específico, o el reporte consolidado si está en "Vista Dividida" o "Tabla Consolidada".
  5. **Controles en la Interfaz de Usuario**:
     - Pestaña Posiciones: Incorporación del botón `📄 Exportar Posiciones PDF`.
     - Pestaña Estadísticas: Botones `📄 Vista PDF` y `📄 Todo PDF` en la barra superior; botón `📄 PDF` en cada tarjeta de categoría individual; y botón `📄 Exportar Tabla a PDF` en la tarjeta consolidada.
- **Archivos Modificados**:
  - `[MODIFICADO]` [`frontend/app.js`](file:///home/ubuntu/Documents/SM/frontend/app.js) - Creación de `exportStandingsPDF`, `exportCategoryStatsPDF` y `exportCurrentStatsPDF`, rediseño completo de `exportStatsLeaderboardPDF` e integración de botones en `renderStats()`.
  - `[MODIFICADO]` [`frontend/index.html`](file:///home/ubuntu/Documents/SM/frontend/index.html) - Inclusión de botones en HTML e incremento de versión a `v=20261115_01`.
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Documentación técnica y registro cronológico de cambios.
- **Estado de Verificación**: Validación en Chromium headless con pruebas automatizadas ([`test_exports_pdf.py`](file:///home/ubuntu/.gemini/antigravity-ide/brain/07077038-39d4-4a7b-a890-782926d4964a/scratch/test_exports_pdf.py)), confirmando generación exitosa de vistas previas:
  - `standings_pdf_preview.png`: Tabla oficial de posiciones con podio, banner resumen, zona de clasificación y pie sin firmas.
  - `stats_pdf_preview.png`: Reporte general de estadísticas con los 4 líderes destacados, tabla consolidada y promedios.
  - `cat_points_pdf_preview.png`: Reporte de categoría de puntos con podio de los 3 mejores anotadores y tabla ordenada.
- **Descripción**: Diagnóstico y resolución del problema por el cual no se visualizaban datos en la consola de partido o se perdían tras exportar. Se confirmó que PostgreSQL almacena correctamente todos los registros y se solventaron tres causas de raíz:
  1. **Auto-Persistencia al Exportar (PDF y CSV)**: Las funciones `exportMatchConsoleCSV` y `exportMatchConsolePDF` ahora invocan automáticamente `persistConsoleMatchData(matchId, false)`, guardando de inmediato en PostgreSQL (`/api/matches/score` y `/api/matches/player-stats`) y en el almacén de memoria (`store.matches`) cualquier dato editado en la consola antes de generar el archivo.
  2. **Corrección de Error en Botón de Guardado**: Se corrigió un `ReferenceError: renderAll is not defined` en `saveMatchConsole` (reemplazado por `render()`), el cual interrumpía la ejecución al finalizar el partido. Además, se añadió estado de carga visual en el botón (`💾 Guardando en PostgreSQL...`) y retroalimentación mediante mensajes flotantes tipo Toast (`showToastNotification`).
  3. **Poblado de Estadísticas Iniciales en PostgreSQL**: Se incorporaron y sembraron en la base de datos `hoopmanager_db` (y en [`backend/database/seed.sql`](file:///home/ubuntu/Documents/SM/backend/database/seed.sql)) los registros de `match_player_stats` correspondientes a los partidos iniciales finalizados (partidos 1, 2 y 3), asegurando que al abrir la consola o exportar se muestren las estadísticas reales de cada jugador (puntos, rebotes, asistencias y faltas) y no casillas vacías en cero.
- **Archivos Modificados**:
  - `[MODIFICADO]` [`frontend/app.js`](file:///home/ubuntu/Documents/SM/frontend/app.js) - Creación de `persistConsoleMatchData`, integración en `saveMatchConsole`, `exportMatchConsoleCSV` y `exportMatchConsolePDF`, e incorporación de `showToastNotification`.
  - `[MODIFICADO]` [`frontend/index.html`](file:///home/ubuntu/Documents/SM/frontend/index.html) - Incremento de versión de recursos a `v=20261108_01`.
  - `[MODIFICADO]` [`backend/database/seed.sql`](file:///home/ubuntu/Documents/SM/backend/database/seed.sql) - Inserción de estadísticas completas de jugadores para partidos finalizados.
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Documentación técnica del cambio.
- **Estado de Verificación**: Validación en base de datos PostgreSQL (`hoopmanager_db`), verificación de backend con `hoopmanager.service` activo y prueba end-to-end con Chromium headless verificando persistencia de cambios tras exportar y recargar la página.

---

## [2026-11-07] - Ajuste Box Score PDF: Eliminación de Líneas de Firmas
- **Descripción**: Se removió el bloque inferior que contenía las líneas de firmas para árbitros (Principal y Auxiliar) y mesa técnica / planilleros, manteniendo un pie de página oficial limpio con marca de tiempo, plataforma y diseño optimizado.
- **Archivos Modificados**:
  - `[MODIFICADO]` [`frontend/app.js`](file:///home/ubuntu/Documents/SM/frontend/app.js) - Eliminación del bloque de firmas dentro de la plantilla HTML del Box Score.
  - `[MODIFICADO]` [`frontend/index.html`](file:///home/ubuntu/Documents/SM/frontend/index.html) - Incremento de versión de recursos a `v=20261107_02`.
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Registro de cambios.
- **Estado de Verificación**: Generación y verificación de captura de pantalla con Chromium headless confirmando pie de página limpio sin líneas de firmas.

---

## [2026-11-07] - Nuevo Estilo de Exportación PDF: Box Score Oficial de Baloncesto
- **Descripción**: Rediseño integral de la exportación a PDF de la consola de partido para abandonar la réplica directa del modal interactivo y adoptar un formato oficial **Box Score** de baloncesto (estilo FIBA / NBA). Utiliza el mismo conjunto de datos consolidado que la exportación CSV (`exportMatchConsoleCSV`), generando un documento limpio, de alto contraste en fondo blanco, óptimo para impresión A4, archivo oficial y distribución.
- **Detalle del Formato Box Score Implementado**:
  1. **Encabezado Oficial**: Identificador de torneo, fecha, hora, sede (cancha) y jornada.
  2. **Scoreboard Principal**: Nombres de equipos, logos e indicador visual del resultado final y estado del juego.
  3. **Marcador por Cuartos (Line Score)**: Desglose punto por punto (Q1, Q2, Q3, Q4, OT y Total).
  4. **Planillas Box Score por Equipo**: Tablas individuales para el equipo Local y Visitante con Dorsal (`#`), Nombre del Jugador, Posición (`POS`), Puntos (`PTS`), Rebotes (`REB`), Asistencias (`AST`) y Faltas Personales (`FP`), más la fila de `TOTALES`.
  5. **Líderes Destacados del Partido**: Tarjetas resumen del Máximo Anotador, Líder en Rebotes y Líder en Asistencias.
  6. **Pie de Página Oficial**: Marca de tiempo y acreditación de plataforma.
- **Archivos Modificados**:
  - `[MODIFICADO]` [`frontend/app.js`](file:///home/ubuntu/Documents/SM/frontend/app.js) - Sustitución de `window.exportMatchConsolePDF` por el generador de plantilla Box Score y actualización de títulos de botones a "📄 Box Score PDF".
  - `[MODIFICADO]` [`frontend/index.html`](file:///home/ubuntu/Documents/SM/frontend/index.html) - Incremento de versión de caché a `v=20261107_01`.
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Documentación del cambio.
- **Estado de Verificación**: Probado y validado en navegador headless con Chromium y generación de imagen previa confirmando diseño impecable, alineación adecuada y exportación exitosa tanto desde la lista de partidos como desde la consola activa.

---

## [2026-11-06] - Eliminación de Muestra de Credenciales en Pantalla de Login
- **Descripción**: Se removió el bloque informativo que exponía las credenciales oficiales (`admin / admin2026`) en el formulario de acceso por razones de seguridad y discreción. El formulario de inicio de sesión mantiene intacta la validación contra la base de datos y backend para el usuario `admin` con contraseña `admin2026`, presentando una tarjeta de acceso limpia, centrada y sin pistas de texto.
- **Archivos Modificados**:
  - `[MODIFICADO]` [`frontend/index.html`](file:///home/ubuntu/Documents/SM/frontend/index.html) - Eliminación del bloque `.login-credentials-hint` e incremento de la versión de recursos a `v=20261106_09`.
  - `[MODIFICADO]` [`frontend/styles.css`](file:///home/ubuntu/Documents/SM/frontend/styles.css) - Remoción de estilos huérfanos asociados a `.login-credentials-hint`.
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Registro de cambios.
- **Estado de Verificación**: Servicio `hoopmanager.service` reiniciado y verificado activo. Comprobación de HTML mediante `curl` y captura visual de pantalla mediante Chromium headless confirmando que la tarjeta de inicio de sesión ya no muestra el texto ni los recuadros de credenciales.

---

## [2026-11-06] - Implementación de Sistema de Autenticación y Pantalla de Login (admin / admin2026)
- **Descripción**: Creación del módulo completo de autenticación de administradores para proteger la plataforma HoopManager. La interfaz principal queda resguardada tras una pantalla de acceso con diseño temático de baloncesto (efecto glassmorphism oscuro, orbe naranja neón brillante, alertas animadas, selector de visibilidad de contraseña y retroalimentación interactiva). El sistema valida credenciales oficiales (`usuario: admin`, `contraseña: admin2026`), emite tokens criptográficos de sesión (`secrets.token_hex(24)`), sincroniza con tabla `app_users` en PostgreSQL y mantiene la sesión persistente en el navegador mediante `localStorage` con botón de cierre de sesión (`🚪 Salir`) en la barra de navegación.
- **Archivos Modificados**:
  - `[MODIFICADO]` [`backend/server.py`](file:///home/ubuntu/Documents/SM/backend/server.py) -
    1. Creación automática en `migrate_db()` de la tabla `app_users` y siembra del usuario `admin` con hash criptográfico SHA-256 de `admin2026`.
    2. Registro en memoria de sesiones activas `ACTIVE_SESSIONS`.
    3. Endpoint `POST /api/login`: Validación de credenciales, generación de token único y retorno de perfil de usuario.
    4. Endpoint `GET /api/auth/verify`: Verificación de tokens de sesión activos vía encabezado `Authorization: Bearer <token>`.
    5. Endpoint `POST /api/logout`: Revocación del token y cierre de sesión seguro.
    6. Actualización de cabeceras CORS para permitir `Authorization` y `X-Auth-Token`.
  - `[MODIFICADO]` [`frontend/index.html`](file:///home/ubuntu/Documents/SM/frontend/index.html) - Inclusión del contenedor de inicio de sesión `#login-view`, envoltura del panel administrativo en `#app-wrapper`, distintivo de sesión con nombre de usuario y botón de salida en la barra de navegación; actualización a versión `v=20261106_08`.
  - `[MODIFICADO]` [`frontend/styles.css`](file:///home/ubuntu/Documents/SM/frontend/styles.css) - Estilos para `.login-backdrop`, `.login-card`, `.login-badge-icon` con pulso y halo neón, inputs de login, botón con degradado deportivo y animación `shakeAlert` ante credenciales inválidas.
  - `[MODIFICADO]` [`frontend/app.js`](file:///home/ubuntu/Documents/SM/frontend/app.js) - Flujo de inicio `checkAuthAndInit()`, métodos `handleLoginSubmit()`, `togglePasswordVisibility()` y `logout()`, preservación de sesión con `localStorage` y prevención de doble inicialización de componentes.
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Registro cronológico de cambios.
- **Estado de Verificación**: Probado y validado en backend con pruebas automatizadas (rechazo de contraseñas erróneas con código 401, emisión correcta de token con credenciales autorizadas, verificación y revocación de sesión) y comprobación visual completa mediante capturas Chromium (pantalla de login y panel administrativo activo tras iniciar sesión).

---

## [2026-11-06] - Corrección de Exportación PDF Incompleta: Captura Total Multi-Página y Sin Recortes
- **Descripción**: Solución definitiva al problema de exportación en PDF donde la planilla aparecía cortada o incompleta (solo se capturaba la porción visible de la pantalla mientras que el resto de las tablas y el equipo visitante quedaban truncados). Se reemplazó la manipulación directa del modal interactivo por un modelo de renderizado basado en clon DOM aislado, redimensionado a 700px (ancho exacto del estándar A4 portrait sin recortes horizontales ni barras de scroll) y con paginación limpia (`pagebreak`) que distribuye la consola en páginas consecutivas con fondo azul oscuro `#0f172a` al 100%.
- **Archivos Modificados**:
  - `[MODIFICADO]` [`frontend/app.js`](file:///home/ubuntu/Documents/SM/frontend/app.js) - Reescritura integral de `exportMatchConsolePDF()`:
    1. Clona el `.modal-content` de forma desacoplada para no alterar la pantalla del usuario ni causar saltos de scroll.
    2. Suprime todos los botones y elementos con clase `.no-print-pdf`.
    3. Sustituye limpiamente cada `<input>` por un `<span>` tipográfico estático (`.pdf-value-badge`) con su valor exacto actual.
    4. Elimina cualquier limitación de altura (`max-height: none; overflow: visible`) en el clon y en las tablas internas.
    5. Inserta un salto de página inteligente (`page-break-before: always`) antes del equipo visitante para que la primera página contenga la cabecera, marcador global, progreso por cuartos y planilla local, y la segunda página contenga la planilla visitante íntegra y el pie de página oficial.
    6. Calcula dinámicamente la altura mínima del clon como múltiplo exacto de páginas A4 para que el fondo `#0f172a` cubra toda la extensión de cada página generada sin franjas blancas.
  - `[MODIFICADO]` [`frontend/index.html`](file:///home/ubuntu/Documents/SM/frontend/index.html) - Incremento de versión de caché a `v=20261106_07`.
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Documentación técnica del cambio.
- **Estado de Verificación**: Probado y validado mediante emulación Chromium headless y generación real de PDF: se confirmó la generación de las 2 páginas A4 completas (100% de jugadores de ambos equipos, todas las columnas PTS, REB, AST, FP sin recortes y sin botones).

---

## [2026-11-06] - Corrección de Error de Sintaxis en app.js y Restauración de Carga de Datos
- **Descripción**: Diagnóstico y corrección de la falta de visualización de datos tras actualizar la página. Se identificó un error de sintaxis en `frontend/app.js` (un fragmento superpuesto de template string en la función auxiliar de impresión `printNativeFallback` antes de `window.exportMatchConsolePDF`), el cual impedía que el navegador ejecutara el script completo y por tanto abortaba la inicialización del store (`initApp()`) en el evento `DOMContentLoaded`.
- **Archivos Modificados**:
  - `[MODIFICADO]` [`frontend/app.js`](file:///home/ubuntu/Documents/SM/frontend/app.js) - Corrección estructural de `printNativeFallback()` con el cierre limpio del bloque template string, permitiendo la interpretación continua sin errores del resto de las funciones.
  - `[MODIFICADO]` [`frontend/index.html`](file:///home/ubuntu/Documents/SM/frontend/index.html) - Incremento de la clave de versión de caché a `v=20261106_06` para `styles.css` y `app.js`, forzando a los navegadores y al proxy de Cloudflare a descargar de inmediato la versión corregida.
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Documentación del incidente y resolución.
- **Estado de Verificación**: Servicio `hoopmanager.service` reiniciado y verificado activo (código 0). Sintaxis de `frontend/app.js` comprobada y validada tanto en local (`http://127.0.0.1:8000`) como a través del túnel Cloudflare (`https://tier-anderson-concord-cape.trycloudflare.com`).

---

## [2026-11-06] - Exportación PDF Fiel de la Consola de Partido (Captura Visual Idéntica sin Botones)
- **Descripción**: Corrección del problema de generación de PDF en blanco (ocasionado por posicionamiento fuera de pantalla) y reescritura del motor de exportación para capturar la ventana de la consola de partido **exactamente como se ve en pantalla** (con su diseño oscuro de alto contraste, marcador destacado, progreso por cuartos y planilla de estadísticas), pero **omitiendo automáticamente todos los botones de acción** (`.no-print-pdf`, "Cerrar", "Guardar", etc.) y reemplazando inputs interactivos por números estáticos nítidos.
- **Archivos Creados y Modificados**:
  - `[NUEVO]` [`frontend/html2pdf.bundle.min.js`](file:///home/ubuntu/Documents/SM/frontend/html2pdf.bundle.min.js) - Motor de captura y generación de PDF local, autónomo y sin dependencias de red.
  - `[MODIFICADO]` [`frontend/styles.css`](file:///home/ubuntu/Documents/SM/frontend/styles.css) - Clase `.pdf-export-mode` que elimina las restricciones de scroll y altura (`max-height: none; overflow: visible`) y oculta todos los botones durante la captura; clase `.pdf-value-badge` para convertir cajas de texto en números sólidos; y directiva `@media print` para soporte nativo del navegador.
  - `[MODIFICADO]` [`frontend/app.js`](file:///home/ubuntu/Documents/SM/frontend/app.js) - Reescritura de `exportMatchConsolePDF()`: toma directamente el `.modal-content` visible en el DOM, reemplaza temporalmente los inputs por insignias de texto con sus valores actuales, activa `.pdf-export-mode`, procesa el PDF a 2x de escala con fondo `#0f172a`, y restaura el estado interactivo de forma transparente.
  - `[MODIFICADO]` [`frontend/index.html`](file:///home/ubuntu/Documents/SM/frontend/index.html) - Inclusión local de `html2pdf.bundle.min.js` y actualización de versión (`v=20261106_04`).
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Registro cronológico de cambios.
- **Detalle de la Solución**:
  1. **Solución a la página en blanco**: Se eliminó el contenedor posicionado a `-9999px` (que causaba que `html2canvas` produjera un lienzo vacío) y se pasó a capturar el elemento en el espacio activo del DOM con `scrollY: 0, scrollX: 0`.
  2. **Captura visual idéntica a la pantalla**: El PDF resultante preserva al 100% la estética deportiva de la ventana: logotipos de los clubes, marcador gigante naranja, tabla de parciales por cuartos y las planillas de jugadores de ambos equipos con sus columnas temáticas (PTS naranja, REB verde, AST azul, FP rojo).
  3. **Supresión total de botones**: Durante el proceso de guardado, todos los botones de la cabecera y el pie de la consola se ocultan automáticamente (`display: none !important`), logrando un documento limpio y listo para imprimir o compartir.
  4. **Conversión limpia de Inputs**: Los inputs numéricos se convierten momentáneamente en etiquetas de texto de alto contraste, garantizando que los valores ingresados por el usuario aparezcan con nitidez tipográfica en el PDF.
- **Estado de Verificación**: Probado y validado en servidor local y túnel Cloudflare con cabeceras `Cache-Control: no-cache`.

---

## [2026-11-06] - Exportación Integral a Formato CSV de Estadísticas y Consola de Partido
- **Descripción**: Implementación del sistema de descarga y exportación a archivos CSV (Comma-Separated Values) con soporte universal para Microsoft Excel (inyección de BOM UTF-8 `\uFEFF`, escape de caracteres especiales y nombres de archivo normalizados). Cubre tanto la planilla completa de la consola de partido (desglose por cuartos, box score por equipos y totales) como todas las vistas de estadísticas individuales (vista actual, líderes por categoría, tabla consolidada y reporte completo multi-sección) y la tabla oficial de posiciones.
- **Archivos Modificados**:
  - `[MODIFICADO]` [`frontend/app.js`](file:///home/ubuntu/Documents/SM/frontend/app.js) - Utilidades de exportación CSV (`escapeCSV`, `cleanFilename`, `downloadCSV`), funciones `exportMatchConsoleCSV()`, `exportStandingsCSV()`, `exportConsolidatedStatsCSV()`, `exportCategoryStatsCSV()`, `exportAllStatsCSV()`, `exportCurrentStatsCSV()`. Agregados botones de exportación CSV directa en tarjetas de fixture y en la consola modal (cabecera y pie).
  - `[MODIFICADO]` [`frontend/index.html`](file:///home/ubuntu/Documents/SM/frontend/index.html) - Botones "📥 Exportar Posiciones CSV" en la cabecera de Posiciones (`tab-standings`) y "📥 Exportar Vista CSV" junto a "📊 Exportar Todo (CSV)" en la sección de Estadísticas (`tab-stats`), además de actualización de cadenas de versión (`v=20261106_01`).
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Registro cronológico de cambios.
- **Detalle de Funcionalidades Implementadas**:
  1. **Consola de Partido a CSV (`exportMatchConsoleCSV`)**: Genera el reporte oficial del partido con metadatos (torneo, jornada, fecha, hora, sede, estado), marcador por cuartos (Q1 a OT y Total), y la planilla de estadísticas completas (box score) para el equipo local y visitante con dorsales, nombres, puestos y métricas (PTS, REB, AST, FP) más la fila de totales de equipo. Si la consola modal está abierta, exporta en tiempo real lo que el usuario está digitando antes de guardar.
  2. **Acceso Rápido en Fixture**: Cada tarjeta de partido en el calendario cuenta con un botón directo `📥 CSV` para descargar la planilla sin necesidad de abrir la consola.
  3. **Estadísticas Individuales a CSV**:
     - *Vista actual*: Descarga el ranking de la categoría activa (Puntos, Rebotes, Asistencias, Faltas o Tabla Consolidada).
     - *Botones directos en tarjetas*: Cada una de las 4 tarjetas de líderes cuenta con su propio botón `📥 CSV` para exportar individualmente.
     - *Exportar Todo (CSV)*: Genera un reporte exhaustivo con 5 secciones completas (Tabla General Consolidada, Líderes en Puntos, Líderes en Rebotes, Líderes en Asistencias y Faltas Personales).
  4. **Tabla de Posiciones a CSV (`exportStandingsCSV`)**: Exporta el ordenamiento oficial del torneo con detalle de POS, Equipo, PJ, PG, PP, PF, PC, Diferencia, Ratio Basket Average y Puntos de clasificación.
  5. **Compatibilidad Excel y Caracteres Especiales**: Uso de prefijo `\uFEFF` (Byte Order Mark UTF-8) para garantizar que acentos, caracteres en español (ñ, tildes) y nombres se abran nítidamente sin caracteres corruptos en cualquier versión de Excel, Calc o Google Sheets.
- **Estado de Verificación**: Probado y validado en servidor local y a través del túnel seguro Cloudflare.

---

## [2026-10-27] - Estadísticas Individuales: Vista Multi-Categoría por Separado en la Misma Ventana
- **Descripción**: Reestructuración integral de la pestaña de estadísticas individuales (`tab-stats`) para permitir visualizar las distintas categorías deportivas (Puntos/Anotación, Rebotes, Asistencias y Faltas Personales) de forma independiente y simultánea en la misma ventana, además de vistas completas por categoría y tabla general consolidada.
- **Archivos Modificados**:
  - `[MODIFICADO]` [`frontend/index.html`](file:///home/ubuntu/Documents/SM/frontend/index.html) - Barra de selector por píldoras deportivas (`stats-pill`) para alternar entre "Vista Dividida (Todas)", "Puntos", "Rebotes", "Asistencias", "Faltas" y "Tabla Consolidada", con contenedor dinámico `#stats-content-area`.
  - `[MODIFICADO]` [`frontend/styles.css`](file:///home/ubuntu/Documents/SM/frontend/styles.css) - Estilos para `.stats-pill`, estados activos con degradados naranja neón, y tarjetas `.stats-category-card` con bordes temáticos diferenciados por categoría (Puntos: Naranja, Rebotes: Verde Esmeralda, Asistencias: Azul Cian, Faltas: Rosa/Rojo).
  - `[MODIFICADO]` [`frontend/app.js`](file:///home/ubuntu/Documents/SM/frontend/app.js) - Métodos `setStatsCategory()`, `renderStats()` dinámico con ordenamiento especializado por métrica (PTS/PPG, REB/RPG, AST/APG, FP/FPG), cálculo de promedios por partido, podios 🥇, 🥈, 🥉 con badges metalizados y desglose de clubes.
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Registro cronológico de cambios.
- **Detalle de Funcionalidades Implementadas**:
  1. **Vista Dividida (Todas)**: Muestra en una cuadrícula responsiva (`grid-2`) 4 tarjetas independientes para cada categoría simultáneamente en pantalla, con su respectivo líder destacado y top jugadores ordenados por su métrica propia.
  2. **Vistas Individuales por Categoría**: Al pulsar cualquiera de las píldoras (🏀 Puntos, 🛡️ Rebotes, 🎯 Asistencias, ⚠️ Faltas), la categoría se expande a ancho completo mostrando el ranking total del torneo.
  3. **Tabla Consolidada**: Vista con las 12 columnas completas para análisis global de rendimiento acumulado.
- **Estado de Verificación**: Probado y operativo tanto en entorno local (`http://localhost:8000`) como a través del túnel público seguro de Cloudflare.

---

## [2026-10-27] - Consola de Partidos: Ampliación de Textbox y Eliminación de Spinners (Increase/Decrease)
- **Descripción**: Optimización de la experiencia de ingreso de resultados y estadísticas en la consola interactiva de partidos (`modal-match-console` y `MatchCenter`). Se eliminaron las flechas y botones nativos de incremento y decremento (`spinners / steppers`) en todos los inputs numéricos para evitar que obstruyan la visibilidad del valor. Asimismo, se ampliaron las dimensiones (ancho, alto, tipografía y espaciado) de los textboxes tanto en la tabla de marcadores por cuartos (Q1 a OT) como en la planilla de estadísticas por jugador (PTS, REB, AST, FP) con auto-selección de texto al hacer foco (`onfocus="this.select()"`).
- **Archivos Modificados**:
  - `[MODIFICADO]` [`frontend/styles.css`](file:///home/ubuntu/Documents/SM/frontend/styles.css) - Reglas CSS para supresión de spinners (`::-webkit-inner-spin-button`, `::-webkit-outer-spin-button`, `-moz-appearance: textfield`, `appearance: textfield`) y clases dedicadas `.quarter-score-input` y `.stat-input` con estados hover y focus deportivos.
  - `[MODIFICADO]` [`frontend/index.html`](file:///home/ubuntu/Documents/SM/frontend/index.html) - Cache-busting en llamadas a `styles.css?v=...` y `app.js?v=...`, e inserción de estilos críticos embebidos en el `<head>`.
  - `[MODIFICADO]` [`frontend/app.js`](file:///home/ubuntu/Documents/SM/frontend/app.js) - Actualización de las plantillas de marcadores por cuartos y planilla de jugadores con clases, dimensiones inline directas y activación de `onfocus="this.select()"`.
  - `[MODIFICADO]` [`backend/server.py`](file:///home/ubuntu/Documents/SM/backend/server.py) - Inyección de cabeceras HTTP `Cache-Control: no-cache, no-store, must-revalidate` para forzar a Cloudflare y a los navegadores a no retener versiones antiguas en caché.
  - `[MODIFICADO]` [`frontend/src/index.css`](file:///home/ubuntu/Documents/SM/frontend/src/index.css) - Reglas de diseño y supresión de spinners en el entorno React.
  - `[MODIFICADO]` [`frontend/src/components/MatchCenter.jsx`](file:///home/ubuntu/Documents/SM/frontend/src/components/MatchCenter.jsx) - Sincronización de clases y auto-selección en el componente React.
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Registro cronológico de cambios.
- **Detalle de Mejoras**:
  - **Inputs de Marcadores por Cuartos**: Dimensiones aumentadas a `72px × 44px` con tipografía de `1.15rem` en negrita, centrado visual y halo de foco naranja.
  - **Inputs de Estadísticas de Jugadores**: Dimensiones aumentadas a `68px × 40px` con tipografía de `1.05rem` en negrita, centrado visual y halo de foco azul.
  - **Sin Spinners de Flechas**: Área de texto 100% limpia sin botones que tapen los dígitos.
  - **Invalidación de Caché**: Cabeceras anti-caché y versionado query en assets para despliegue instantáneo a través de túneles Cloudflare.
- **Estado de Verificación**: Servidor local y Cloudflare Tunnel sirviendo los estilos actualizados con código HTTP 200 y `Cache-Control: no-cache`.

---

## [2026-10-26] - Reestructuración Modular: Separación de Backend y Frontend
- **Descripción**: Reorganización completa del proyecto en el explorador de archivos separando claramente las responsabilidades en dos directorios principales: `backend/` y `frontend/`. Se adaptó el servidor en Python para resolver y servir los recursos estáticos desde la nueva ruta modular `frontend/`, se actualizó el servicio systemd `hoopmanager.service` y se comprobó la interoperabilidad del túnel de Cloudflare y la API de PostgreSQL.
- **Archivos Creados / Modificados / Movidos**:
  - `[NUEVO DIRECTORIO]` [`backend/`](file:///home/ubuntu/Documents/SM/backend) - Contenedor de la lógica del servidor y base de datos:
    - [`backend/server.py`](file:///home/ubuntu/Documents/SM/backend/server.py) - Servidor HTTP y API REST con soporte de directorio estático dinámico (`FRONTEND_DIR`).
    - [`backend/database/`](file:///home/ubuntu/Documents/SM/backend/database) - Esquemas (`schema.sql`) y datos iniciales (`seed.sql`).
  - `[NUEVO DIRECTORIO]` [`frontend/`](file:///home/ubuntu/Documents/SM/frontend) - Contenedor de la interfaz de usuario:
    - [`frontend/index.html`](file:///home/ubuntu/Documents/SM/frontend/index.html) - Plantilla principal HTML5.
    - [`frontend/styles.css`](file:///home/ubuntu/Documents/SM/frontend/styles.css) - Estilos CSS globales.
    - [`frontend/app.js`](file:///home/ubuntu/Documents/SM/frontend/app.js) - Controlador y Store cliente.
    - [`frontend/package.json`](file:///home/ubuntu/Documents/SM/frontend/package.json) & [`frontend/vite.config.js`](file:///home/ubuntu/Documents/SM/frontend/vite.config.js) - Configuración Vite.
    - [`frontend/src/`](file:///home/ubuntu/Documents/SM/frontend/src) - Componentes y utilidades React.
  - `[MODIFICADO]` `/etc/systemd/system/hoopmanager.service` - Actualización de `WorkingDirectory` y `ExecStart` apuntando a `backend/`.
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Registro cronológico de cambios.
- **Estado de Verificación**:
  - Peticiones locales a `http://127.0.0.1:8000/`, `styles.css` y `app.js`: Código 200 OK verificado.
  - Petición al endpoint REST `/api/tournaments`: Código 200 OK con conexión a PostgreSQL verificado.
  - Petición remota a través del túnel de Cloudflare: Código 200 OK verificado.

---

## [2026-10-26] - Despliegue de Túnel Público Seguro con Cloudflare (cloudflared)
- **Descripción**: Instalación oficial de la herramienta `cloudflared` (arquitectura Linux aarch64), configuración del servicio backend `server.py` como servicio systemd (`hoopmanager.service`) con persistencia relacional en PostgreSQL, y despliegue del túnel de Cloudflare como servicio systemd persistente (`hoopmanager-tunnel.service`) mediante protocolo HTTP/2. Exposición del sitio y sus endpoints REST de forma pública con certificado SSL/TLS automático.
- **Archivos Creados / Modificados**:
  - `[NUEVO]` `/usr/local/bin/cloudflared` - Binario ejecutable oficial de Cloudflare.
  - `[NUEVO]` `/etc/systemd/system/hoopmanager.service` - Servicio systemd del backend en Python (`server.py`) en el puerto 8000 con reinicio automático.
  - `[NUEVO]` `/etc/systemd/system/hoopmanager-tunnel.service` - Servicio systemd para el túnel de Cloudflare en segundo plano con logging continuo.
  - `[NUEVO]` [`tunnel_url.txt`](file:///home/ubuntu/Documents/SM/tunnel_url.txt) - Archivo con la URL pública activa del túnel.
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Registro cronológico de cambios.
- **Detalle de Configuración**:
  - **Servidor Local**: `http://127.0.0.1:8000` (sirve frontend y API REST `/api/*`).
  - **Protocolo de Túnel**: `HTTP/2` (para máxima estabilidad y compatibilidad de red).
  - **URL Pública**: `https://tier-anderson-concord-cape.trycloudflare.com`
- **Estado de Verificación**:
  - Petición HTTP directa al túnel: Código 200 OK verificado con SSL.
  - Petición al endpoint REST `/api/tournaments` a través del túnel: Respuesta JSON desde PostgreSQL verificada con éxito.

---

## [2026-10-12] - Edición y Modificación Integral de Nóminas y Plantillas de Equipos
- **Descripción**: Implementación completa de la funcionalidad para editar y modificar las nóminas de jugadores de cualquier equipo una vez creado. Permite modificar los datos del club (nombre, abreviatura, color, escudo emoji), editar los datos de cada jugador existente (nombre, dorsal, posición, estatura), agregar nuevos jugadores hasta un máximo reglamentario de 16, y eliminar jugadores con protección estricta para nunca descender del mínimo reglamentario de 5 jugadores. Sincronización atómica y persistencia relacional en PostgreSQL.
- **Archivos Creados / Modificados**:
  - `[MODIFICADO]` [`index.html`](file:///home/ubuntu/Documents/SM/index.html) - Estructura del modal `modal-team-edit` con formulario de club, tabla interactiva de edición de nómina, indicador de cupos en tiempo real, botón para añadir jugadores adicionales y acciones de guardado/cancelación.
  - `[MODIFICADO]` [`app.js`](file:///home/ubuntu/Documents/SM/app.js) - Botón de edición `✏️ Editar Nómina` en cada tarjeta de equipo, métodos de controlador `openEditTeamModal()`, `renderEditRosterTable()`, `addEditPlayerRow()`, `removeEditPlayerRow()`, `saveEditRosterFromInputs()` y método en Store `updateTeamAndRoster()` con sincronización en PostgreSQL y estado local.
  - `[MODIFICADO]` [`server.py`](file:///home/ubuntu/Documents/SM/server.py) - Endpoint transaccional `POST /api/teams/update-roster` con validación estricta de cupos (5 a 16 jugadores), actualización de datos del club en `teams`, actualización (`UPDATE`) o creación (`INSERT`) de registros en `players` y baja controlada (`DELETE`) de jugadores descartados.
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Registro cronológico de cambios.
- **Detalle de Funcionalidades Implementadas**:
  1. **Acceso Directo desde la Tarjeta**: Cada equipo en la pestaña "Equipos" cuenta con el botón `✏️ Editar Nómina`.
  2. **Edición en Caliente de la Nómina**: Modificación directa de nombres, dorsales, posiciones y alturas en una interfaz tabular deportiva.
  3. **Adición Dinámica hasta 16 Jugadores**: Permite incorporar jugadores suplentes adicionales de forma individual hasta el tope de 16 jugadores. Al llegar a 16, el botón de añadir se bloquea automáticamente.
  4. **Protección de Mínimo Reglamentario (5 Jugadores)**: Si la plantilla tiene exactamente 5 jugadores, el sistema deshabilita el botón de eliminar y bloquea cualquier intento de dejar menos de 5 jugadores.
  5. **Sincronización Atómica en PostgreSQL**: Los cambios se guardan en la base de datos relacional `hoopmanager_db` manteniendo la consistencia de IDs de jugadores y actualizando el estado visual de toda la plataforma en tiempo real.
- **Estado de Verificación**:
  - Endpoint `POST /api/teams/update-roster` probado con 6 jugadores: Aceptado y persistido en PostgreSQL (HTTP 200).
  - Intento con 4 jugadores: Rechazado correctamente con HTTP 400 (`La nómina debe tener entre 5 y 16 jugadores. Se recibieron 4.`).
  - Intento con 17 jugadores: Rechazado correctamente con HTTP 400 (`La nómina debe tener entre 5 y 16 jugadores. Se recibieron 17.`).
  - Servidor backend ejecutándose en segundo plano en `http://localhost:8000`.

---

## [2026-10-12] - Modificación de Ingreso de Jugadores (Mínimo 5 a Máximo 16 Jugadores)
- **Descripción**: Actualización integral del sistema de ingreso de plantillas para equipos. Ahora se parte de un quinteto mínimo reglamentario (5 jugadores) y se permite la adición manual dinámica hasta un tope máximo de 16 jugadores, con protección de borrado, validación de cupos y guardado en PostgreSQL.
- **Archivos Creados / Modificados**:
  - `[MODIFICADO]` [`index.html`](file:///home/ubuntu/Documents/SM/index.html) - Interfaz con tabla dinámica de jugadores, botones para añadir jugador individual (`+ Añadir Jugador Manualmente`), presets de quinteto titular (5) y plantilla completa (16), botones de eliminación por fila con protección y badge de conteo en tiempo real.
  - `[MODIFICADO]` [`app.js`](file:///home/ubuntu/Documents/SM/app.js) - Lógica de plantilla dinámica en frontend: `activeModalRoster`, `generateRosterPreset()`, `renderDynamicRosterTable()`, `removePlayerRow()`, bloqueo automático del botón de adición al alcanzar 16 jugadores y validación de mínimo 5.
  - `[MODIFICADO]` [`server.py`](file:///home/ubuntu/Documents/SM/server.py) - Validación estricta en el endpoint `POST /api/teams` para rechazar plantillas fuera del rango de 5 a 16 jugadores con código HTTP 400 y mensaje explicativo.
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Registro cronológico de cambios.
- **Detalle de Funcionalidades Implementadas**:
  1. **Inicio en 5 Jugadores**: Al abrir el modal de nuevo equipo, la tabla presenta por defecto 5 jugadores (Base, Escolta, Alero, Ala-Pívot y Pívot).
  2. **Adición Manual hasta 16**: Permite agregar jugadores uno a uno hasta alcanzar 16. Al llegar a 16, el botón de agregar se deshabilita visualmente.
  3. **Protección de Mínimo Obligatorio**: Si la plantilla tiene 5 jugadores, el botón de eliminar se desactiva e impide descender de 5.
  4. **Contador en Tiempo Real**: Muestra el indicador `[ X / 16 Jugadores (Mínimo 5) ]` con cambio dinámico de color.
  5. **Validación Backend en PostgreSQL**: Se verificó la respuesta ante intentos de guardar menos de 5 o más de 16 jugadores.
- **Estado de Verificación**: 
  - Prueba de 4 jugadores: Rechazado correctamente (HTTP 400).
  - Prueba de 5 jugadores: Aceptado y guardado correctamente en PostgreSQL (HTTP 200).
  - Prueba de 16 jugadores: Aceptado y guardado correctamente en PostgreSQL (HTTP 200).
  - Prueba de 17 jugadores: Rechazado correctamente (HTTP 400).

---

## [2026-10-12] - Sistema Multi-Torneo y Gestión de Equipos con Plantilla de 15 Jugadores
- **Descripción**: Implementación integral del sistema multi-torneo, creación de clubes con nómina oficial de 15 jugadores (distribuidos en 3 PG, 3 SG, 3 SF, 3 PF y 3 C), generador de plantilla base, y programación de partidos con aislamiento estricto por torneo.
- **Archivos Creados / Modificados**:
  - `[MODIFICADO]` [`index.html`](file:///home/ubuntu/Documents/SM/index.html) - Selector global de torneo en la cabecera, botón y modal para crear torneos, modal de inscripción de equipos con tabla de 15 jugadores, selector de escudos emoji y modal de programación de partidos por torneo.
  - `[MODIFICADO]` [`app.js`](file:///home/ubuntu/Documents/SM/app.js) - Lógica de torneos múltiples en `Store`, generador de nóminas base de 15 jugadores (`generate15PlayerRoster`), aislamiento de tabla de posiciones, fixture y estadísticas según el torneo activo.
  - `[MODIFICADO]` [`server.py`](file:///home/ubuntu/Documents/SM/server.py) - Nuevos endpoints REST: `GET /api/tournaments`, `POST /api/tournaments`, `POST /api/teams` con inserción transaccional de 15 jugadores y `POST /api/matches/batch`.
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Registro cronológico de cambios.
- **Detalle de Funcionalidades Implementadas**:
  1. **Creación y Cambio de Torneos**: Permite crear torneos con nombre, categoría, temporada y criterio de desempate, alternando instantáneamente entre torneos activos desde el selector superior.
  2. **Plantilla Oficial de 15 Jugadores**: Al crear un equipo, se configuran los 15 jugadores con sus respectivos dorsales, posiciones reglamentarias (3 Bases, 3 Escoltas, 3 Aleros, 3 Ala-Pívots y 3 Pívots) y estaturas. Incluye botón de autogeneración y edición manual.
  3. **Partidos y Fixture Aislados por Torneo**: La generación automática Round-Robin y la creación manual de partidos solo emparejan equipos pertenecientes al torneo activo seleccionado.
  4. **Persistencia Transaccional en PostgreSQL**: Equipos y sus 15 jugadores se guardan en una sola transacción en las tablas `teams` y `players` de `hoopmanager_db`.
- **Estado de Verificación**: Probada creación de torneo (ID: 2) y equipo con 15 jugadores en PostgreSQL mediante API. Verificada la inserción de los 15 registros en la base de datos relacional. Servidor activo en `http://localhost:8000`.

---

## [2026-10-12] - Instalación y Configuración de PostgreSQL como Motor de Base de Datos
- **Descripción**: Instalación oficial de PostgreSQL, configuración de credenciales de acceso con la contraseña solicitada (`smserver_db`), creación de base de datos relacional `hoopmanager_db`, scripts DDL/Seed e integración con API backend.
- **Archivos Creados / Modificados**:
  - `[NUEVO]` [`database/schema.sql`](file:///home/ubuntu/Documents/SM/database/schema.sql) - Esquema relacional DDL con tablas `tournaments`, `teams`, `players`, `matches` y `match_player_stats`.
  - `[NUEVO]` [`database/seed.sql`](file:///home/ubuntu/Documents/SM/database/seed.sql) - Datos iniciales de demostración migrados a PostgreSQL.
  - `[NUEVO]` [`server.py`](file:///home/ubuntu/Documents/SM/server.py) - Servidor backend en Python con endpoints REST (`/api/teams`, `/api/matches`, `/api/status`, etc.) conectado a PostgreSQL mediante `psycopg2`.
  - `[MODIFICADO]` [`app.js`](file:///home/ubuntu/Documents/SM/app.js) - Integración frontend con la API de PostgreSQL para sincronización y persistencia de equipos y marcadores.
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Registro de cambios.
- **Detalle de Configuración del Motor**:
  - **Motor**: PostgreSQL 12
  - **Host / Puerto**: `127.0.0.1:5432`
  - **Base de Datos**: `hoopmanager_db`
  - **Usuario**: `postgres`
  - **Contraseña**: `smserver_db`
- **Estado de Verificación**: Conexión por TCP/IP verificada con autenticación por contraseña. Endpoints `/api/status` y `/api/teams` respondiendo exitosamente en `http://localhost:8000`.

---

## [2026-10-01] - Corrección de Atributos HTML y Estilos
- **Descripción**: Corrección de compatibilidad en `index.html` y `app.js` para asegurar la aplicación estricta de las reglas CSS de diseño.
- **Archivos Modificados**:
  - `[MODIFICADO]` [`index.html`](file:///home/ubuntu/Documents/SM/index.html) - Corrección de atributos `className` a sintaxis estándar `class`.
  - `[MODIFICADO]` [`app.js`](file:///home/ubuntu/Documents/SM/app.js) - Corrección de plantillas HTML generadas dinámicamente con atributos `class`.
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Registro de cambios.
- **Estado de Verificación**: Estilos visuales CSS y diseño responsive funcionando correctamente.

---

## [2026-10-01] - Despliegue de Servidor de Desarrollo Local
- **Descripción**: Activación del servidor web de desarrollo local para previsualizar y ejecutar la aplicación HoopManager.
- **Archivos Modificados**:
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md)
- **Detalle de Cambios**:
  - Se configuró y puso en marcha un servidor HTTP local en el puerto **`8000`** (y alternativamente puerto **`3000`**).
- **Estado de Verificación**: Servidor activo y escuchando en `http://localhost:8000` e `http://localhost:3000`.

---

## [2026-09-30] - Implementación Inicial de la Aplicación HoopManager
- **Descripción**: Desarrollo integral de la plataforma web de administración de torneos de baloncesto (HoopManager).
- **Archivos Creados / Modificados**:
  - `[NUEVO]` [`index.html`](file:///home/ubuntu/Documents/SM/index.html) - Estructura HTML5 responsiva con tipografía deportiva Google Fonts ('Outfit' e 'Inter').
  - `[NUEVO]` [`styles.css`](file:///home/ubuntu/Documents/SM/styles.css) - Design System completo con CSS moderno (dark mode deportivo, glassmorphism, tablas responsivas, badges e inputs customizados).
  - `[NUEVO]` [`app.js`](file:///home/ubuntu/Documents/SM/app.js) - Motor principal JavaScript ES6 con gestión de estado global, persistencia LocalStorage, algoritmos de Basket Average y fixture automático.
  - `[NUEVO]` [`src/context/TournamentContext.jsx`](file:///home/ubuntu/Documents/SM/src/context/TournamentContext.jsx) - Contexto de estado React para arquitectura basada en componentes.
  - `[NUEVO]` [`src/utils/basketballStats.js`](file:///home/ubuntu/Documents/SM/src/utils/basketballStats.js) - Algoritmo de cálculo de Basket Average (diferencia y cociente), tabla de posiciones y estadísticas por jugador (PPG).
  - `[NUEVO]` [`src/utils/fixtureGenerator.js`](file:///home/ubuntu/Documents/SM/src/utils/fixtureGenerator.js) - Generador automático de calendarios "Todos contra todos" (Round-Robin).
  - `[NUEVO]` [`src/data/initialData.js`](file:///home/ubuntu/Documents/SM/src/data/initialData.js) - Datos de prueba (Seed Data) con 6 equipos, jugadores por posición y partidos con desglose de cuartos.
  - `[NUEVO]` [`src/components/Navbar.jsx`](file:///home/ubuntu/Documents/SM/src/components/Navbar.jsx) - Barra de navegación y control de pestañas.
  - `[NUEVO]` [`src/components/Dashboard.jsx`](file:///home/ubuntu/Documents/SM/src/components/Dashboard.jsx) - Panel principal con métricas KPI y resumen del torneo.
  - `[NUEVO]` [`src/components/TeamsManager.jsx`](file:///home/ubuntu/Documents/SM/src/components/TeamsManager.jsx) - Administrador de clubes y nóminas de jugadores por puesto.
  - `[NUEVO]` [`src/components/ScheduleManager.jsx`](file:///home/ubuntu/Documents/SM/src/components/ScheduleManager.jsx) - Administrador de fixture y lista de partidos por jornada.
  - `[NUEVO]` [`src/components/MatchCenter.jsx`](file:///home/ubuntu/Documents/SM/src/components/MatchCenter.jsx) - Consola interactiva de partido con marcadores por cuartos (Q1-Q4, OT) y estadísticas de jugadores.
  - `[NUEVO]` [`src/components/StandingsTable.jsx`](file:///home/ubuntu/Documents/SM/src/components/StandingsTable.jsx) - Tabla de posiciones oficial con alternancia de desempate (PF-PC y PF/PC).
  - `[NUEVO]` [`src/components/StatsLeaderboard.jsx`](file:///home/ubuntu/Documents/SM/src/components/StatsLeaderboard.jsx) - Tabla de líderes de anotación (PPG) y tripleros.
  - `[NUEVO]` [`src/App.jsx`](file:///home/ubuntu/Documents/SM/src/App.jsx) & [`src/main.jsx`](file:///home/ubuntu/Documents/SM/src/main.jsx) - Punto de entrada React.
  - `[MODIFICADO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md) - Actualización con el registro del desarrollo.
- **Detalle de Funcionalidades Implementadas**:
  1. **Configuración de Torneo**: Nombre, categoría, temporada y selección de criterio de desempate (Diferencia de Puntos vs Basket Average Ratio).
  2. **Gestión de Equipos y Jugadores**: Creación/edición de clubes con colores y logos emoji, registro de jugadores con dorsal, puesto (PG, SG, SF, PF, C) y estatura.
  3. **Fixture Automático**: Algoritmo Round-Robin para generación instantánea del calendario.
  4. **Consola de Marcador por Cuartos**: Registro en vivo o finalización de partidos por cuartos (Q1, Q2, Q3, Q4, OT) con auto-suma de marcador.
  5. **Tabla de Posiciones Dinámica**: Cálculo en tiempo real de PJ, PG, PP, PF, PC, Diferencia, Ratio Basket Avg y Puntos (2 victoria, 1 derrota, 0 no presentación).
  6. **Líderes de Anotación**: Rankings de anotadores (PPG) y encestadores de triples con podio visual.
  7. **Persistencia**: LocalStorage automático con botón de restablecimiento de datos demo.
- **Estado de Verificación**: Servidor de desarrollo ejecutándose correctamente en `http://localhost:3000`.

---

## [2026-09-30] - Inicialización de la Bitácora del Proyecto
- **Descripción**: Creación e inicialización del archivo de bitácora oficial para el control de cambios del proyecto.
- **Archivos Creados**:
  - `[NUEVO]` [`BITACORA.md`](file:///home/ubuntu/Documents/SM/BITACORA.md)
- **Detalle de Cambios**:
  - Se establece la estructura estándar de registro de cambios.
  - Se define la política de modificaciones requerida por el usuario (aprobación explícita previa a cualquier cambio).
- **Estado de Verificación**: Archivo creado correctamente en la raíz del proyecto.
