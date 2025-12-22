# TeacherPanama Pro — PWA OFFLINE (CDN)

Aplicación docente PWA 100% offline con capacidad de exportación a PDF, Excel y Word. Todos los recursos se cachean localmente para funcionamiento sin conexión.

## Características Principales
- ✅ **100% Offline**: Todos los recursos (React, Babel, Tailwind, fuentes) cacheados
- 📊 **Exportación completa**: PDF, Excel (XLSX) y Word (DOC)
- 📱 **PWA instalable**: Instala en Android, iOS, Windows, macOS
- 💾 **Datos locales**: localStorage con respaldo automático
- 🎨 **Interfaz moderna**: Diseño iOS-like con Tailwind CSS

## Archivos incluidos
- `index.html` - Aplicación principal con React
- `manifest.json` - Metadatos PWA
- `service-worker.js` - Cache offline-first
- `icons/` - Iconos para PWA
- `README-CDN.md` - Esta documentación

## Uso offline
1. Visita la app una vez con conexión
2. El Service Worker cachea todo automáticamente
3. La app funciona completamente sin internet
4. Los datos se guardan en localStorage

## Exportación de datos
Desde cualquier grupo, usa el botón de exportación (↓) para:
- **PDF**: Reporte con tablas de calificaciones y asistencia
- **Excel**: Archivo XLSX con múltiples hojas
- **Word**: Documento DOC con formato profesional

## Instalación como PWA
1. Abre en Chrome/Edge
2. Busca el ícono "Instalar" o "Agregar a pantalla de inicio"
3. La app se instalará como aplicación nativa

## Desarrollo local
```bash
# Servidor Python
python -m http.server 8000

# Servidor Node.js (si tienes npm)
npx serve .