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

// ============ FORMATEAR FECHA ============
function formatearFecha(fechaBD) {
    if (!fechaBD) return '';
    const parte = fechaBD.split(' ')[0];
    const [anio, mes, dia] = parte.split('-');
    return `${dia}/${mes}/${anio}`;
}

document.addEventListener("DOMContentLoaded", () => {

    // ============ PROTEGER DASHBOARD ============
    fetch(`${BASE_URL}/api/config/verificar_sesion.php`, {
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" } // ✅
    })
        .then(res => res.json())
        .then(data => {
            if (!data.logueado) window.location.href = `${BASE_URL}/index.html`;
        });

    // ============ MOSTRAR EMAIL ============
    fetch(`${BASE_URL}/api/config/obtener_admin.php`, {
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" } // ✅
    })
        .then(res => res.json())
        .then(data => {
            const userEl = document.getElementById("userEmail");
            // ✅ textContent — nunca interpreta HTML
            if (userEl && data.email) userEl.textContent = data.email;
        });

    // ============ CARGAR DATOS DASHBOARD ============
    fetch(`${BASE_URL}/api/config/obtener_dashboard.php`, {
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" } // ✅
    })
        .then(res => res.json())
        .then(data => {

            // ✅ textContent para contadores — nunca innerHTML
            const cardMensajes   = document.getElementById('cardMensajes');
            const cardPublicados = document.getElementById('cardPublicados');
            if (cardMensajes)   cardMensajes.textContent   = data.totalMensajes;
            if (cardPublicados) cardPublicados.textContent = data.totalPublicados;

            // Tabla eventos
            const tbodyEventos = document.getElementById('tbodyEventos');
            if (tbodyEventos) {
                if (!data.eventos || data.eventos.length === 0) {
                    tbodyEventos.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#888;">Sin eventos</td></tr>';
                } else {
                    // ✅ Datos dinámicos escapados con escapeHtml()
                    tbodyEventos.innerHTML = data.eventos.map((e, i) => `
                        <tr>
                            <td>${String(i + 1).padStart(2, '0')}</td>
                            <td>${escapeHtml(e.titulo)}</td>
                            <td>${escapeHtml(formatearFecha(e.fecha))}</td>
                            <td>${e.estado === 'publicado' ? 'Publicado' : 'Borrador'}</td>
                        </tr>
                    `).join('');
                }
            }

            // Tabla mensajes
            const tbodyMensajes = document.getElementById('tbodyMensajes');
            if (tbodyMensajes) {
                if (!data.mensajes || data.mensajes.length === 0) {
                    tbodyMensajes.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;">Sin mensajes</td></tr>';
                } else {
                    // ✅ Datos dinámicos escapados con escapeHtml()
                    tbodyMensajes.innerHTML = data.mensajes.map(m => `
                        <tr>
                            <td>${escapeHtml(m.nombre)}</td>
                            <td>${escapeHtml(m.telefono) || '—'}</td>
                            <td>${escapeHtml(m.email)}</td>
                            <td>${escapeHtml(m.asunto) || '—'}</td>
                            <td>${escapeHtml(m.mensaje)}</td>
                        </tr>
                    `).join('');
                }
            }
        })
        .catch(() => console.error("Error al cargar dashboard"));

    // ============ LOGOUT ============
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await fetch(`${BASE_URL}/logout.php`, {
                method: "POST",
                credentials: "include",
                headers: { "X-Requested-With": "XMLHttpRequest" } // ✅
            });
            window.location.href = `${BASE_URL}/index.html`;
        });
    }

    // ============ AUTO LOGOUT ============
    let tiempoInactividad;
    function resetTimer() {
        clearTimeout(tiempoInactividad);
        tiempoInactividad = setTimeout(() => {
            alert("Sesión cerrada por inactividad");
            fetch(`${BASE_URL}/logout.php`, {
                credentials: "include",
                headers: { "X-Requested-With": "XMLHttpRequest" } // ✅
            })
                .then(() => window.location.href = `${BASE_URL}/index.html`);
        }, 300000);
    }
    document.onmousemove = resetTimer;
    document.onkeypress  = resetTimer;
    document.onclick     = resetTimer;
    resetTimer();

    // ============ PROMO ============
    document.getElementById('changeImageBtn')?.addEventListener('click', () => {
        document.getElementById('fileInput')?.click();
    });

    document.getElementById('fileInput')?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            // ✅ .src como propiedad DOM — seguro para data URLs de FileReader
            reader.onload = ev => {
                const promoImage = document.getElementById("promoImage");
                if (promoImage) promoImage.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // ============ NAVEGACIÓN ============
    document.getElementById('menuNoticias')?.addEventListener('click',   () => window.location.href = 'avisos_noticias.html');
    document.getElementById('menuOferta')?.addEventListener('click',     () => window.location.href = 'oferta_academica.html');
    document.getElementById('menuAdmisiones')?.addEventListener('click', () => window.location.href = 'admisiones.html');
    document.getElementById('menuContacto')?.addEventListener('click',   () => window.location.href = 'contacto.html');
});