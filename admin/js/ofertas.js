// Variables globales
let cursoActual = null;
let imagenSeleccionada = null;

// Función para editar curso completo
function editarCurso(cursoId) {
    cursoActual = cursoId;
    
    // Capitalizar primera letra para los IDs
    const idCapitalizado = cursoId.charAt(0).toUpperCase() + cursoId.slice(1);
    
    // Obtener valores actuales del curso
    const duracionElem = document.getElementById(`duracion${idCapitalizado}`);
    const horarioElem = document.getElementById(`horario${idCapitalizado}`);
    const requisitosElem = document.getElementById(`requisitos${idCapitalizado}`);
    const descripcionElem = document.getElementById(`descripcion${idCapitalizado}`);
    const imgElem = document.getElementById(`img${idCapitalizado}`);
    
    // Llenar el modal con los valores actuales
    document.getElementById('modalDuracion').value = duracionElem ? duracionElem.innerText : '';
    document.getElementById('modalHorario').value = horarioElem ? horarioElem.innerText : '';
    document.getElementById('modalRequisitos').value = requisitosElem ? requisitosElem.innerText : '';
    document.getElementById('modalDescripcion').value = descripcionElem ? descripcionElem.innerText : '';
    
    // Mostrar preview de la imagen actual
    const modalPreview = document.getElementById('modalPreview');
    if (imgElem && imgElem.src) {
        modalPreview.innerHTML = `<img src="${imgElem.src}" style="max-width: 100%; max-height: 150px; border-radius: 10px;">`;
    } else {
        modalPreview.innerHTML = '';
    }
    
    // Resetear imagen seleccionada
    imagenSeleccionada = null;
    
    // Mostrar modal
    const modal = document.getElementById('modalEditarCurso');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Abrir selector de imagen
function abrirSelectorImagen() {
    const fileInput = document.getElementById('modalFileInput');
    if (fileInput) {
        fileInput.click();
        
        fileInput.onchange = function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    imagenSeleccionada = event.target.result;
                    const modalPreview = document.getElementById('modalPreview');
                    if (modalPreview) {
                        modalPreview.innerHTML = `<img src="${imagenSeleccionada}" style="max-width: 100%; max-height: 150px; border-radius: 10px;">`;
                    }
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        };
    }
}

// Guardar cambios del curso
function guardarCambiosCurso() {
    if (!cursoActual) return;
    
    // Capitalizar primera letra
    const idCapitalizado = cursoActual.charAt(0).toUpperCase() + cursoActual.slice(1);
    
    // Obtener nuevos valores
    const nuevaDuracion = document.getElementById('modalDuracion').value;
    const nuevoHorario = document.getElementById('modalHorario').value;
    const nuevosRequisitos = document.getElementById('modalRequisitos').value;
    const nuevaDescripcion = document.getElementById('modalDescripcion').value;
    
    // Actualizar los elementos en la página
    const duracionElem = document.getElementById(`duracion${idCapitalizado}`);
    const horarioElem = document.getElementById(`horario${idCapitalizado}`);
    const requisitosElem = document.getElementById(`requisitos${idCapitalizado}`);
    const descripcionElem = document.getElementById(`descripcion${idCapitalizado}`);
    const imgElem = document.getElementById(`img${idCapitalizado}`);
    
    if (duracionElem) duracionElem.innerText = nuevaDuracion;
    if (horarioElem) horarioElem.innerText = nuevoHorario;
    if (requisitosElem) requisitosElem.innerText = nuevosRequisitos;
    if (descripcionElem) descripcionElem.innerText = nuevaDescripcion;
    
    // Actualizar imagen si se seleccionó una nueva
    if (imagenSeleccionada && imgElem) {
        imgElem.src = imagenSeleccionada;
    }
    
    // Cerrar modal
    cerrarModal();
    
    // Mostrar mensaje de éxito
    mostrarMensaje('✓ Curso actualizado correctamente');
}

// Cerrar modal
function cerrarModal() {
    const modal = document.getElementById('modalEditarCurso');
    if (modal) {
        modal.style.display = 'none';
    }
    cursoActual = null;
    imagenSeleccionada = null;
}

// Mostrar mensaje temporal
function mostrarMensaje(mensaje) {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = 'mensaje-flotante';
    mensajeDiv.innerText = mensaje;
    document.body.appendChild(mensajeDiv);
    
    setTimeout(() => {
        if (mensajeDiv && mensajeDiv.remove) {
            mensajeDiv.remove();
        }
    }, 3000);
}

// Funcionalidad para el logo circular
const logoImage = document.getElementById('logoImage');
const logoInput = document.getElementById('logoInput');

if (logoImage) {
    logoImage.addEventListener('click', function() {
        if (logoInput) logoInput.click();
    });
}

if (logoInput) {
    logoInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                if (logoImage) logoImage.src = event.target.result;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('modalEditarCurso');
    if (event.target === modal) {
        cerrarModal();
    }
};

// Navegación
document.getElementById('menuDashboard')?.addEventListener('click', function() {
    window.location.href = 'inicio_admin.html';
});

document.getElementById('menuNoticias')?.addEventListener('click', function() {
    window.location.href = 'avisos_noticias.html';
});

document.getElementById('menuAdmisiones')?.addEventListener('click', function() {
    window.location.href = 'admisiones.html';
});

document.getElementById('menuContacto')?.addEventListener('click', function() {
    window.location.href = 'contacto.html';
});