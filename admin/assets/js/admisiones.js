const BASE    = `${BASE_URL}/api/admisiones`;
const UPLOADS = `${BASE_URL}/uploads/galeria/`;

let modoActivo        = 'carrusel';
let imagenCambiandoId = null;
let carruselData      = [];
let promocionData     = null;

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

// ============ CAMBIAR MODO ============
function cambiarModo(modo) {
    modoActivo = modo;
    document.querySelectorAll('.modo-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.modo === modo);
    });
    document.getElementById('carruselSection').style.display  = modo === 'carrusel'  ? 'block' : 'none';
    document.getElementById('promocionSection').style.display = modo === 'promocion' ? 'block' : 'none';
}

// ============ CARGAR GALERÍA ============
function cargarGaleria() {
    fetch(`${BASE}/obtener_galeria.php`, {
        headers: { "X-Requested-With": "XMLHttpRequest" } // ✅
    })
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                carruselData  = data.filter(i => i.tipo === 'carrusel');
                promocionData = data.find(i => i.tipo === 'promocion') || null;
                renderizarCarrusel();
                renderizarPromocion();
            }
        })
        .catch(() => mostrarToast("Error al cargar galería", "error"));
}

// ============ RENDERIZAR CARRUSEL ============
function renderizarCarrusel() {
    const grid = document.getElementById('carruselGrid');

    if (carruselData.length === 0) {
        grid.innerHTML = '<p style="color:#888;font-size:14px;">No hay imágenes en el carrusel. Agrega hasta 4.</p>';
        return;
    }

    // ✅ IDs como enteros, URLs con escapeUrl
    grid.innerHTML = `
        <div class="carousel">
            ${carruselData.map(img => `
                <div class="card" data-id="${parseInt(img.id)}">
                    <img src="${escapeUrl(UPLOADS + img.imagen)}" alt="Imagen carrusel ${parseInt(img.orden)}"
                        style="width:100%;height:160px;object-fit:cover;border-radius:8px;">
                    <div style="display:flex;gap:6px;margin-top:8px;justify-content:center;">
                        <button class="btn-cambiar-carrusel" data-id="${parseInt(img.id)}"
                                style="background:#1f4f8b;color:white;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:12px;">
                            Cambiar
                        </button>
                        <button class="btn-eliminar-carrusel" data-id="${parseInt(img.id)}"
                                style="background:#dc3545;color:white;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:12px;">
                            Eliminar
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ============ RENDERIZAR PROMOCIÓN ============
function renderizarPromocion() {
    const container = document.getElementById('promocionContainer');
    const btnSubir  = document.getElementById('btnSubirPromocion');

    if (!promocionData) {
        container.innerHTML = '<p style="color:#888;font-size:14px;">No hay imagen de promoción.</p>';
        btnSubir.style.display = 'block';
        return;
    }

    btnSubir.style.display = 'none';

    // ✅ Construido con DOM API — sin innerHTML con datos dinámicos
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;display:inline-block;width:100%;';

    const img = document.createElement('img');
    img.src   = escapeUrl(UPLOADS + promocionData.imagen);
    img.alt   = 'Promoción';
    img.style.cssText = 'width:100%;max-height:300px;object-fit:cover;border-radius:12px;';
    wrapper.appendChild(img);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:8px;margin-top:10px;justify-content:center;';

    const btnCambiar = document.createElement('button');
    btnCambiar.id = 'btnCambiarPromo';
    btnCambiar.textContent = 'Cambiar imagen';
    btnCambiar.style.cssText = 'background:#1f4f8b;color:white;border:none;padding:8px 18px;border-radius:8px;cursor:pointer;font-size:13px;';

    const btnEliminar = document.createElement('button');
    btnEliminar.id = 'btnEliminarPromo';
    btnEliminar.dataset.id = parseInt(promocionData.id);
    btnEliminar.textContent = 'Eliminar imagen';
    btnEliminar.style.cssText = 'background:#dc3545;color:white;border:none;padding:8px 18px;border-radius:8px;cursor:pointer;font-size:13px;';

    btnRow.appendChild(btnCambiar);
    btnRow.appendChild(btnEliminar);
    wrapper.appendChild(btnRow);
    container.appendChild(wrapper);

    btnCambiar.addEventListener('click', () => {
        imagenCambiandoId = promocionData.id;
        document.getElementById('cambiarPromoInput').click();
    });

    btnEliminar.addEventListener('click', () => {
        eliminarImagen(promocionData.id);
    });
}

// ============ SUBIR IMÁGENES CARRUSEL (múltiple) ============
function subirImagenesCarrusel(archivos) {
    const disponibles = 4 - carruselData.length;

    if (disponibles <= 0) {
        mostrarToast("Ya tienes 4 imágenes. Elimina una primero.", "warning");
        return;
    }

    const limite = Math.min(archivos.length, disponibles);
    let subidas  = 0;

    for (let i = 0; i < limite; i++) {
        const orden    = carruselData.length + i + 1;
        const formData = new FormData();
        formData.append('imagen', archivos[i]);
        formData.append('tipo',   'carrusel');
        formData.append('orden',  orden);

        fetch(`${BASE}/guardar_galeria.php`, {
            method: "POST",
            headers: { "X-Requested-With": "XMLHttpRequest" }, // ✅
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    subidas++;
                    if (subidas === limite) {
                        mostrarToast(`${subidas} imagen(es) agregadas al carrusel`);
                        cargarGaleria();
                    }
                } else {
                    mostrarToast(data.mensaje || "Error al subir", "error");
                }
            })
            .catch(() => mostrarToast("Error de conexión", "error"));
    }
}

