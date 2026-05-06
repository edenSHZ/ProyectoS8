// ============ MENÚ HAMBURGUESA UNIVERSAL ============
// Este script funciona en TODAS las páginas del dashboard

document.addEventListener('DOMContentLoaded', function() {
    // Crear elementos del menú si no existen
    let menuToggle = document.getElementById('menuToggle');
    let menuOverlay = document.getElementById('menuOverlay');
    
    // Crear botón hamburguesa si no existe
    if (!menuToggle) {
        menuToggle = document.createElement('button');
        menuToggle.id = 'menuToggle';
        menuToggle.className = 'menu-toggle';
        menuToggle.setAttribute('aria-label', 'Menú');
        menuToggle.innerHTML = '<span></span><span></span><span></span>';
        document.body.appendChild(menuToggle);
    }
    
    // Crear overlay si no existe
    if (!menuOverlay) {
        menuOverlay = document.createElement('div');
        menuOverlay.id = 'menuOverlay';
        menuOverlay.className = 'menu-overlay';
        document.body.appendChild(menuOverlay);
    }
    
    const sidebar = document.querySelector('.sidebar');
    
    // Función para cerrar el menú
    function closeMenu() {
        if (sidebar) sidebar.classList.remove('active');
        if (menuToggle) menuToggle.classList.remove('active');
        if (menuOverlay) menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
        document.body.style.position = '';
    }
    
    // Función para abrir el menú
    function openMenu() {
        if (sidebar) sidebar.classList.add('active');
        if (menuToggle) menuToggle.classList.add('active');
        if (menuOverlay) menuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    }
    
    // Verificar si estamos en móvil (solo mostrar botón si es necesario)
    function checkScreenSize() {
        if (window.innerWidth > 900) {
            closeMenu();
            if (sidebar) sidebar.classList.remove('active');
        }
    }
    
    // Evento para abrir/cerrar menú
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            if (sidebar.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }
    
    // Cerrar al hacer clic en overlay
    if (menuOverlay) {
        menuOverlay.addEventListener('click', closeMenu);
    }
    
    // Cerrar al hacer clic en cualquier elemento del menú (enlaces)
    if (sidebar) {
        const menuItems = sidebar.querySelectorAll('.menu li');
        menuItems.forEach(item => {
            item.addEventListener('click', function() {
                // Pequeño delay para que la navegación no se vea rara
                setTimeout(closeMenu, 150);
            });
        });
    }
    
    // Cerrar con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('active')) {
            closeMenu();
        }
    });
    
    // Al hacer resize, cerrar menú si es desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 900) {
            closeMenu();
        }
    });
    
    // Prevenir que el body se desplace cuando el menú está abierto
    // (el CSS ya maneja esto, pero reforzamos)
    if (menuOverlay) {
        menuOverlay.addEventListener('touchmove', function(e) {
            e.preventDefault();
        });
    }
    
    // Inicializar: asegurar que sidebar esté cerrado en móvil al cargar
    if (window.innerWidth <= 900) {
        if (sidebar) sidebar.classList.remove('active');
    }
    
    console.log('Menú hamburguesa inicializado correctamente');
});