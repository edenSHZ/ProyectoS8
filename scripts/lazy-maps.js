// scripts/lazy-maps.js
// Carga diferida del iframe de Google Maps con autorización del usuario

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    const MAP_EMBED_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2721.798811946547!2d-97.90207412652198!3d18.967669982214655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85cf8c5934ee30b5%3A0x84694ff99f71378e!2sCalle%202%20Ote.%20308%2C%20Barrio%20del%20Centro%2C%2075200%20Tepeaca%2C%20Pue.!5e1!3m2!1ses-419!2smx!4v1773725816119!5m2!1ses-419!2smx';

    const mapContainer = document.getElementById('map-container');
    const staticMap = document.getElementById('map-static');
    const dynamicMap = document.getElementById('map-dynamic');
    const activateBtn = document.getElementById('activate-map-btn');

    if (!mapContainer || !staticMap || !dynamicMap) {
        console.warn('Lazy Maps: Elementos no encontrados');
        return;
    }

    let mapLoaded = false;
    let accessGranted = false;
    let accessRejected = false;

    // ==============================
    // LOCAL STORAGE
    // ==============================
    function getPreference() {
        return localStorage.getItem('map_pref');
    }

    // ==============================
    // MENSAJE DE RECHAZO
    // ==============================
    function showRejectedMessage() {
        staticMap.style.display = 'block';
        dynamicMap.style.display = 'none';
        mapLoaded = true;
        console.log('🛑 Servicios interactivos rechazados');
    }

    // ==============================
    // CARGAR MAPA
    // ==============================
    function loadMapIframe() {

        if (mapLoaded) return;
        if (accessRejected) return;

        if (!accessGranted) {

            const pref = getPreference();

            if (pref !== 'accepted') {
                console.log('⛔ Sin autorización para cargar el mapa');
                return;
            }

            accessGranted = true;
        }

        console.log('🗺️ Cargando mapa interactivo...');

        const iframe = document.createElement('iframe');

        iframe.src = MAP_EMBED_URL;
        iframe.width = '250';
        iframe.height = '200';
        iframe.style.border = '0';
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        iframe.title = 'Mapa del Instituto Francés de Ciencias';

        dynamicMap.innerHTML = '';
        dynamicMap.appendChild(iframe);

        staticMap.style.display = 'none';
        dynamicMap.style.display = 'block';

        mapLoaded = true;
    }

    // ==============================
    // EVENTOS PERSONALIZADOS
    // ==============================
    window.addEventListener('mapAccessGranted', function() {

        accessGranted = true;
        accessRejected = false;

        loadMapIframe();
    });

    window.addEventListener('mapAccessRejected', function() {

        accessRejected = true;
        accessGranted = false;

        showRejectedMessage();
    });

    // ==============================
    // ESTADO INICIAL
    // ==============================
    const initialPref = getPreference();

    if (initialPref === 'accepted') {

        accessGranted = true;

    } else if (initialPref === 'rejected') {

        accessRejected = true;

        showRejectedMessage();

        return;
    }

    // ==============================
    // VALIDAR SI PUEDE CARGAR
    // ==============================
    function canLoad() {

        if (accessRejected) return false;

        if (accessGranted) return true;

        const pref = getPreference();

        if (pref === 'accepted') {

            accessGranted = true;

            return true;
        }

        return false;
    }

    // ==============================
    // BOTÓN
    // ==============================
    if (activateBtn) {

        activateBtn.addEventListener('click', function(e) {

            e.preventDefault();
            e.stopPropagation();

            if (canLoad()) {

                loadMapIframe();

            } else {

                console.log('⛔ Acceso al mapa no permitido');
            }
        });
    }

    // ==============================
    // CLICK PLACEHOLDER
    // ==============================
    staticMap.addEventListener('click', function() {

        if (canLoad()) {

            loadMapIframe();

        } else {

            console.log('⛔ Placeholder bloqueado');
        }
    });

    // ==============================
    // INTERSECTION OBSERVER
    // ==============================
    if (window.IntersectionObserver && !accessRejected) {

        const observer = new IntersectionObserver((entries) => {

            entries.forEach(entry => {

                if (
                    entry.isIntersecting &&
                    !mapLoaded &&
                    canLoad()
                ) {

                    console.log('👁️ Mapa visible, cargando...');

                    loadMapIframe();

                    observer.unobserve(entry.target);
                }
            });

        }, {
            rootMargin: '200px',
            threshold: 0.1
        });

        observer.observe(mapContainer);

    } else if (!accessRejected) {

        setTimeout(() => {

            if (canLoad() && !mapLoaded) {

                loadMapIframe();
            }

        }, 3000);
    }

    console.log('🚀 Lazy Maps listo');
});