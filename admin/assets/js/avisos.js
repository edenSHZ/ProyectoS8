// ============ CONFIG Y ESTADO (globales) ============
const BASE    = "/pruebas/api/eventos";
const UPLOADS = "/pruebas/uploads/eventos/";

let eventos = [];
let eventosFiltrados = [];
let paginaActual = 1;
const eventosPorPagina = 4;
let archivoBase64 = null;
let nombreArchivoActual = '';
let eventoEditandoId = null;
let imagenEventoBase64 = null;
let nombreImagenEvento = '';

// ============ UTILIDADES DE FECHA (global) ============
function formatearFecha(fechaBD) {
    if (!fechaBD) return '';
    const parte = fechaBD.split(' ')[0];
    const [anio, mes, dia] = parte.split('-');
    return `${dia}/${mes}/${anio}`;
}

// ============ CARGAR EVENTOS (global) ============
function cargarEventos() {
    fetch(`${BASE}/obtener_evento.php`)
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                eventos = data.map(e => ({
                    id:           parseInt(e.id),
                    titulo:       e.titulo,
                    descripcion:  e.descripcion,
                    fecha:        e.fecha,
                    fechaDisplay: formatearFecha(e.fecha),
                    tipo_evento:  e.tipo,
                    estado:       e.estado,
                    imagen:       e.imagen,
                    esCalendario: false
                }));
                eventosFiltrados = [...eventos];
                mostrarEventos();
            }
        })
        .catch(() => mostrarToast("Error al cargar eventos", "error"));
}

// ============ MOSTRAR EVENTOS (global) ============
function mostrarEventos() {
    const listaEventos = document.getElementById('listaEventos');
    const inicio = (paginaActual - 1) * eventosPorPagina;
    const fin    = inicio + eventosPorPagina;
    const eventosPagina = eventosFiltrados.slice(inicio, fin);

    if (eventosPagina.length === 0) {
        listaEventos.innerHTML = '<div class="no-events">No hay eventos disponibles</div>';
        actualizarPaginacion();
        return;
    }

    listaEventos.innerHTML = eventosPagina.map(evento => `
        <div class="event" data-id="${evento.id}">
            <div class="event-info">
                <div class="event-title">
                    ${evento.tipo_evento === 'noticia' ? '📰 ' : '📌 '}${evento.titulo}
                    ${evento.imagen ? `<span class="event-attachment" onclick="verImagenEvento(${evento.id})">🖼️ Ver imagen</span>` : ''}
                </div>
                <div class="event-date">
                    📅 ${evento.fechaDisplay} |
                    Tipo: ${evento.tipo_evento === 'noticia' ? 'Noticia' : 'Evento'} |
                    Estado: ${evento.estado === 'publicado' ? '✅ Publicado' : '📝 Borrador'}
                </div>
                ${evento.descripcion ? `<div class="event-desc">${evento.descripcion}</div>` : ''}
            </div>
            <div class="actions">
                <button class="icon-btn edit"   onclick="abrirModalEditar(${evento.id})">✏️</button>
                <button class="icon-btn delete" onclick="eliminarEvento(${evento.id})">🗑️</button>
            </div>
        </div>
    `).join('');

    actualizarPaginacion();
}

function actualizarPaginacion() {
    const totalPaginas  = Math.ceil(eventosFiltrados.length / eventosPorPagina);
    const paginacionDiv = document.getElementById('paginacion');
    if (totalPaginas <= 1) { paginacionDiv.innerHTML = ''; return; }
    let html = '';
    for (let i = 1; i <= Math.min(totalPaginas, 10); i++) {
        html += `<span class="page ${i === paginaActual ? 'active' : ''}" onclick="cambiarPagina(${i})">${i}</span>`;
    }
    paginacionDiv.innerHTML = html;
}

function cambiarPagina(pagina) {
    paginaActual = pagina;
    mostrarEventos();
}

// ============ TOAST (global) ============
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

// ============ VISTA PREVIA (global) ============
function mostrarVistaPreviaEvento(src, nombre) {
    const vistaPrevia = document.getElementById('vistaPreviaEvento');
    const previewImg  = document.getElementById('previewEventoImg');
    const nombreSpan  = document.getElementById('nombreImagenPreview');
    const nombreDiv   = document.getElementById('nombreImagenEvento');
    if (vistaPrevia && previewImg) {
        previewImg.src = src;
        nombreSpan.innerHTML = nombre.length > 25 ? nombre.substring(0, 22) + '...' : nombre;
        vistaPrevia.style.display = 'block';
        if (nombreDiv) nombreDiv.innerHTML = `<span class="badge-file">✅ ${nombre}</span>`;
    }
}

