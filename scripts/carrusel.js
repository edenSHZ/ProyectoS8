document.addEventListener('DOMContentLoaded', function() {

    // ============================================================
    // ESCAPE XSS — siempre que se inserte datos dinámicos en DOM
    // ============================================================
    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g,  '&amp;')
            .replace(/</g,  '&lt;')
            .replace(/>/g,  '&gt;')
            .replace(/"/g,  '&quot;')
            .replace(/'/g,  '&#039;')
            .replace(/\//g, '&#x2F;');
    }

    // ============================================================
    // CARRUSEL DE ADMISIONES — carga imágenes desde la BD
    // ============================================================
    const admisionesCarrusel = document.querySelector('.carrusel-admisiones');

    if (admisionesCarrusel) {
        const track    = admisionesCarrusel.querySelector('.carrusel-track');
        const prevBtn  = admisionesCarrusel.querySelector('.prev');
        const nextBtn  = admisionesCarrusel.querySelector('.next');

        // Ruta de las imágenes físicas — admin/uploads/galeria/ desde la raíz
        const UPLOADS = 'admin/uploads/galeria/';

        // ── Cargar imágenes del carrusel desde la BD ──────────────
        fetch('config/obtener_galeria_publica.php', {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(res => res.json())
        .then(data => {
            if (!Array.isArray(data)) return;

            // Filtrar solo las de tipo 'carrusel' — la promoción no se muestra aquí aún
            const imagenesCarrusel = data.filter(img => img.tipo === 'carrusel');

            if (imagenesCarrusel.length === 0) {
                track.innerHTML = '<p style="color:#888;font-size:14px;padding:20px;">No hay imágenes disponibles.</p>';
                return;
            }

            // ✅ Construir slides con DOM API — sin innerHTML con datos dinámicos
            track.innerHTML = '';
            imagenesCarrusel.forEach(img => {
                const slide = document.createElement('div');
                slide.className = 'slide';

                const imagen = document.createElement('img');
                // src como propiedad DOM — seguro
                imagen.src = UPLOADS + img.imagen;
                // ✅ alt con escapeHtml por si el nombre tuviera caracteres raros
                imagen.alt = 'Imagen carrusel ' + escapeHtml(String(img.orden));
                imagen.loading = 'lazy';

                slide.appendChild(imagen);
                track.appendChild(slide);
            });

            // Inicializar la lógica del carrusel después de cargar las imágenes
            inicializarCarrusel(admisionesCarrusel);
        })
        .catch(() => {
            track.innerHTML = '<p style="color:#888;font-size:14px;padding:20px;">Error al cargar imágenes.</p>';
        });
    }

    // ============================================================
    // LÓGICA DEL CARRUSEL — se llama después de cargar las imágenes
    // ============================================================
    function inicializarCarrusel(carruselEl) {
        const track   = carruselEl.querySelector('.carrusel-track');
        const prevBtn = carruselEl.querySelector('.prev');
        const nextBtn = carruselEl.querySelector('.next');
        const slides  = carruselEl.querySelectorAll('.slide');

        if (!track || !prevBtn || !nextBtn || slides.length === 0) return;

        let currentIndex      = 0;
        let autoScrollInterval;
        let gap               = 20;
        let slidesPerView     = getSlidesPerView();
        let slideWidth        = slides[0].offsetWidth;
        let scrollAmount      = slideWidth + gap;
        let maxIndex          = Math.max(0, slides.length - slidesPerView);

        function getSlidesPerView() {
            if (window.innerWidth <= 600) return 1;
            if (window.innerWidth <= 900) return 2;
            return 3;
        }

        function updateValues() {
            slidesPerView = getSlidesPerView();
            slideWidth    = slides[0].offsetWidth;
            scrollAmount  = slideWidth + gap;
            maxIndex      = Math.max(0, slides.length - slidesPerView);
            if (currentIndex > maxIndex) currentIndex = maxIndex;
        }

        function moveToIndex(index) {
            if (index < 0)        index = 0;
            if (index > maxIndex) index = maxIndex;
            currentIndex = index;
            track.scrollTo({ left: currentIndex * scrollAmount, behavior: 'smooth' });
        }

        function startAutoScroll() {
            if (autoScrollInterval) clearInterval(autoScrollInterval);
            autoScrollInterval = setInterval(() => {
                let next = currentIndex + slidesPerView;
                if (next > maxIndex) next = 0;
                moveToIndex(next);
            }, 4000);
        }

        function pauseAutoScroll() {
            clearInterval(autoScrollInterval);
            setTimeout(startAutoScroll, 5000);
        }

        prevBtn.addEventListener('click', () => {
            updateValues();
            moveToIndex(Math.max(0, currentIndex - slidesPerView));
            pauseAutoScroll();
        });

        nextBtn.addEventListener('click', () => {
            updateValues();
            moveToIndex(Math.min(maxIndex, currentIndex + slidesPerView));
            pauseAutoScroll();
        });

        track.addEventListener('mouseenter', () => clearInterval(autoScrollInterval));
        track.addEventListener('mouseleave', () => startAutoScroll());

        track.addEventListener('scroll', () => {
            const newIndex = Math.round(track.scrollLeft / scrollAmount);
            if (newIndex >= 0 && newIndex <= maxIndex) currentIndex = newIndex;
        });

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                updateValues();
                moveToIndex(currentIndex);
            }, 200);
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                clearInterval(autoScrollInterval);
            } else {
                startAutoScroll();
            }
        });

        startAutoScroll();
    }

    // ============================================================
    // CARRUSEL DE LA PÁGINA PRINCIPAL — sin cambios, imágenes estáticas
    // ============================================================
    const principalCarrusel = document.querySelector('.carrusel-principal, .carrusel-container');

    if (principalCarrusel) {
        const track   = principalCarrusel.querySelector('.carrusel-track');
        const prevBtn = principalCarrusel.querySelector('.carrusel-btn--prev, .prev');
        const nextBtn = principalCarrusel.querySelector('.carrusel-btn--next, .next');
        const cards   = principalCarrusel.querySelectorAll('.servicio-card');

        if (track && prevBtn && nextBtn && cards.length > 0) {

            let currentIndex      = 0;
            let autoScrollInterval;
            let cardWidth         = cards[0].offsetWidth;
            let gap               = parseInt(getComputedStyle(track).gap) || 30;
            let scrollAmount      = cardWidth + gap;
            let maxIndex          = cards.length - 1;

            function moveToIndex(index) {
                if (index < 0)        index = maxIndex;
                if (index > maxIndex) index = 0;
                currentIndex = index;
                track.scrollTo({ left: currentIndex * scrollAmount, behavior: 'smooth' });
            }

            function startAutoScroll() {
                if (autoScrollInterval) clearInterval(autoScrollInterval);
                autoScrollInterval = setInterval(() => moveToIndex(currentIndex + 1), 4000);
            }

            function pauseAutoScroll() {
                clearInterval(autoScrollInterval);
                setTimeout(startAutoScroll, 5000);
            }

            prevBtn.addEventListener('click', () => { moveToIndex(currentIndex - 1); pauseAutoScroll(); });
            nextBtn.addEventListener('click', () => { moveToIndex(currentIndex + 1); pauseAutoScroll(); });

            track.addEventListener('mouseenter', () => clearInterval(autoScrollInterval));
            track.addEventListener('mouseleave', () => startAutoScroll());

            track.addEventListener('scroll', () => {
                const newIndex = Math.round(track.scrollLeft / scrollAmount);
                if (newIndex >= 0 && newIndex <= maxIndex) currentIndex = newIndex;
            });

            window.addEventListener('resize', () => {
                cardWidth    = cards[0].offsetWidth;
                scrollAmount = cardWidth + gap;
                track.scrollTo({ left: currentIndex * scrollAmount, behavior: 'auto' });
            });

            startAutoScroll();
        }
    }

});