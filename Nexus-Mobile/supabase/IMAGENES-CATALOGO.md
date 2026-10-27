# Subida de imágenes

1. Ejecutar `03-catalogo-storage.sql` completo en SQL Editor de Supabase.
2. Recargar `/admin`, abrir Catálogo y editar o crear un producto.
3. Seleccionar JPG, PNG o WebP (máximo 5 MB por archivo).
4. Esperar a que termine la subida y pulsar Guardar producto.
5. Comprobar las fotos en `/equipos` y en el detalle, también sin iniciar sesión.

El bucket `catalogo` es público porque sus fotos se muestran en la página.
Solo usuarios incluidos en `public.administradores` pueden subir archivos.
La clave publicable y la sesión del usuario se utilizan desde el navegador;
no se necesita una clave secreta. Los límites de tipo y tamaño se aplican
también en Storage. Los nombres únicos evitan sobrescribir fotos existentes.

Las URLs se guardan automáticamente; el administrador no las escribe.
Las imágenes anteriores conservan sus referencias y se pueden sustituir.
La galería permite mover una imagen hacia el inicio y quitar referencias.

Subir y guardar un producto son operaciones separadas. Si falla el guardado,
el formulario conserva las imágenes subidas para volver a intentarlo.
Si una subida múltiple falla a mitad, conserva las imágenes que sí se subieron.
Quitar una foto o cancelar el formulario no borra el archivo de Storage, para
evitar romper imágenes compartidas entre productos o variantes. Los archivos
sin uso se pueden revisar posteriormente en Storage; no se eliminan solos.
