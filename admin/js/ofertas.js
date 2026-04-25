const BASE    = "php";
const UPLOADS = "uploads";

let categorias       = [];
let cursos           = [];
let categoriaActiva  = null;
let cursoEditandoId  = null;
let imagenSeleccionada = null;

// ============ TOAST ============
function mostrarToast(msg, tipo = "success") {
    const colores = { success: "#28a745", error: "#dc3545", warning: "#ffc107" };
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = `
        position:fixed; bottom:24px; right:24px; padding:12px 20px;
        background:${colores[tipo]}; color:white; border-radius:8px;
        font-size:14px; z-index:9999; box-shadow:0 4px 12px rgba(0,0,0,0.2);
        transition: opacity 0.4s;
    `;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 3000);
}

// ============ CARGAR CATEGORÍAS ============
function cargarCategorias() {
    fetch(`${BASE}/obtener_categorias.php`)
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                categorias = data;
                renderizarTabs();
                llenarSelectCategorias();
                if (categorias.length > 0) {
                    seleccionarTab(categorias[0].id_categoria);
                }
            }
        })
        .catch(() => mostrarToast("Error al cargar categorías", "error"));
}

// ============ RENDERIZAR TABS ============
function renderizarTabs() {
    const container = document.getElementById('tabsContainer');
    if (categorias.length === 0) {
        container.innerHTML = '<p style="color:#888;font-size:13px;">No hay categorías.</p>';
        return;
    }
    container.innerHTML = categorias.map(cat => `
        <button class="tab ${cat.id_categoria === categoriaActiva ? 'active' : ''}"
                data-id="${cat.id_categoria}">
            ${cat.nombre}
        </button>
    `).join('');
}

// ============ LLENAR SELECT CATEGORÍAS ============
function llenarSelectCategorias() {
    const select = document.getElementById('cursoCategoria');
    select.innerHTML = categorias.map(cat =>
        `<option value="${cat.id_categoria}">${cat.nombre}</option>`
    ).join('');
}

// ============ SELECCIONAR TAB ============
function seleccionarTab(id) {
    categoriaActiva = id;
    renderizarTabs();
    cargarCursosPorCategoria(id);
}

// ============ CARGAR CURSOS POR CATEGORÍA ============
function cargarCursosPorCategoria(idCategoria) {
    fetch(`${BASE}/obtener_curso.php`)
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                cursos = data.filter(c => c.id_categoria === idCategoria);
                renderizarCursos();
            }
        })
        .catch(() => mostrarToast("Error al cargar cursos", "error"));
}