function ocultarVistaPreviaEvento() {
    const vistaPrevia = document.getElementById('vistaPreviaEvento');
    const nombreDiv   = document.getElementById('nombreImagenEvento');
    const fileInput   = document.getElementById('archivoEvento');
    if (vistaPrevia) vistaPrevia.style.display = 'none';
    if (nombreDiv)   nombreDiv.innerHTML = '';
    if (fileInput)   fileInput.value = '';
    imagenEventoBase64 = null;
    nombreImagenEvento = '';
}

// ============ FUNCIONES GLOBALES ============
function abrirModalEditar(id) {
    id = parseInt(id);
    const evento = eventos.find(e => e.id === id);
    if (!evento) return;

    eventoEditandoId = id;
    document.getElementById('modalEvento').style.display = 'block';
    document.getElementById('modalTitulo').innerText     = '✏️ Editar Evento';
    document.getElementById('eventoTitulo').value        = evento.titulo;
    document.getElementById('eventoDescripcion').value   = evento.descripcion || '';
    document.getElementById('eventoFecha').value         = formatearFecha(evento.fecha);
    document.getElementById('eventoTipo').value          = evento.tipo_evento || 'evento';
    document.getElementById('eventoEstado').value        = evento.estado || 'borrador';

    if (evento.imagen) {
        imagenEventoBase64 = null;
        nombreImagenEvento = evento.imagen;
        mostrarVistaPreviaEvento(UPLOADS + evento.imagen, evento.imagen);
    } else {
        ocultarVistaPreviaEvento();
    }
}

