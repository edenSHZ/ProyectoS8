document.addEventListener('DOMContentLoaded', () => {

    (function() {

        const STORAGE_NAME = 'map_pref';

        // ==============================
        // LOCAL STORAGE
        // ==============================
        function savePreference(value) {

            localStorage.setItem(STORAGE_NAME, value);
        }

        function getPreference() {

            return localStorage.getItem(STORAGE_NAME);
        }

        // ==============================
        // PANEL
        // ==============================
        function hidePanel() {

            const panel = document.getElementById('privacy-panel');

            if (panel) {

                panel.classList.add('hidden');
            }
        }

        function showPanel() {

            const panel = document.getElementById('privacy-panel');

            if (panel) {

                panel.classList.remove('hidden');
            }
        }

        // ==============================
        // ACEPTAR
        // ==============================
        function allowInteractiveServices() {

            savePreference('accepted');

            hidePanel();

            window.dispatchEvent(
                new CustomEvent('mapAccessGranted')
            );
        }

        // ==============================
        // RECHAZAR
        // ==============================
        function rejectInteractiveServices() {

            savePreference('rejected');

            hidePanel();

            window.dispatchEvent(
                new CustomEvent('mapAccessRejected')
            );
        }

        // ==============================
        // ESTADO INICIAL
        // ==============================
        const currentPreference = getPreference();

        if (currentPreference === 'accepted') {

            hidePanel();

        } else if (currentPreference === 'rejected') {

            hidePanel();

            window.dispatchEvent(
                new CustomEvent('mapAccessRejected')
            );

        } else {

            showPanel();

            const allowBtn = document.getElementById('allow-map-services');
            const rejectBtn = document.getElementById('reject-map-services');

            if (allowBtn) {

                allowBtn.addEventListener(
                    'click',
                    allowInteractiveServices
                );
            }

            if (rejectBtn) {

                rejectBtn.addEventListener(
                    'click',
                    rejectInteractiveServices
                );
            }
        }

    })();

});