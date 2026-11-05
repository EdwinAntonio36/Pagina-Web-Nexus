# Portal de clientes: puesta en marcha

## Alcance de esta base

- `/clientes`: RFC y contraseña, con el diseño del ZIP adaptado al sitio.
- `/clientes/recuperar`: cambio de contraseña con sesión o enlace de recuperación.
- `/admin` > Clientes: alta de cuentas por el dueño, activar/desactivar acceso y
  cargar/editar/eliminar líneas, adendas y trámites de cada cliente.
- El cliente solo consulta sus propios datos. No puede registrarse por su cuenta,
  modificar registros ni obtener privilegios administrativos.
- No contiene datos reales de clientes ni conexión a Google Sheets. Las secciones
  vacías muestran un mensaje; no se presentan registros ficticios.
- Las adendas son fichas de información (título, fecha, estado y detalle).
  La gestión de documentos y sus descargas queda pendiente de definir. No subir
  documentos de clientes al bucket público del catálogo.

## 1. Base de datos

Ejecutar `05-portal-clientes.sql` completo en Supabase > SQL Editor.
Requiere la tabla `administradores` ya configurada. No cambia sus usuarios.
Ejecutar luego `tests/portal-permisos.sql`: comprueba aislamiento entre dos
clientes, permisos del administrador y bloqueo de cuentas inactivas. La prueba
usa registros ficticios que se revierten con ROLLBACK. Si falla, no publicar el
acceso hasta corregir el error.

## 2. Publicar funciones de servidor

Las funciones necesitan el runtime de Supabase Edge Functions. Netlify compila
la página pero NO publica estas funciones de Supabase.

Con Supabase CLI instalado, desde esta carpeta:

```sh
supabase login
supabase link --project-ref vbfppignmhrqhzlztowf
supabase functions deploy admin-create-client --no-verify-jwt
supabase functions deploy portal-access --no-verify-jwt
supabase secrets set PORTAL_SITE_URL=https://miplancelular.mx
```

`verify_jwt=false` permite la solicitud inicial sin sesión al login. La función
de alta valida por sí misma el JWT con `auth.getUser()` y exige una fila en
`administradores` ANTES de cualquier operación privilegiada.

Supabase provee automáticamente `SUPABASE_URL`, `SUPABASE_ANON_KEY` y
`SUPABASE_SERVICE_ROLE_KEY` a sus funciones. Esa última NUNCA se agrega a Netlify,
archivos `VITE_*`, GitHub ni al navegador. No compartir claves ni contraseñas.

## 3. Configurar autenticación y recuperación

En Authentication > URL Configuration:

- Site URL: `https://miplancelular.mx` (cuando DNS y HTTPS estén listos).
- Redirect URLs: `https://miplancelular.mx/clientes/recuperar`.
- Si se usa el subdominio Netlify, agregar también
  `https://nexusmobile123.netlify.app/clientes/recuperar` y configurar
  `PORTAL_SITE_URL` con ese origen mientras sea el utilizado.
- Para pruebas locales agregar `http://localhost:5173/clientes/recuperar` y cambiar
  temporalmente `PORTAL_SITE_URL`. Usar el puerto real del servidor local.

En Authentication > configuración de registro, desactivar el registro de nuevos
usuarios públicos (Allow new users to sign up). El alta administrativa continúa
funcionando por Admin API. Un usuario creado fuera del panel no obtiene un perfil
de cliente ni permisos por el simple hecho de autenticarse.

Para correos de recuperación a destinatarios reales configurar SMTP propio en
Supabase; el servicio de correo incorporado limita los destinatarios/envíos.
El correo se toma del perfil, no de parámetros enviados por el visitante.

## 4. Primera prueba

1. Entrar como administrador y abrir Clientes.
2. Crear dos clientes ficticios con correos controlados distintos, RFC de prueba
   válidos y contraseñas iniciales de al menos 12 caracteres.
3. Agregar datos diferentes a cada uno en las tres secciones.
4. Abrir una ventana privada e ingresar en `/clientes` con RFC y contraseña.
5. Confirmar que A no ve datos de B y que no accede a `/admin`.
6. Probar recuperación por correo, cambio de contraseña y cierre de sesión.
7. Desactivar A y actualizar su portal; sus datos deben dejar de estar accesibles.

Las contraseñas se envían únicamente por HTTPS al crear/autenticar cuentas. No
se guardan en nuestras tablas ni se pueden consultar posteriormente en el panel.
El dueño comunica el acceso inicial al cliente por un canal privado; no se envía
automáticamente una contraseña por correo. El cliente puede cambiarla al entrar.
Los intentos de acceso y recuperación se limitan en el servidor.

## Integración futura con Sheets

Las tablas son `clientes`, `cliente_lineas`, `cliente_adendas`, `cliente_tramites`.
Todas las fichas usan `cliente_id`; cada tabla admite un `external_id` único
opcional para enlazar filas estables de Sheets sin crear duplicados. Antes de
conectar hacen falta nombres de hojas, columnas, quién puede ver cada fila, el
identificador estable del cliente y las reglas de actualización/borrado.
La sincronización deberá ejecutarse del lado servidor con acceso privado a
Sheets. Nunca publicar RFC, líneas o documentos de clientes como CSV público.
