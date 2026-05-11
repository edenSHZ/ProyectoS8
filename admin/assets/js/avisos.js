// ============ CONFIG Y ESTADO (globales) ============
const BASE    = `${BASE_URL}/api/eventos`;
const UPLOADS = `${BASE_URL}/uploads/eventos/`;

let eventos = [];
let eventosFiltrados = [];
let paginaActual = 1;
const eventosPorPagina = 4;
let archivoBase64 = null;
let nombreArchivoActual = '';
let eventoEditandoId = null;
let imagenEventoBase64 = null;
let nombreImagenEvento = '';

// ============ ESCAPE XSS ============
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

function escapeUrl(url) {
    if (!url) return '';
    const trimmed = String(url).trim().toLowerCase();
    if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) return '';
    return String(url)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ============ UTILIDADES DE FECHA ============
function formatearFecha(fechaBD) {
    if (!fechaBD) return '';
    const parte = fechaBD.split(' ')[0];
    const [anio, mes, dia] = parte.split('-');
    return `${dia}/${mes}/${anio}`;
}

// ============ CARGAR EVENTOS ============
function cargarEventos() {
    fetch(`${BASE}/obtener_evento.php`, {
        headers: { "X-Requested-With": "XMLHttpRequest" }
    })
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

// ============ MOSTRAR EVENTOS ============
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
        <div class="event" data-id="${escapeHtml(evento.id)}">
            <div class="event-info">
                <div class="event-title">
                    ${evento.tipo_evento === 'noticia' ? '' : ' '}${escapeHtml(evento.titulo)}
                    ${evento.imagen
                        ? `<span class="event-attachment" onclick="verImagenEvento(${parseInt(evento.id)})">🖼️ Ver imagen</span>`
                        : ''}
                </div>
                <div class="event-date">
                    📅 ${escapeHtml(evento.fechaDisplay)} |
                        Tipo: ${{
                        'noticia':'Noticia',
                        'evento':'Evento',
                        'curso':'Curso',
                        'convocatoria':'Convocatoria',
                        'graduación':'Graduación',
                        'taller':'Taller'
                        }[evento.tipo_evento] || 'Evento'} |
                        Estado: ${evento.estado === 'publicado' ? ' Publicado' : ' Borrador'}
                </div>
                ${evento.descripcion
                    ? `<div class="event-desc">${escapeHtml(evento.descripcion)}</div>`
                    : ''}
            </div>
            <div class="actions">
                <button class="icon-btn edit"   onclick="abrirModalEditar(${parseInt(evento.id)})">✏️</button>
                <button class="icon-btn delete" onclick="eliminarEvento(${parseInt(evento.id)})">🗑️</button>
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

// ============ TOAST ============
function mostrarToast(msg, tipo = "success") {
    const colores = { success: "#28a745", error: "#dc3545", warning: "#ffc107" };
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = `
        position:fixed; bottom:24px; right:24px; padding:12px 20px;
        background:${colores[tipo] ?? colores.success}; color:white; border-radius:8px;
        font-size:14px; z-index:9999; box-shadow:0 4px 12px rgba(0,0,0,0.2);
        transition: opacity 0.4s;
    `;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 3000);
}

// ============ VISTA PREVIA ============
function mostrarVistaPreviaEvento(src, nombre) {
    const vistaPrevia = document.getElementById('vistaPreviaEvento');
    const previewImg  = document.getElementById('previewEventoImg');
    const nombreSpan  = document.getElementById('nombreImagenPreview');
    const nombreDiv   = document.getElementById('nombreImagenEvento');
    if (vistaPrevia && previewImg) {
        previewImg.src = escapeUrl(src);
        const nombreCorto = nombre.length > 25 ? nombre.substring(0, 22) + '...' : nombre;
        nombreSpan.textContent = nombreCorto;
        vistaPrevia.style.display = 'block';
        if (nombreDiv) {
            nombreDiv.textContent = '';
            const badge = document.createElement('span');
            badge.className = 'badge-file';
            badge.textContent = nombre;
            nombreDiv.appendChild(badge);
        }
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

// ============ CALENDARIOS ============
function cargarCalendarios() {
    const lista = document.getElementById('listaCalendarios');
    if (!lista) return;
    lista.innerHTML = '<p class="calendarios-cargando">Cargando...</p>';

    fetch(`${BASE}/obtener_calendarios.php`, {
        headers: { "X-Requested-With": "XMLHttpRequest" }
    })
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                renderizarCalendarios(data);
            } else {
                lista.innerHTML = '<p class="calendarios-vacio">Error al cargar.</p>';
            }
        })
        .catch(() => {
            lista.innerHTML = '<p class="calendarios-vacio">Error de conexión.</p>';
        });
}

