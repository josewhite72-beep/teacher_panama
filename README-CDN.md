# TeacherPanama Pro — PWA (CDN)

Este proyecto convierte tu `index.html` (con React, ReactDOM, Babel y Tailwind por **CDN**) en una **PWA instalable** que funciona **offline** para el *App Shell* y usa **network-first** para los recursos de CDN.

## Archivos incluidos
- `manifest.json`: metadatos PWA (nombre, colores e íconos).
- `service-worker.js`: caché y estrategia offline.
- `icons/icon-192.png`, `icons/icon-512.png`: íconos básicos.

## Paso 1 — Añadir el manifest y registrar el Service Worker
En tu `index.html` agrega en `<head>`:

```html
<link rel="manifest" href="./manifest.json">
<meta name="theme-color" content="#4f46e5">
<link rel="icon" sizes="192x192" href="./icons/icon-192.png">
<link rel="icon" sizes="512x512" href="./icons/icon-512.png">
```

Y justo antes de `</body>`, registra el SW:

```html
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('SW registrado', reg.scope))
      .catch(err => console.error('SW fallo', err));
  });
}
</script>
```

## Paso 2 — Servir por HTTP (requerido)
Los Service Workers **no funcionan** en `file://`. Usa un servidor local:

- **Python 3**:
  ```bash
  python -m http.server 8000
  ```
  Abre `http://localhost:8000/` en **Chrome** o **Edge**.

- **Android (Termux)**:
  ```bash
  pkg install python
  python -m http.server 8000
  ```
  Abre `http://127.0.0.1:8000/` en **Chrome** y selecciona **“Agregar a pantalla de inicio”**.

## Cómo funciona la caché
- **App Shell (local)**: `index.html`, `manifest.json`, `icons/` → **cache-first** para uso sin conexión.
- **CDN (React, ReactDOM, Babel, Tailwind, Google Fonts)**: **network-first** con fallback a caché si ya se visitó.
  - Algunas fuentes (`fonts.gstatic.com`) pueden requerir CORS; la estrategia ya intenta cachearlas si el navegador lo permite.

## Publicación y APK
1. Sube el sitio a **GitHub Pages / Netlify / Vercel** (HTTPS).
2. Usa **PWABuilder** para generar el **APK/AAB**.

## Consejos
- Mantén el `start_url: ./index.html` y `scope: ./` si publicas desde la raíz.
- Cambia el nombre, colores o íconos en `manifest.json` según tu marca.
