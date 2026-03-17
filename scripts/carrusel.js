document.addEventListener('DOMContentLoaded', function() {
        const track = document.querySelector('.carrusel-track');
        const prevBtn = document.querySelector('.carrusel-btn--prev');
        const nextBtn = document.querySelector('.carrusel-btn--next');

        if (!track || !prevBtn || !nextBtn) return;

        // Variables para el carrusel
        const cards = document.querySelectorAll('.servicio-card');
        if (cards.length === 0) return;

        const cardWidth = cards[0].offsetWidth;
        const trackStyle = getComputedStyle(track);
        const gap = parseInt(trackStyle.gap) || 30;
        const scrollAmount = cardWidth + gap;

        let currentIndex = 0;
        const maxIndex = cards.length - 1;
        let autoScrollInterval;

        // Función para mover el carrusel
        function moveToIndex(index) {
            if (index < 0) index = maxIndex;
            if (index > maxIndex) index = 0;

            currentIndex = index;
            track.scrollTo({
                left: currentIndex * scrollAmount,
                behavior: 'smooth'
            });
        }

        // Función para avanzar automáticamente
        function startAutoScroll() {
            if (autoScrollInterval) clearInterval(autoScrollInterval);

            autoScrollInterval = setInterval(() => {
                moveToIndex(currentIndex + 1);
            }, 2000); // Cambia cada 2 segundos (2000ms)
        }

        // Función para detener el auto-scroll temporalmente
        function pauseAutoScroll() {
            clearInterval(autoScrollInterval);
            // Reiniciar después de 4 segundos de inactividad
            setTimeout(() => {
                startAutoScroll();
            }, 4000);
        }

        // Event listeners para botones
        prevBtn.addEventListener('click', () => {
            moveToIndex(currentIndex - 1);
            pauseAutoScroll();
        });

        nextBtn.addEventListener('click', () => {
            moveToIndex(currentIndex + 1);
            pauseAutoScroll();
        });

        // Event listeners para interacción del usuario
        track.addEventListener('mouseenter', () => {
            clearInterval(autoScrollInterval);
        });

        track.addEventListener('mouseleave', () => {
            startAutoScroll();
        });

        // Event listener para el scroll (actualizar índice actual)
        track.addEventListener('scroll', () => {
            const scrollPosition = track.scrollLeft;
            const newIndex = Math.round(scrollPosition / scrollAmount);
            if (newIndex >= 0 && newIndex <= maxIndex) {
                currentIndex = newIndex;
            }
        });

        // Iniciar auto-scroll
        startAutoScroll();

        // Pausar auto-scroll cuando la pestaña no está visible (opcional)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                clearInterval(autoScrollInterval);
            } else {
                startAutoScroll();
            }
        });

        // Ajustar en caso de resize de ventana
        window.addEventListener('resize', () => {
            // Recalcular valores
            const newCardWidth = cards[0].offsetWidth;
            const newGap = parseInt(getComputedStyle(track).gap) || 30;
            const newScrollAmount = newCardWidth + newGap;

            // Ajustar posición actual
            track.scrollTo({
                left: currentIndex * newScrollAmount,
                behavior: 'auto'
            });
        });
    });