function renderizarCalendarios(data) {
    const lista = document.getElementById('listaCalendarios');
    if (!lista) return;

    if (data.length === 0) {
        lista.innerHTML = '<p class="calendarios-vacio">No hay calendarios subidos.</p>';
        return;
    }

    lista.innerHTML = '';
    data.forEach(cal => {
        const item = document.createElement('div');
        item.className = 'calendario-item';

        const info = document.createElement('div');
        info.className = 'calendario-item-info';

        const nombre = document.createElement('span');
        nombre.className = 'calendario-item-nombre';
        nombre.title = cal.archivo;
        nombre.textContent = '📄 ' + cal.archivo;

        const fecha = document.createElement('span');
        fecha.className = 'calendario-item-fecha';
        fecha.textContent = 'Subido: ' + formatearFecha(cal.created_at);

        info.appendChild(nombre);
        info.appendChild(fecha);

        const btnEliminar = document.createElement('button');
        btnEliminar.className = 'btn-eliminar-calendario';
        btnEliminar.textContent = '🗑️ Eliminar';
        btnEliminar.dataset.id = parseInt(cal.id);

        item.appendChild(info);
        item.appendChild(btnEliminar);
        lista.appendChild(item);
    });

    lista.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-eliminar-calendario');
        if (btn) eliminarCalendario(parseInt(btn.dataset.id));
    }, { once: true });
}

function eliminarCalendario(id) {
    if (!confirm("¿Está seguro de eliminar este calendario?")) return;

    fetch(`${BASE}/eliminar_calendario.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({ id })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            mostrarToast("Calendario eliminado");
            cargarCalendarios();
        } else {
            mostrarToast(data.mensaje || "Error al eliminar", "error");
        }
    })
    .catch(() => mostrarToast("Error de conexión", "error"));
}

// ============ FUNCIONES GLOBALES ============
function abrirModalEditar(id) {
    id = parseInt(id);
    const evento = eventos.find(e => e.id === id);
    if (!evento) return;

    eventoEditandoId = id;
    document.getElementById('modalEvento').style.display = 'flex'; // ← flex para centrar
    document.getElementById('modalTitulo').innerText     = 'Editar Evento';
    document.getElementById('eventoTitulo').value        = evento.titulo ?? '';
    document.getElementById('eventoDescripcion').value   = evento.descripcion ?? '';
    document.getElementById('eventoFecha').value         = formatearFecha(evento.fecha);
    document.getElementById('eventoTipo').value          = evento.tipo_evento ?? 'evento';
    document.getElementById('eventoEstado').value        = evento.estado ?? 'borrador';

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
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest"
        },
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

    const ventana = window.open('', '_blank');
    if (!ventana) { mostrarToast("El navegador bloqueó la ventana emergente", "warning"); return; }

    const doc = ventana.document;
    doc.open();
    doc.write('<!DOCTYPE html><html><head></head><body></body></html>');
    doc.close();

    const style = doc.createElement('style');
    style.textContent = `
        body { display:flex; justify-content:center; align-items:center;
               flex-direction:column; min-height:100vh; margin:0; background:#1a1a2e; }
        img  { max-width:90%; max-height:85vh; border-radius:10px;
               box-shadow:0 4px 20px rgba(0,0,0,0.5); }
        .title { color:white; text-align:center; margin-top:15px;
                 font-family:Arial; font-size:18px; }
        .close-btn { position:fixed; top:20px; right:30px; background:red; color:white;
                     border:none; padding:10px 20px; border-radius:5px;
                     cursor:pointer; font-size:16px; }
    `;
    doc.head.appendChild(style);
    doc.title = evento.titulo;

    const btn = doc.createElement('button');
    btn.className = 'close-btn';
    btn.textContent = 'Cerrar';
    btn.onclick = () => ventana.close();
    doc.body.appendChild(btn);

    const wrapper = doc.createElement('div');
    const img = doc.createElement('img');
    img.src = UPLOADS + evento.imagen;
    img.alt = evento.titulo;
    wrapper.appendChild(img);

    const title = doc.createElement('div');
    title.className = 'title';
    title.textContent = evento.titulo;
    wrapper.appendChild(title);

    doc.body.appendChild(wrapper);
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
        document.getElementById('modalEvento').style.display = 'flex'; // ← flex para centrar
        document.getElementById('modalTitulo').innerText     = 'Agregar Nuevo Evento';
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

        fetch(url, {
            method: "POST",
            headers: { "X-Requested-With": "XMLHttpRequest" },
            body: formData
        })
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
        document.getElementById('modalCalendario').style.display = 'flex'; // ← flex para centrar
        archivoBase64       = null;
        nombreArchivoActual = '';
        document.getElementById('nombreArchivo').innerHTML  = '';
        document.getElementById('archivoCalendario').value  = '';
        cargarCalendarios();
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
        fetch(`${BASE}/guardar_calendario.php`, {
            method: "POST",
            headers: { "X-Requested-With": "XMLHttpRequest" },
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    mostrarToast("Calendario subido correctamente");
                    archivoInput.value = '';
                    document.getElementById('nombreArchivo').innerHTML = '';
                    cargarCalendarios();
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
        const span = document.createElement('span');
        span.className = 'badge-file';
        span.textContent = nombreArchivoActual;
        const nombreDiv = document.getElementById('nombreArchivo');
        nombreDiv.innerHTML = '';
        nombreDiv.appendChild(span);
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

    cargarEventos();
});