// ============ RENDERIZAR CURSOS ============
function renderizarCursos() {
    const contenido = document.getElementById('contenidoCursos');

    if (cursos.length === 0) {
        contenido.innerHTML = '<p style="color:#888;font-size:14px;margin-top:20px;">No hay cursos en esta categoría.</p>';
        return;
    }

    contenido.innerHTML = `
        <div class="grid-cards">
            ${cursos.map(curso => `
                <div class="card" data-id="${curso.id_curso}">
                    <h3>${curso.nombre}</h3>
                    <div class="preview">
                        <img id="imgCurso${curso.id_curso}"
                             src="${curso.imagen ? UPLOADS + curso.imagen : 'https://placehold.co/300x180'}"
                             alt="${curso.nombre}">
                    </div>
                    <div class="course-details">
                        <div class="detail-item">
                            <span class="detail-icon">Duración:</span>
                            <span class="detail-text" id="duracion${curso.id_curso}">${curso.duracion || '—'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">Horario:</span>
                            <span class="detail-text" id="horario${curso.id_curso}">${curso.horario || '—'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">Requisitos:</span>
                            <span class="detail-text" id="requisitos${curso.id_curso}">${curso.requisitos || '—'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">Descripción:</span>
                            <span class="detail-text" id="descripcion${curso.id_curso}">${curso.descripcion || '—'}</span>
                        </div>
                    </div>
                    <div class="card-btns">
                        <button class="btn btn-editar-curso"   data-id="${curso.id_curso}">Editar</button>
                        <button class="btn-elim-curso btn-eliminar-curso" data-id="${curso.id_curso}">Eliminar</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ============ ABRIR MODAL EDITAR ============
function abrirModalEditar(id) {
    const curso = cursos.find(c => c.id_curso === id);
    if (!curso) return;

    cursoEditandoId  = id;
    imagenSeleccionada = null;

    document.getElementById('modalCursoId').value     = id;
    document.getElementById('modalDuracion').value    = curso.duracion   || '';
    document.getElementById('modalHorario').value     = curso.horario    || '';
    document.getElementById('modalRequisitos').value  = curso.requisitos || '';
    document.getElementById('modalDescripcion').value = curso.descripcion|| '';
    document.getElementById('modalPreview').innerHTML = curso.imagen
        ? `<img src="${UPLOADS + curso.imagen}" style="max-width:100%;max-height:150px;border-radius:8px;margin-top:8px;">`
        : '';

    document.getElementById('modalEditarCurso').style.display = 'flex';
}

// ============ CERRAR MODALES ============
function cerrarModalEditar() {
    document.getElementById('modalEditarCurso').style.display = 'none';
    cursoEditandoId  = null;
    imagenSeleccionada = null;
    document.getElementById('modalFileInput').value = '';
}

function cerrarModalCategoria() {
    document.getElementById('modalCategoria').style.display = 'none';
    document.getElementById('catNombre').value      = '';
    document.getElementById('catDescripcion').value = '';
}

function cerrarModalAgregarCurso() {
    document.getElementById('modalAgregarCurso').style.display = 'none';
    document.getElementById('cursoNombre').value      = '';
    document.getElementById('cursoDuracion').value    = '';
    document.getElementById('cursoHorario').value     = '';
    document.getElementById('cursoRequisitos').value  = '';
    document.getElementById('cursoDescripcion').value = '';
    document.getElementById('cursoImgPreview').innerHTML = '';
    document.getElementById('cursoImgInput').value    = '';
}

// ============ GUARDAR EDICIÓN CURSO ============
function guardarEdicionCurso() {
    if (!cursoEditandoId) return;

    const formData = new FormData();
    formData.append('id_curso',    cursoEditandoId);
    formData.append('duracion',    document.getElementById('modalDuracion').value.trim());
    formData.append('horario',     document.getElementById('modalHorario').value.trim());
    formData.append('requisitos',  document.getElementById('modalRequisitos').value.trim());
    formData.append('descripcion', document.getElementById('modalDescripcion').value.trim());

    const fileInput = document.getElementById('modalFileInput');
    if (fileInput.files[0]) formData.append('imagen', fileInput.files[0]);

    fetch(`${BASE}/editar_curso.php`, { method: "POST", body: formData })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                mostrarToast("Curso actualizado correctamente");
                cerrarModalEditar();
                cargarCursosPorCategoria(categoriaActiva);
            } else {
                mostrarToast(data.mensaje || "Error al guardar", "error");
            }
        })
        .catch(() => mostrarToast("Error de conexión", "error"));
}

// ============ GUARDAR NUEVA CATEGORÍA ============
function guardarCategoria() {
    const nombre      = document.getElementById('catNombre').value.trim();
    const descripcion = document.getElementById('catDescripcion').value.trim();

    if (!nombre) {
        mostrarToast("El nombre es obligatorio", "warning");
        return;
    }

    fetch(`${BASE}/agregar_categoria.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, descripcion })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            mostrarToast("Categoría agregada");
            cerrarModalCategoria();
            cargarCategorias();
        } else {
            mostrarToast(data.mensaje || "Error al guardar", "error");
        }
    })
    .catch(() => mostrarToast("Error de conexión", "error"));
}

// ============ GUARDAR NUEVO CURSO ============
function guardarNuevoCurso() {
    const idCategoria = document.getElementById('cursoCategoria').value;
    const nombre      = document.getElementById('cursoNombre').value.trim();

    if (!idCategoria || !nombre) {
        mostrarToast("Categoría y nombre son obligatorios", "warning");
        return;
    }

    const formData = new FormData();
    formData.append('id_categoria', idCategoria);
    formData.append('nombre',       nombre);
    formData.append('duracion',     document.getElementById('cursoDuracion').value.trim());
    formData.append('horario',      document.getElementById('cursoHorario').value.trim());
    formData.append('requisitos',   document.getElementById('cursoRequisitos').value.trim());
    formData.append('descripcion',  document.getElementById('cursoDescripcion').value.trim());

    const fileInput = document.getElementById('cursoImgInput');
    if (fileInput.files[0]) formData.append('imagen', fileInput.files[0]);

    fetch(`${BASE}/agregar_curso.php`, { method: "POST", body: formData })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                mostrarToast("Curso agregado correctamente");
                cerrarModalAgregarCurso();
                // Si el nuevo curso es de la categoría activa recarga
                if (parseInt(idCategoria) === categoriaActiva) {
                    cargarCursosPorCategoria(categoriaActiva);
                }
            } else {
                mostrarToast(data.mensaje || "Error al guardar", "error");
            }
        })
        .catch(() => mostrarToast("Error de conexión", "error"));
}

// ============ ELIMINAR CURSO ============
function eliminarCurso(id) {
    if (!confirm("¿Está seguro de eliminar este curso?")) return;

    fetch(`${BASE}/eliminar_curso.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            mostrarToast("Curso eliminado");
            cargarCursosPorCategoria(categoriaActiva);
        } else {
            mostrarToast(data.mensaje || "Error al eliminar", "error");
        }
    })
    .catch(() => mostrarToast("Error de conexión", "error"));
}

