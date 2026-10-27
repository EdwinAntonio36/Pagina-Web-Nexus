# Migración del catálogo

La importación captura la hoja publicada que utilizaba la página, con los mismos
IDs y reglas de respaldo para especificaciones y variantes.
`catalogo-snapshot.json` conserva la información capturada.

## Ejecutar en Supabase

1. En SQL Editor ejecutar `01-catalogo-esquema.sql` completo.
2. Ejecutar `02-importar-catalogo.sql` completo.
3. En Table Editor abrir `productos` y comprobar las 14 filas importadas.
4. Abrir `/equipos`, probar filtros y detalles.
5. En una ventana privada comprobar que se ve el catálogo sin iniciar sesión.

El esquema requiere `administradores`, creada por `admin-permisos.sql`.
Los visitantes leen productos activos. Solo administradores pueden escribir u
ocultar productos (`active = false`). Las cotizaciones existentes no se modifican.
No volver a ejecutar `admin-permisos.sql`: contiene el UID del admin original.

## Imágenes y precios

Se conservan rutas y URLs actuales; no se suben archivos a Supabase Storage.
Los archivos locales siguen sirviéndose desde el sitio.
Galerías, variantes y especificaciones usan JSON. Los precios conservan su formato
comercial actual. Antes de integrar pagos, modelar importes numéricos y moneda y
validarlos en el servidor.

## Regenerar la captura antes de importar

Requiere Node.js 22.13 o posterior y dependencias instaladas:

```sh
node scripts/migrar-catalogo.mjs
```

Lee Google Sheets y regenera el SQL y snapshot; no escribe en Supabase.
El SQL solo agrega IDs nuevos y no sobrescribe productos existentes.
Después de migrar, editar productos en Supabase, no en la hoja.
La aplicación respeta un catálogo vacío y muestra un error si falla Supabase;
no muestra el catálogo de ejemplo con precios potencialmente obsoletos.
