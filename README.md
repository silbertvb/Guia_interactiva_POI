# 🗺️ Guía Interactiva de Puntos de Interés — España

**DAW · Unidad 9 — Desarrollo Web Entorno Cliente**

---

## Descripción de la aplicación

La **Guía Interactiva** es una aplicación web que permite explorar puntos de interés reales en España. Para cada lugar, la app ofrece una descripción detallada, un reproductor multimedia HTML5 con guía de audio o vídeo, y un sistema de geolocalización que detecta automáticamente si el usuario se encuentra físicamente cerca de alguno de los puntos registrados.

Además, el mini-mapa ahora se muestra con un mapa real de Leaflet que posiciona los POI según sus coordenadas reales, en lugar de una representación abstracta.

La aplicación funciona completamente en el navegador, sin necesidad de servidores externos ni plugins de terceros, y está diseñada para funcionar correctamente tanto en escritorio como en dispositivos móviles.

---

## Cómo ejecutar la aplicación localmente

La geolocalización del navegador **requiere que la página se sirva desde un origen seguro** (HTTPS o `localhost`). No funcionará si se abre el archivo HTML directamente desde el sistema de archivos (`file://`).

### Opción 1 — Visual Studio Code + Live Server (recomendado)

1. Instala [Visual Studio Code](https://code.visualstudio.com/).
2. Instala la extensión **Live Server** de Ritwick Dey.
3. Abre la carpeta del proyecto en VS Code.
4. Haz clic derecho sobre `index.html` → **"Open with Live Server"**.
5. El navegador abrirá automáticamente `http://127.0.0.1:5500`.

### Opción 2 — Python (sin instalación adicional)

```bash
cd "c:\xampp\htdocs\02_DWEC_2DAW\CP9_Pagina web con geolocalización y contenido multimedia"
python -m http.server 5500
```

Luego abre `http://localhost:5500` en el navegador.

### Opción 3 — Node.js

```bash
cd "c:\xampp\htdocs\02_DWEC_2DAW\CP9_Pagina web con geolocalización y contenido multimedia"
npx serve .
```

---

## Estructura de archivos

```
guia-interactiva/
├── index.html          # Estructura HTML de la aplicación
├── style.css           # Estilos y diseño responsive
├── README.md           # Este documento
├── app.js              # Inicialización y arranque de la aplicación
├── data.js             # Datos de los POI
├── dom.js              # Referencias globales del DOM
├── state.js            # Estado compartido de la aplicación
├── utils.js            # Utilidades comunes (formateo, Haversine)
├── player.js           # Reproductor multimedia y controles personalizados
├── geo.js              # Geolocalización, watchPosition y detección de proximidad
├── permissions.js      # Manejo de permisos y errores de geolocalización
├── miniMap.js          # Mini-mapa real de Leaflet para los POI
├── audio/              # Archivos de audio de ejemplo
│   ├── piano_mozart.mp3
│   └── viva-brazil-bossa-nova.mp3
│   
└── video/              # Archivos de vídeo de ejemplo
    ├── Atardecer_en_el_mar.mp4
    └── Domingo_de_golf.mp4
```

> **Nota sobre los archivos multimedia:** Los recursos locales son ejemplos de soporte de la aplicación. El reproductor maneja correctamente errores de carga y muestra un aviso si el archivo no está disponible.

---

## Decisiones de diseño e implementación

### Reproductor multimedia HTML5

Se ha optado por el elemento nativo `<audio>` / `<video>` de HTML5 en lugar de cualquier plugin externo.

- **Compatibilidad universal**.
- **Seguridad**.
- **Accesibilidad**.
- **Control total** mediante la API `HTMLMediaElement`.

El reproductor es un componente reutilizable que se crea dinámicamente para cada POI. Los controles personalizados incluyen:

- **Play / Pause** con icono dinámico.
- **Stop**.
- **Barra de progreso** interactiva.
- **Control de volumen** con slider y botón de silencio.
- **Visualización del tiempo** transcurrido y total.

### Geolocalización y detección de proximidad

Se usa `navigator.geolocation.watchPosition()` para un monitoreo continuo y eficiente de la posición del usuario.

La distancia se calcula con la **fórmula de Haversine**, que ofrece precisión geográfica adecuada para distancias urbanas.

---

## Privacidad, seguridad y protección de datos de ubicación

### Riesgos del uso de geolocalización

La posición geográfica es un **dato personal sensible** según el RGPD. Conocer la ubicación en tiempo real permite inferir domicilio, rutinas, hábitos y otros datos íntimos.

### Cómo aborda estos riesgos esta aplicación

| Medida | Implementación |
|--------|---------------|
| **Proceso local** | Las coordenadas del usuario nunca salen del dispositivo. |
| **Mínima retención** | La posición solo se guarda en memoria y se pierde al recargar. |
| **Consentimiento explícito** | La geolocalización solo se activa con el botón "Detectar mi ubicación". |
| **Transparencia** | El pie de página indica que los datos no se transmiten. |
| **Finalidad específica** | La ubicación solo se usa para calcular la distancia a los POI. |

### Recomendaciones para producción

1. **HTTPS obligatorio**.
2. **Política de privacidad** clara y visible.
3. **No persistir coordenadas** sin consentimiento.
4. **Precisión ajustada** con `enableHighAccuracy: false` si no es necesaria.
5. **Borrar el watcher** con `clearWatch()` cuando ya no se necesite.

---

## Aspectos técnicos destacados

- Diseño responsive con CSS Grid y `clamp()`.
- Accesibilidad con roles ARIA y navegación por teclado.
- Manejo diferenciado de errores de geolocalización.
- Mini-mapa real con Leaflet que muestra las ubicaciones geográficas reales de los POI.
- Funcionalidad completa aun si el usuario deniega el acceso a la ubicación.
- Los POI muestran ubicaciones reales en España (Madrid, Barcelona, Menorca y Tenerife).
