// scripts/lazy-maps.js
// Carga diferida del iframe de Google Maps
// NO requiere API Key, solo usa el link embed que ya tienes

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ===== EL MISMO LINK DE TU IFRAME ACTUAL =====
    const MAP_EMBED_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2721.798811946547!2d-97.90207412652198!3d18.967669982214655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85cf8c5934ee30b5%3A0x84694ff99f71378e!2sCalle%202%20Ote.%20308%2C%20Barrio%20del%20Centro%2C%2075200%20Tepeaca%2C%20Pue.!5e1!3m2!1ses-419!2smx!4v1773725816119!5m2!1ses-419!2smx';

    // ===== ELEMENTOS DEL DOM =====
    const mapContainer = document.getElementById('map-container');
    const staticMap = document.getElementById('map-static');
    const dynamicMap = document.getElementById('map-dynamic');
    const activateBtn = document.getElementById('activate-map-btn');

    // Verificar que los elementos existen
    if (!mapContainer || !staticMap || !dynamicMap) {
        console.warn('Lazy Maps: Elementos no encontrados');
        return;
    }

    let mapLoaded = false;

    // ===== FUNCIÓN: Cargar el iframe =====
    function loadMapIframe() {
        if (mapLoaded) return;

        console.log('🗺️ Cargando mapa interactivo...');

        // Crear el iframe con el mismo link que tenías antes
        const iframe = document.createElement('iframe');
        iframe.src = MAP_EMBED_URL;
        iframe.width = '250';
        iframe.height = '200';
        iframe.style.border = '0';
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        iframe.title = 'Mapa de ubicación del Instituto Francés de Ciencias';

        // Insertar el iframe
        dynamicMap.innerHTML = '';
        dynamicMap.appendChild(iframe);

        // Ocultar placeholder y mostrar iframe
        staticMap.style.display = 'none';
        dynamicMap.style.display = 'block';

        mapLoaded = true;
    }

    // ===== EVENTO: Clic en el botón =====
    if (activateBtn) {
        activateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            loadMapIframe();
        });
    }

    // ===== EVENTO: Clic en todo el placeholder =====
    staticMap.addEventListener('click', function() {
        loadMapIframe();
    });

    // ===== INTERSECTION OBSERVER: Cargar al hacer scroll =====
    if (window.IntersectionObserver) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !mapLoaded) {
                    console.log('👁️ Mapa visible - Cargando automáticamente...');
                    loadMapIframe();
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '200px', // Carga 200px antes de que sea visible
            threshold: 0.1        // Se activa con 10% visible
        });

        observer.observe(mapContainer);
    } else {
        // Fallback para navegadores antiguos: cargar después de 3 segundos
        setTimeout(loadMapIframe, 3000);
    }

    console.log('🚀 Lazy Maps listo - El mapa cargará al hacer clic o scroll');
});