// ============ ELIMINAR CATEGORÍA ACTIVA ============
function eliminarCategoriaActiva() {
    if (!categoriaActiva) {
        mostrarToast("Selecciona una categoría primero", "warning");
        return;
    }

    const cat = categorias.find(c => c.id_categoria === categoriaActiva);
    if (!confirm(`¿Eliminar la categoría "${cat?.nombre}"?`)) return;

    fetch(`${BASE}/eliminar_categoria.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: categoriaActiva })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            mostrarToast("Categoría eliminada");
            categoriaActiva = null;
            cargarCategorias();
            document.getElementById('contenidoCursos').innerHTML =
                '<p style="color:#888;font-size:14px;">Selecciona una categoría.</p>';
        } else {
            mostrarToast(data.mensaje || "Error al eliminar", "error");
        }
    })
    .catch(() => mostrarToast("Error de conexión", "error"));
}

// ============ DELEGACIÓN DE EVENTOS ============
document.addEventListener('click', function(e) {

    // Tabs
    const tab = e.target.closest('.tab');
    if (tab) {
        seleccionarTab(parseInt(tab.dataset.id));
        return;
    }

    // Botón editar curso
    const btnEditar = e.target.closest('.btn-editar-curso');
    if (btnEditar) {
        abrirModalEditar(parseInt(btnEditar.dataset.id));
        return;
    }

    // Botón eliminar curso
    const btnElimCurso = e.target.closest('.btn-eliminar-curso');
    if (btnElimCurso) {
        eliminarCurso(parseInt(btnElimCurso.dataset.id));
        return;
    }

    // Cerrar modal editar
    if (['btnCerrarModalEdit', 'btnCancelarModal', 'modalEditarCurso'].includes(e.target.id)) {
        cerrarModalEditar();
        return;
    }

    // Cerrar modal categoría
    if (['btnCerrarModalCat', 'btnCancelarModalCat', 'modalCategoria'].includes(e.target.id)) {
        cerrarModalCategoria();
        return;
    }

    // Cerrar modal agregar curso
    if (['btnCerrarModalAgrCurso', 'btnCancelarModalAgrCurso', 'modalAgregarCurso'].includes(e.target.id)) {
        cerrarModalAgregarCurso();
        return;
    }
});

// ============ DOMCONTENTLOADED ============
document.addEventListener('DOMContentLoaded', function() {

    // Botones principales
    document.getElementById('btnAgregarCategoria')?.addEventListener('click', () => {
        document.getElementById('modalCategoria').style.display = 'flex';
    });

    document.getElementById('btnAgregarCurso')?.addEventListener('click', () => {
        document.getElementById('modalAgregarCurso').style.display = 'flex';
        // Seleccionar la categoría activa por defecto
        if (categoriaActiva) {
            document.getElementById('cursoCategoria').value = categoriaActiva;
        }
    });

    document.getElementById('btnEliminarCategoria')?.addEventListener('click', eliminarCategoriaActiva);
    document.getElementById('btnGuardarCategoria')?.addEventListener('click',  guardarCategoria);
    document.getElementById('btnGuardarNuevoCurso')?.addEventListener('click', guardarNuevoCurso);
    document.getElementById('btnGuardarCurso')?.addEventListener('click',      guardarEdicionCurso);

    // Imagen editar curso
    document.getElementById('btnSeleccionarImagen')?.addEventListener('click', () => {
        document.getElementById('modalFileInput').click();
    });

    document.getElementById('modalFileInput')?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = evt => {
            document.getElementById('modalPreview').innerHTML =
                `<img src="${evt.target.result}" style="max-width:100%;max-height:150px;border-radius:8px;margin-top:8px;">`;
        };
        reader.readAsDataURL(file);
    });

    // Imagen nuevo curso
    document.getElementById('btnSelImgNuevo')?.addEventListener('click', () => {
        document.getElementById('cursoImgInput').click();
    });

    document.getElementById('cursoImgInput')?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = evt => {
            document.getElementById('cursoImgPreview').innerHTML =
                `<img src="${evt.target.result}" style="max-width:100%;max-height:120px;border-radius:8px;margin-top:8px;">`;
        };
        reader.readAsDataURL(file);
    });

    // Logo
    document.getElementById('logoImage')?.addEventListener('click', () => {
        document.getElementById('logoInput')?.click();
    });

    document.getElementById('logoInput')?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = ev => document.getElementById('logoImage').src = ev.target.result;
            reader.readAsDataURL(file);
        }
    });

    // Navegación
    document.getElementById('menuDashboard')?.addEventListener('click',  () => window.location.href = 'inicio_admin.html');
    document.getElementById('menuNoticias')?.addEventListener('click',   () => window.location.href = 'avisos_noticias.html');
    document.getElementById('menuAdmisiones')?.addEventListener('click', () => window.location.href = 'admisiones.html');
    document.getElementById('menuContacto')?.addEventListener('click',   () => window.location.href = 'contacto.html');

    // Inicializar
    cargarCategorias();
});