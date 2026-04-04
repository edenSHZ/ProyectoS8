document.addEventListener('DOMContentLoaded', function() {
    
    // ==================== CARRUSEL DE ADMISIONES ====================
    const admisionesCarrusel = document.querySelector('.carrusel-admisiones');
    
    if (admisionesCarrusel) {
        const track = admisionesCarrusel.querySelector('.carrusel-track');
        const prevBtn = admisionesCarrusel.querySelector('.prev');
        const nextBtn = admisionesCarrusel.querySelector('.next');
        const slides = admisionesCarrusel.querySelectorAll('.slide');
        
        if (track && prevBtn && nextBtn && slides.length > 0) {
            
            let currentIndex = 0;
            let autoScrollInterval;
            let slidesPerView = getSlidesPerView();
            let slideWidth = slides[0].offsetWidth;
            let gap = 20; // El gap definido en el CSS
            let scrollAmount = slideWidth + gap;
            let maxIndex = Math.max(0, slides.length - slidesPerView);
            
            // Función para obtener cuántas imágenes se ven según el ancho de pantalla
            function getSlidesPerView() {
                if (window.innerWidth <= 600) return 1;
                if (window.innerWidth <= 900) return 2;
                return 3;
            }
            
            // Función para actualizar valores dinámicos
            function updateValues() {
                slidesPerView = getSlidesPerView();
                slideWidth = slides[0].offsetWidth;
                scrollAmount = slideWidth + gap;
                maxIndex = Math.max(0, slides.length - slidesPerView);
                
                // Asegurar que currentIndex no exceda maxIndex
                if (currentIndex > maxIndex) {
                    currentIndex = maxIndex;
                }
            }
            
            // Función para mover el carrusel
            function moveToIndex(index) {
                if (index < 0) index = 0;
                if (index > maxIndex) index = maxIndex;
                
                currentIndex = index;
                const scrollPosition = currentIndex * scrollAmount;
                
                track.scrollTo({
                    left: scrollPosition,
                    behavior: 'smooth'
                });
            }
            
            // Función para avanzar automáticamente
            function startAutoScroll() {
                if (autoScrollInterval) clearInterval(autoScrollInterval);
                
                autoScrollInterval = setInterval(() => {
                    let newIndex = currentIndex + slidesPerView;
                    if (newIndex > maxIndex) {
                        newIndex = 0;
                    }
                    moveToIndex(newIndex);
                }, 4000);
            }
            
            // Función para pausar auto-scroll temporalmente
            function pauseAutoScroll() {
                clearInterval(autoScrollInterval);
                setTimeout(() => {
                    startAutoScroll();
                }, 5000);
            }
            
            // Event listeners para botones
            prevBtn.addEventListener('click', () => {
                updateValues();
                let newIndex = currentIndex - slidesPerView;
                if (newIndex < 0) newIndex = 0;
                moveToIndex(newIndex);
                pauseAutoScroll();
            });
            
            nextBtn.addEventListener('click', () => {
                updateValues();
                let newIndex = currentIndex + slidesPerView;
                if (newIndex > maxIndex) newIndex = maxIndex;
                moveToIndex(newIndex);
                pauseAutoScroll();
            });
            
            // Event listeners para interacción del usuario
            track.addEventListener('mouseenter', () => {
                clearInterval(autoScrollInterval);
            });
            
            track.addEventListener('mouseleave', () => {
                startAutoScroll();
            });
            
            // Event listener para el scroll manual
            track.addEventListener('scroll', () => {
                const scrollPosition = track.scrollLeft;
                const newIndex = Math.round(scrollPosition / scrollAmount);
                if (newIndex >= 0 && newIndex <= maxIndex) {
                    currentIndex = newIndex;
                }
            });
            
            // Actualizar valores al redimensionar ventana
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    updateValues();
                    moveToIndex(currentIndex);
                }, 200);
            });
            
            // Iniciar auto-scroll
            startAutoScroll();
            
            // Pausar cuando la pestaña no está visible
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    clearInterval(autoScrollInterval);
                } else {
                    startAutoScroll();
                }
            });
        }
    }
    
    // ==================== CARRUSEL DE LA PÁGINA PRINCIPAL ====================
    const principalCarrusel = document.querySelector('.carrusel-principal, .carrusel-container');
    
    if (principalCarrusel) {
        const track = principalCarrusel.querySelector('.carrusel-track');
        const prevBtn = principalCarrusel.querySelector('.carrusel-btn--prev, .prev');
        const nextBtn = principalCarrusel.querySelector('.carrusel-btn--next, .next');
        const cards = principalCarrusel.querySelectorAll('.servicio-card');
        
        if (track && prevBtn && nextBtn && cards.length > 0) {
            
            let currentIndex = 0;
            let autoScrollInterval;
            let cardWidth = cards[0].offsetWidth;
            let gap = parseInt(getComputedStyle(track).gap) || 30;
            let scrollAmount = cardWidth + gap;
            let maxIndex = cards.length - 1;
            
            function moveToIndex(index) {
                if (index < 0) index = maxIndex;
                if (index > maxIndex) index = 0;
                currentIndex = index;
                track.scrollTo({
                    left: currentIndex * scrollAmount,
                    behavior: 'smooth'
                });
            }
            
            function startAutoScroll() {
                if (autoScrollInterval) clearInterval(autoScrollInterval);
                autoScrollInterval = setInterval(() => {
                    moveToIndex(currentIndex + 1);
                }, 4000);
            }
            
            function pauseAutoScroll() {
                clearInterval(autoScrollInterval);
                setTimeout(() => {
                    startAutoScroll();
                }, 5000);
            }
            
            prevBtn.addEventListener('click', () => {
                moveToIndex(currentIndex - 1);
                pauseAutoScroll();
            });
            
            nextBtn.addEventListener('click', () => {
                moveToIndex(currentIndex + 1);
                pauseAutoScroll();
            });
            
            track.addEventListener('mouseenter', () => clearInterval(autoScrollInterval));
            track.addEventListener('mouseleave', () => startAutoScroll());
            
            track.addEventListener('scroll', () => {
                const scrollPosition = track.scrollLeft;
                const newIndex = Math.round(scrollPosition / scrollAmount);
                if (newIndex >= 0 && newIndex <= maxIndex) {
                    currentIndex = newIndex;
                }
            });
            
            window.addEventListener('resize', () => {
                cardWidth = cards[0].offsetWidth;
                scrollAmount = cardWidth + gap;
                track.scrollTo({
                    left: currentIndex * scrollAmount,
                    behavior: 'auto'
                });
            });
            
            startAutoScroll();
        }
    }
});