// ============================================
// VARIABLE PARA SABER QUÉ MODO ESTÁ ACTIVO
// ============================================
let modoActivo = 'carrusel'; // 'carrusel' o 'promocion'

// ============================================
// CAMBIAR ENTRE CARRUSEL Y PROMOCIÓN
// ============================================
function cambiarModo(modo) {
    modoActivo = modo;
    
    // Actualizar clases de los botones
    document.querySelectorAll('.modo-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.modo-btn[data-modo="${modo}"]`).classList.add('active');
    
    // Mostrar/ocultar secciones
    const carruselSection = document.getElementById('carruselSection');
    const promocionSection = document.getElementById('promocionSection');
    
    if (modo === 'carrusel') {
        carruselSection.style.display = 'block';
        promocionSection.style.display = 'none';
    } else {
        carruselSection.style.display = 'none';
        promocionSection.style.display = 'block';
    }
}

// ============================================
// ABRIR SELECTOR DE IMÁGENES SEGÚN MODO
// ============================================
function abrirSelectorCarrusel() {
    const input = document.getElementById("carouselInput");
    input.value = '';
    input.click();
}

function abrirSelectorPromocion() {
    const input = document.getElementById("imgGrandeInput");
    input.value = '';
    input.click();
}

// ============================================
// FUNCIÓN PARA MOSTRAR MENSAJE
// ============================================
function mostrarMensaje(mensaje, esError = false) {
    let msgDiv = document.createElement('div');
    msgDiv.textContent = mensaje;
    msgDiv.className = 'toast-message';
    msgDiv.style.background = esError ? '#dc3545' : '#28a745';
    
    document.body.appendChild(msgDiv);
    
    setTimeout(() => {
        msgDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (msgDiv.parentNode) {
                document.body.removeChild(msgDiv);
            }
        }, 300);
    }, 3000);
}

// ============================================
// VALIDAR IMAGEN
// ============================================
function validarImagen(archivo) {
    if (!archivo.type.startsWith('image/')) {
        mostrarMensaje('❌ Por favor, selecciona un archivo de imagen válido', true);
        return false;
    }
    
    if (archivo.size > 5 * 1024 * 1024) {
        mostrarMensaje('❌ La imagen es demasiado grande. Máximo 5MB', true);
        return false;
    }
    
    return true;
}

// ============================================
// GUARDAR IMÁGENES EN localStorage (LOCAL)
// ============================================
function guardarEnLocalStorage(tipo, datos) {
    try {
        if (tipo === 'carrusel') {
            localStorage.setItem('carrusel_imagenes', JSON.stringify(datos));
        } else if (tipo === 'promocion') {
            localStorage.setItem('promocion_imagen', datos);
        }
        return true;
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
        return false;
    }
}

// ============================================
// CARGAR IMÁGENES DESDE localStorage
// ============================================
function cargarDesdeLocalStorage() {
    // Cargar carrusel
    const carruselGuardado = localStorage.getItem('carrusel_imagenes');
    if (carruselGuardado) {
        try {
            const imagenes = JSON.parse(carruselGuardado);
            imagenes.forEach((imgData, index) => {
                const imgElement = document.getElementById(`img${index + 1}`);
                if (imgElement && imgData) {
                    imgElement.src = imgData;
                }
            });
            console.log('✅ Carrusel cargado desde localStorage');
        } catch (e) {
            console.error('Error al cargar carrusel:', e);
        }
    }
    
    // Cargar promoción
    const promocionGuardada = localStorage.getItem('promocion_imagen');
    if (promocionGuardada) {
        const imgElement = document.getElementById('imgGrande');
        if (imgElement) {
            imgElement.src = promocionGuardada;
            console.log('✅ Promoción cargada desde localStorage');
        }
    }
}

// ============================================
// MANEJAR SUBIDA DE CARRUSEL (4 imágenes)
// ============================================
document.getElementById("carouselInput").addEventListener("change", function() {
    let archivos = this.files;
    
    if (archivos.length === 0) {
        return;
    }
    
    if (archivos.length > 4) {
        mostrarMensaje('⚠️ Solo se pueden seleccionar máximo 4 imágenes. Las primeras 4 serán utilizadas.', true);
    }
    
    let imagenesCargadas = 0;
    let limite = Math.min(archivos.length, 4);
    let imagenesData = [];
    
    for (let i = 0; i < limite; i++) {
        let archivo = archivos[i];
        
        if (!validarImagen(archivo)) {
            continue;
        }
        
        let lector = new FileReader();
        
        lector.onload = (function(index) {
            return function(e) {
                let imgElement = document.getElementById("img" + (index + 1));
                if (imgElement) {
                    const imgData = e.target.result;
                    imgElement.src = imgData;
                    imagenesData[index] = imgData;
                    imagenesCargadas++;
                    
                    if (imagenesCargadas === limite) {
                        // Guardar en localStorage
                        guardarEnLocalStorage('carrusel', imagenesData);
                        mostrarMensaje(`✅ ¡${limite} imagen(es) guardadas en el carrusel!`);
                    }
                }
            };
        })(i);
        
        lector.onerror = function() {
            mostrarMensaje('❌ Error al leer el archivo: ' + archivo.name, true);
        };
        
        lector.readAsDataURL(archivo);
    }
});

