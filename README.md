# TeacherPanama Pro — PWA en GitHub Pages (subcarpeta)

URL del sitio: `https://josewhite72-beep.github.io/teacher_panama/`

Este paquete hace que tu app funcione como **PWA instalable** en GitHub Pages, alojada dentro de la subcarpeta **/teacher_panama/**.

## Estructura de archivos

```
teacher_panama/
├─ index.html
├─ manifest.json
├─ service-worker.js
└─ icons/
   ├─ icon-192.png
   └─ icon-512.png
```

## 1) Inyecciones necesarias en `index.html`
En `<head>` añade:

```html
<link rel="manifest" href="/teacher_panama/manifest.json">
<meta name="theme-color" content="#4f46e5">
<link rel="icon" sizes="192x192" href="/teacher_panama/icons/icon-192.png">
<link rel="icon" sizes="512x512" href="/teacher_panama/icons/icon-512.png">
```

Antes de `</body>` registra el Service Worker:

```html
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/teacher_panama/service-worker.js')
      .then(reg => console.log('SW registrado', reg.scope))
      .catch(err => console.error('SW fallo', err));
  });
}
</script>
```

## 2) Estrategia de caché
- **App Shell (local)**: `index.html`, `manifest.json`, `icons/` → **cache-first** (offline).
- **CDN** (`unpkg.com`, `cdn.tailwindcss.com`, `fonts.googleapis.com`, `fonts.gstatic.com`) → **network-first** con fallback a caché si ya se visitó.

## 3) Publicación y verificación
1. Sube la carpeta `teacher_panama/` al repo de GitHub.
2. Habilita GitHub Pages y espera el despliegue.
3. Verifica en Chrome → `F12` → **Application**:
   - **Manifest**: se carga y muestra los íconos.
   - **Service Workers**: debe decir *activated*.
4. Vuelve a **PWABuilder** con tu URL y realiza el análisis. Debe detectar **Manifest** y **SW**.

## 4) Empaquetado en APK (PWABuilder)
Con la URL pública en HTTPS, usa PWABuilder para generar **APK/AAB**.

---

**Notas**
- Las rutas están en formato **absoluto** con el prefijo `/teacher_panama/` para que PWABuilder y los navegadores resuelvan correctamente desde la URL pública.
- Puedes personalizar nombre, colores y íconos en `manifest.json`.