// ============ SUBIR IMAGEN PROMOCIÓN ============
function subirImagenPromocion(archivo) {
    const formData = new FormData();
    formData.append('imagen', archivo);
    formData.append('tipo',   'promocion');
    formData.append('orden',  1);

    fetch(`${BASE}/guardar_galeria.php`, {
        method: "POST",
        headers: { "X-Requested-With": "XMLHttpRequest" }, // ✅ — también se corrigió la URL (tenía /admisiones/ duplicado)
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                mostrarToast("Imagen de promoción guardada");
                cargarGaleria();
            } else {
                mostrarToast(data.mensaje || "Error al subir", "error");
            }
        })
        .catch(() => mostrarToast("Error de conexión", "error"));
}

// ============ CAMBIAR IMAGEN ============
function cambiarImagen(id, archivo) {
    const formData = new FormData();
    formData.append('id',     id);
    formData.append('imagen', archivo);

    fetch(`${BASE}/cambiar_galeria.php`, {
        method: "POST",
        headers: { "X-Requested-With": "XMLHttpRequest" }, // ✅
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                mostrarToast("Imagen actualizada");
                cargarGaleria();
            } else {
                mostrarToast(data.mensaje || "Error al cambiar", "error");
            }
        })
        .catch(() => mostrarToast("Error de conexión", "error"));
}

// ============ ELIMINAR IMAGEN ============
function eliminarImagen(id) {
    if (!confirm("¿Está seguro de eliminar esta imagen?")) return;

    fetch(`${BASE}/eliminar_galeria.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest" // ✅ — también se corrigió la URL (tenía /admisiones/ duplicado)
        },
        body: JSON.stringify({ id })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            mostrarToast("Imagen eliminada");
            cargarGaleria();
        } else {
            mostrarToast(data.mensaje || "Error al eliminar", "error");
        }
    })
    .catch(() => mostrarToast("Error de conexión", "error"));
}

// ============ DELEGACIÓN DE EVENTOS ============
document.addEventListener('click', function(e) {

    const modoBnt = e.target.closest('.modo-btn');
    if (modoBnt) {
        cambiarModo(modoBnt.dataset.modo);
        return;
    }

    const btnCambiar = e.target.closest('.btn-cambiar-carrusel');
    if (btnCambiar) {
        imagenCambiandoId = parseInt(btnCambiar.dataset.id);
        document.getElementById('cambiarInput').click();
        return;
    }

    const btnEliminar = e.target.closest('.btn-eliminar-carrusel');
    if (btnEliminar) {
        eliminarImagen(parseInt(btnEliminar.dataset.id));
        return;
    }
});

// ============ DOMCONTENTLOADED ============
document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('btnSubirCarrusel')?.addEventListener('click', () => {
        document.getElementById('carouselInput').click();
    });

    document.getElementById('carouselInput')?.addEventListener('change', function() {
        if (this.files.length > 0) {
            subirImagenesCarrusel(this.files);
            this.value = '';
        }
    });

    document.getElementById('cambiarInput')?.addEventListener('change', function() {
        if (this.files[0] && imagenCambiandoId) {
            cambiarImagen(imagenCambiandoId, this.files[0]);
            imagenCambiandoId = null;
            this.value = '';
        }
    });

    document.getElementById('btnSubirPromocion')?.addEventListener('click', () => {
        document.getElementById('imgGrandeInput').click();
    });

    document.getElementById('imgGrandeInput')?.addEventListener('change', function() {
        if (this.files[0]) {
            subirImagenPromocion(this.files[0]);
            this.value = '';
        }
    });

    document.getElementById('cambiarPromoInput')?.addEventListener('change', function() {
        if (this.files[0] && imagenCambiandoId) {
            cambiarImagen(imagenCambiandoId, this.files[0]);
            imagenCambiandoId = null;
            this.value = '';
        }
    });

    document.getElementById('menuDashboard')?.addEventListener('click',  () => window.location.href = 'inicio_admin.html');
    document.getElementById('menuNoticias')?.addEventListener('click',   () => window.location.href = 'avisos_noticias.html');
    document.getElementById('menuOferta')?.addEventListener('click',     () => window.location.href = 'oferta_academica.html');
    document.getElementById('menuContacto')?.addEventListener('click',   () => window.location.href = 'contacto.html');

    document.addEventListener('dragover', e => e.preventDefault());
    document.addEventListener('drop',     e => e.preventDefault());

    cargarGaleria();
});