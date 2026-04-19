// Menú Hamburguesa
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const menuOverlay = document.getElementById('menuOverlay');
    
    function closeMenu() {
        mainNav.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    function openMenu() {
        mainNav.classList.add('active');
        menuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    if (menuToggle && mainNav && menuOverlay) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            if (mainNav.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
        
        // Cerrar al hacer clic en overlay
        menuOverlay.addEventListener('click', closeMenu);
        
        // Cerrar al hacer clic en un enlace
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });
        
        // Cerrar con tecla ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mainNav.classList.contains('active')) {
                closeMenu();
            }
        });
        
        // Prevenir scroll del body cuando el menú está abierto
        window.addEventListener('resize', function() {
            if (window.innerWidth > 900 && mainNav.classList.contains('active')) {
                closeMenu();
            }
        });
    }
});