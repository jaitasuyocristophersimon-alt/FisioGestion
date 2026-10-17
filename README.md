# FisioGestión

Aplicación web móvil instalable para llevar el registro básico de una consulta de fisioterapia. Está pensada para abrirse en Chrome de Android, incluidos teléfonos Samsung.

## Versión publicada

FisioGestión está disponible en HTTPS en [https://jaitasuyocristophersimon-alt.github.io/FisioGestion/](https://jaitasuyocristophersimon-alt.github.io/FisioGestion/). El repositorio de GitHub es público para permitir esta publicación; cualquier persona puede ver y copiar el código. No contiene registros de pacientes.

## Qué incluye

- Alta, edición, búsqueda y consulta de pacientes: nombre, teléfono, patología y precio por sesión.
- Historial de sesiones: número, fecha, tratamiento, máquina, duración y observaciones.
- Dictado en los campos de texto cuando el navegador admite reconocimiento de voz. El navegador puede pedir permiso para usar el micrófono y el reconocimiento puede necesitar internet.
- Registro de pagos y vista de pagos recientes.
- Saldo estimado por paciente: sesiones registradas multiplicadas por el precio actual, menos los pagos anotados. Un saldo negativo aparece como monto a favor.
- Aplicación web progresiva (PWA), instalable desde el navegador y con archivos de la aplicación disponibles sin conexión después de cargarla una vez.

## Probar en una computadora o teléfono

1. Descomprime `FisioGestion.zip` en una carpeta.
2. Para una prueba rápida, abre `index.html`. La interfaz funciona y guarda datos en ese navegador, pero los navegadores suelen desactivar la instalación PWA y el modo offline cuando se abre como archivo.
3. Para probar todas las funciones PWA, sirve la carpeta desde un servidor local. Si tienes Node.js, desde esa carpeta ejecuta `npx serve .` y abre en el navegador la dirección local que indique. En Android, el teléfono y la computadora deben estar conectados a la misma red Wi-Fi; usa una dirección HTTPS o un entorno de desarrollo que habilite HTTPS. `localhost` es válido para probar en el mismo dispositivo.

## Publicar en HTTPS e instalar en un Samsung

1. La versión publicada ya está lista en el enlace de arriba. Si publicas una copia nueva, sube **el contenido de esta carpeta** a un alojamiento web estático HTTPS y conserva las rutas relativas. HTTPS es necesario para el service worker y la instalación, salvo en `localhost` de pruebas.
2. Abre el enlace en el teléfono Samsung con **Google Chrome** y espera a que termine la primera carga con internet.
3. En el menú ⋮ de Chrome elige **Instalar aplicación** o **Añadir a pantalla de inicio** y confirma. El nombre exacto puede variar según la versión de Chrome/Android.
4. Abre FisioGestión desde el icono. Después de la primera carga, la interfaz puede abrirse sin conexión cuando el navegador conserve sus archivos.

El ZIP contiene el sitio web instalable; no es un APK.

## Datos y límites

Los datos de pacientes, sesiones y pagos quedan **localmente en el almacenamiento del navegador de ese dispositivo**. No existe sincronización entre teléfonos, servidor de datos ni respaldo automático. Borrar los datos del navegador, desinstalar o perder el dispositivo puede eliminar los registros; toma tus propias medidas de resguardo antes de usarlo para información real.

FisioGestión **no es un sistema de facturación fiscal** y no emite facturas, recibos fiscales ni documentos tributarios. El saldo es una estimación de control, no una contabilidad oficial. Usa datos de prueba al evaluar la aplicación.

## Archivos principales

- `index.html`: interfaz y formularios.
- `app.js`: lógica, cálculos y guardado local.
- `styles.css`: diseño adaptable a pantalla móvil.
- `manifest.webmanifest`: datos de instalación PWA.
- `sw.js`: caché de los archivos de la aplicación para abrirla offline.
- `icon.svg`: icono de la aplicación.

## Privacidad

La aplicación no tiene cuenta ni envía los registros a un servidor. La voz se procesa mediante la función de reconocimiento que ofrezca el navegador; ese procesamiento puede depender del navegador o de sus servicios. El proyecto usa fuentes del sistema y no carga librerías de terceros.
