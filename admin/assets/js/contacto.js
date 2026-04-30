const BASE    = `${BASE_URL}/api/contacto`;
let mensajes = [];

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

// ============ FORMATEAR FECHA ============
function formatearFecha(fechaBD) {
    if (!fechaBD) return '';
    const parte = fechaBD.split(' ')[0];
    const [anio, mes, dia] = parte.split('-');
    return `${dia}/${mes}/${anio}`;
}

// ============ CARGAR MENSAJES ============
function cargarMensajes() {
    fetch(`${BASE}/obtener_contacto.php`)
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                mensajes = data;
                mostrarMensajes();
            }
        })
        .catch(() => mostrarToast("Error al cargar mensajes", "error"));
}

// ============ MOSTRAR MENSAJES ============
function mostrarMensajes() {
    const lista = document.getElementById('listaMensajes');
    if (!lista) return;

    if (mensajes.length === 0) {
        lista.innerHTML = '<p style="color: #888; font-size: 14px;">No hay mensajes recibidos.</p>';
        return;
    }

    lista.innerHTML = mensajes.map(m => `
        <div class="message" id="msg-${m.id_contacto}" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 0;
            border-bottom: 0.5px solid #eee;
        ">
            <div class="message-info" style="flex: 1;">
                <div class="message-title" style="
                    font-weight: ${m.leido ? '400' : '600'};
                    font-size: 14px;
                    color: ${m.leido ? '#666' : '#1a1a1a'};
                ">
                    ${m.leido ? '' : '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#3b82f6;margin-right:6px;"></span>'}
                    ${m.asunto || 'Sin asunto'}
                </div>
                <div class="message-sub" style="font-size: 13px; color: #888; margin-top: 2px;">
                    ${m.nombre} — ${formatearFecha(m.created_at)}
                </div>
            </div>
            <div class="actions" style="display: flex; gap: 12px; align-items: center;">
                <span class="btn-ver" data-id="${m.id_contacto}"
                    title="${m.leido ? 'Ya leído' : 'Marcar como leído'}"
                    style="cursor: pointer; font-size: 18px; opacity: ${m.leido ? '0.4' : '1'};">👁️</span>
                <span class="btn-eliminar" data-id="${m.id_contacto}"
                    title="Eliminar"
                    style="cursor: pointer; font-size: 18px;">🗑️</span>
            </div>
        </div>
    `).join('');
}

// ============ VER DETALLE Y MARCAR LEÍDO ============
function verDetalle(id) {
    const mensaje = mensajes.find(m => m.id_contacto === id);
    if (!mensaje) return;

    document.getElementById('detalle-nombre').textContent   = mensaje.nombre;
    document.getElementById('detalle-email').textContent    = mensaje.email;
    document.getElementById('detalle-telefono').textContent = mensaje.telefono || 'No proporcionado';
    document.getElementById('detalle-asunto').textContent   = mensaje.asunto   || 'Sin asunto';
    document.getElementById('detalle-mensaje').textContent  = mensaje.mensaje;
    document.getElementById('detalle-fecha').textContent    = formatearFecha(mensaje.created_at);

    document.getElementById('panelDetalle').style.display = 'block';
    document.getElementById('overlay').style.display      = 'block';

    if (!mensaje.leido) {
        fetch(`${BASE}/marcar_leido.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                mensaje.leido = true;
                mostrarMensajes();
            }
        })
        .catch(() => {});
    }
}

// ============ CERRAR PANEL ============
function cerrarPanel() {
    document.getElementById('panelDetalle').style.display = 'none';
    document.getElementById('overlay').style.display      = 'none';
}

// ============ ELIMINAR MENSAJE ============
function eliminarMensaje(id) {
    if (!confirm("¿Está seguro de eliminar este mensaje?")) return;

    fetch(`${BASE}/eliminar_contacto.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            mostrarToast("Mensaje eliminado");
            mensajes = mensajes.filter(m => m.id_contacto !== id);
            mostrarMensajes();
            cerrarPanel();
        } else {
            mostrarToast(data.mensaje || "Error al eliminar", "error");
        }
    })
    .catch(() => mostrarToast("Error de conexión", "error"));
}

// ============ DOMCONTENTLOADED ============
document.addEventListener('DOMContentLoaded', function() {

    // Delegación de eventos
    document.addEventListener('click', function(e) {
        const btnVer = e.target.closest('.btn-ver');
        if (btnVer) {
            const id = parseInt(btnVer.dataset.id);
            verDetalle(id);
            return;
        }

        const btnEliminar = e.target.closest('.btn-eliminar');
        if (btnEliminar) {
            const id = parseInt(btnEliminar.dataset.id);
            eliminarMensaje(id);
            return;
        }
    });

    // Cerrar panel
    document.getElementById('overlay')?.addEventListener('click', cerrarPanel);

    // Navegación
    document.getElementById('menuDashboard')?.addEventListener('click',  () => window.location.href = 'inicio_admin.html');
    document.getElementById('menuNoticias')?.addEventListener('click',   () => window.location.href = 'avisos_noticias.html');
    document.getElementById('menuOferta')?.addEventListener('click',     () => window.location.href = 'oferta_academica.html');
    document.getElementById('menuAdmisiones')?.addEventListener('click', () => window.location.href = 'admisiones.html');

    // Inicializar
    cargarMensajes();
});