function eliminarEvento(id) {
    id = parseInt(id);
    if (!confirm("¿Está seguro de eliminar este evento?")) return;
    fetch(`${BASE}/eliminar_evento.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            mostrarToast("Evento eliminado");
            cargarEventos();
        } else {
            mostrarToast(data.mensaje || "Error al eliminar", "error");
        }
    })
    .catch(() => mostrarToast("Error de conexión", "error"));
}

function verImagenEvento(id) {
    id = parseInt(id);
    const evento = eventos.find(e => e.id === id);
    if (!evento || !evento.imagen) { mostrarToast("No hay imagen", "warning"); return; }
    const ventana = window.open();
    ventana.document.write(`
        <html><head><title>${evento.titulo}</title>
        <style>
            body { display:flex; justify-content:center; align-items:center; min-height:100vh; margin:0; background:#1a1a2e; }
            img  { max-width:90%; max-height:85vh; border-radius:10px; box-shadow:0 4px 20px rgba(0,0,0,0.5); }
            .title { color:white; text-align:center; margin-top:15px; font-family:Arial; font-size:18px; }
            .close-btn { position:fixed; top:20px; right:30px; background:red; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer; font-size:16px; }
        </style></head>
        <body>
            <button class="close-btn" onclick="window.close()">Cerrar</button>
            <div>
                <img src="${UPLOADS + evento.imagen}" alt="${evento.titulo}">
                <div class="title">📌 ${evento.titulo}</div>
            </div>
        </body></html>
    `);
}

// ============ DOMCONTENTLOADED ============
document.addEventListener('DOMContentLoaded', function() {

    function buscarEvento() {
        const texto = document.getElementById('buscador').value.toLowerCase();
        eventosFiltrados = eventos.filter(e => e.titulo.toLowerCase().includes(texto));
        paginaActual = 1;
        mostrarEventos();
    }

    function abrirModalEvento() {
        eventoEditandoId = null;
        document.getElementById('modalEvento').style.display = 'block';
        document.getElementById('modalTitulo').innerText     = '➕ Agregar Nuevo Evento';
        document.getElementById('eventoTitulo').value        = '';
        document.getElementById('eventoDescripcion').value   = '';
        document.getElementById('eventoFecha').value         = '';
        document.getElementById('eventoTipo').value          = 'evento';
        document.getElementById('eventoEstado').value        = 'borrador';
        ocultarVistaPreviaEvento();
    }

    function cerrarModalEvento() {
        document.getElementById('modalEvento').style.display = 'none';
        eventoEditandoId = null;
        ocultarVistaPreviaEvento();
    }

    function guardarEvento(estado) {
        const titulo      = document.getElementById('eventoTitulo').value.trim();
        const descripcion = document.getElementById('eventoDescripcion').value.trim();
        const fecha       = document.getElementById('eventoFecha').value;
        const tipo        = document.getElementById('eventoTipo').value;

        if (!titulo || !fecha) {
            mostrarToast("Completa el título y la fecha", "warning");
            return;
        }

        const formData = new FormData();
        formData.append('titulo',      titulo);
        formData.append('descripcion', descripcion);
        formData.append('fecha',       fecha);
        formData.append('tipo',        tipo);
        formData.append('estado',      estado);

        const archivoInput = document.getElementById('archivoEvento');
        if (archivoInput.files[0]) formData.append('imagen', archivoInput.files[0]);
        if (!imagenEventoBase64 && !archivoInput.files[0] && eventoEditandoId) {
            formData.append('eliminar_imagen', '1');
        }
        if (eventoEditandoId) formData.append('id', eventoEditandoId);

        const url = eventoEditandoId
            ? `${BASE}/editar_evento.php`
            : `${BASE}/guardar_evento.php`;

        fetch(url, { method: "POST", body: formData })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    mostrarToast(estado === 'publicado' ? "Evento publicado" : "Guardado como borrador");
                    cerrarModalEvento();
                    cargarEventos();
                } else {
                    mostrarToast(data.mensaje || "Error al guardar", "error");
                }
            })
            .catch(() => mostrarToast("Error de conexión", "error"));
    }

    function abrirModalCalendario() {
        document.getElementById('modalCalendario').style.display = 'block';
        archivoBase64       = null;
        nombreArchivoActual = '';
        document.getElementById('nombreArchivo').innerHTML  = '';
        document.getElementById('archivoCalendario').value  = '';
    }

    function cerrarModalCalendario() {
        document.getElementById('modalCalendario').style.display = 'none';
    }

    function guardarEventoCalendario() {
        const archivoInput = document.getElementById('archivoCalendario');
        if (!archivoInput.files[0]) {
            mostrarToast("Selecciona un archivo PDF", "warning");
            return;
        }
        const formData = new FormData();
        formData.append('archivo', archivoInput.files[0]);
        fetch(`/pruebas/api/eventos/guardar_calendario.php`, { method: "POST", body: formData })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    mostrarToast("Calendario subido correctamente");
                    cerrarModalCalendario();
                } else {
                    mostrarToast(data.mensaje || "Error al subir", "error");
                }
            })
            .catch(() => mostrarToast("Error de conexión", "error"));
    }

    // ============ LISTENERS ============
    document.getElementById('archivoCalendario')?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            mostrarToast("Solo se permiten archivos PDF", "warning");
            this.value = '';
            return;
        }
        nombreArchivoActual = file.name;
        document.getElementById('nombreArchivo').innerHTML = `<span class="badge-file"> ${nombreArchivoActual}</span>`;
    });

    document.getElementById('optionEventoImage')?.addEventListener('click', () => {
        document.getElementById('archivoEvento').click();
    });

    document.getElementById('archivoEvento')?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            mostrarToast("Selecciona una imagen válida", "warning");
            this.value = '';
            return;
        }
        nombreImagenEvento = file.name;
        const reader = new FileReader();
        reader.onload = evt => {
            imagenEventoBase64 = evt.target.result;
            mostrarVistaPreviaEvento(imagenEventoBase64, nombreImagenEvento);
        };
        reader.readAsDataURL(file);
    });

    document.getElementById('menuDashboard')?.addEventListener('click',      () => window.location.href = 'inicio_admin.html');
    document.getElementById('menuOferta')?.addEventListener('click',         () => window.location.href = 'oferta_academica.html');
    document.getElementById('menuAdmisiones')?.addEventListener('click',     () => window.location.href = 'admisiones.html');
    document.getElementById('menuContacto')?.addEventListener('click',       () => window.location.href = 'contacto.html');

    document.getElementById('btnAgregarEvento')?.addEventListener('click',      abrirModalEvento);
    document.getElementById('btnAgregarCalendario')?.addEventListener('click',  abrirModalCalendario);
    document.getElementById('closeModalEvento')?.addEventListener('click',      cerrarModalEvento);
    document.getElementById('cancelModalEvento')?.addEventListener('click',     cerrarModalEvento);
    document.getElementById('closeModalCalendario')?.addEventListener('click',  cerrarModalCalendario);
    document.getElementById('cancelModalCalendario')?.addEventListener('click', cerrarModalCalendario);
    document.getElementById('saveModalEvento')?.addEventListener('click',       () => guardarEvento('publicado'));
    document.getElementById('saveBorradorEvento')?.addEventListener('click',    () => guardarEvento('borrador'));
    document.getElementById('saveModalCalendario')?.addEventListener('click',   guardarEventoCalendario);
    document.getElementById('btnSeleccionarPDF')?.addEventListener('click',     () => document.getElementById('archivoCalendario').click());
    document.getElementById('buscador')?.addEventListener('keyup',              buscarEvento);
    document.getElementById('btnEliminarImagen')?.addEventListener('click',     ocultarVistaPreviaEvento);

    window.onclick = function(event) {
        const modalEvento     = document.getElementById('modalEvento');
        const modalCalendario = document.getElementById('modalCalendario');
        if (event.target === modalEvento)     cerrarModalEvento();
        if (event.target === modalCalendario) cerrarModalCalendario();
    };

    // ============ INICIALIZAR ============
    cargarEventos();

}); // fin DOMContentLoaded