// ============================================
// MANEJAR SUBIDA DE PROMOCIÓN (1 imagen)
// ============================================
document.getElementById("imgGrandeInput").addEventListener("change", function() {
    let archivo = this.files[0];
    
    if (!archivo) {
        return;
    }
    
    if (!validarImagen(archivo)) {
        return;
    }
    
    let lector = new FileReader();
    
    lector.onload = function(e) {
        let imgElement = document.getElementById("imgGrande");
        if (imgElement) {
            const imgData = e.target.result;
            imgElement.src = imgData;
            // Guardar en localStorage
            guardarEnLocalStorage('promocion', imgData);
            mostrarMensaje('✅ ¡Imagen de promoción guardada correctamente!');
        }
    };
    
    lector.onerror = function() {
        mostrarMensaje('❌ Error al leer el archivo', true);
    };
    
    lector.readAsDataURL(archivo);
});

// ============================================
// DRAG & DROP PARA CARRUSEL
// ============================================
const carouselCards = document.querySelectorAll('.card');
carouselCards.forEach((card, index) => {
    card.addEventListener('dragover', (e) => {
        e.preventDefault();
        card.style.borderColor = '#1f4f8b';
    });
    
    card.addEventListener('dragleave', () => {
        card.style.borderColor = 'transparent';
    });
    
    card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.style.borderColor = 'transparent';
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && modoActivo === 'carrusel') {
            const file = files[0];
            if (validarImagen(file)) {
                const lector = new FileReader();
                lector.onload = function(e) {
                    const imgElement = document.getElementById(`img${index + 1}`);
                    imgElement.src = e.target.result;
                    
                    // Actualizar localStorage
                    const imagenesData = [];
                    for (let i = 0; i < 4; i++) {
                        const img = document.getElementById(`img${i + 1}`);
                        if (img) {
                            imagenesData[i] = img.src;
                        }
                    }
                    guardarEnLocalStorage('carrusel', imagenesData);
                    mostrarMensaje(`✅ Imagen ${index + 1} actualizada por drag & drop`);
                };
                lector.readAsDataURL(file);
            }
        }
    });
});

// ============================================
// DRAG & DROP PARA PROMOCIÓN
// ============================================
const bigPreview = document.querySelector('.big-preview');
if (bigPreview) {
    bigPreview.addEventListener('dragover', (e) => {
        e.preventDefault();
        bigPreview.style.borderColor = '#1f4f8b';
    });
    
    bigPreview.addEventListener('dragleave', () => {
        bigPreview.style.borderColor = '#dee2e6';
    });
    
    bigPreview.addEventListener('drop', (e) => {
        e.preventDefault();
        bigPreview.style.borderColor = '#dee2e6';
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && modoActivo === 'promocion') {
            const file = files[0];
            if (validarImagen(file)) {
                const lector = new FileReader();
                lector.onload = function(e) {
                    const imgElement = document.getElementById('imgGrande');
                    imgElement.src = e.target.result;
                    guardarEnLocalStorage('promocion', e.target.result);
                    mostrarMensaje('✅ Imagen de promoción actualizada por drag & drop');
                };
                lector.readAsDataURL(file);
            }
        }
    });
}

// ============================================
// NAVEGACIÓN
// ============================================
document.getElementById('menuDashboard')?.addEventListener('click', function() {
    window.location.href = 'inicio_admin.html';
});

document.getElementById('menuNoticias')?.addEventListener('click', function() {
    window.location.href = 'avisos_noticias.html';
});

document.getElementById('menuOferta')?.addEventListener('click', function() {
    window.location.href = 'oferta_academica.html';
});

document.getElementById('menuContacto')?.addEventListener('click', function() {
    window.location.href = 'contacto.html';
});

// ============================================
// INICIALIZAR TODO AL CARGAR LA PÁGINA
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Cargar imágenes guardadas
    cargarDesdeLocalStorage();
    
    // Prevenir comportamiento por defecto de drag & drop global
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());
});