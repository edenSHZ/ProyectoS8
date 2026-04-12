document.addEventListener("DOMContentLoaded", () => {

    // ============ PROTEGER DASHBOARD ============
    fetch("php/inicio/verificar_sesion.php", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
            if (!data.logueado) window.location.href = "index.html";
        });

    // ============ MOSTRAR EMAIL ============
    fetch("php/inicio/obtener_admin.php", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
            const userEl = document.getElementById("userEmail");
            if (userEl && data.email) userEl.textContent = data.email;
        });

    // ============ CARGAR DATOS DASHBOARD ============
    fetch("php/inicio/obtener_dashboard.php", { credentials: "include" })
        .then(res => res.json())
        .then(data => {

            // Contadores
            const cardMensajes   = document.getElementById('cardMensajes');
            const cardPublicados = document.getElementById('cardPublicados');
            if (cardMensajes)   cardMensajes.textContent   = data.totalMensajes;
            if (cardPublicados) cardPublicados.textContent = data.totalPublicados;

            // Tabla eventos
            const tbodyEventos = document.getElementById('tbodyEventos');
            if (tbodyEventos) {
                if (data.eventos.length === 0) {
                    tbodyEventos.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#888;">Sin eventos</td></tr>';
                } else {
                    tbodyEventos.innerHTML = data.eventos.map((e, i) => `
                        <tr>
                            <td>${String(i + 1).padStart(2, '0')}</td>
                            <td>${e.titulo}</td>
                            <td>${formatearFecha(e.fecha)}</td>
                            <td>${e.estado === 'publicado' ? 'Publicado' : 'Borrador'}</td>
                        </tr>
                    `).join('');
                }
            }

            // Tabla mensajes
            const tbodyMensajes = document.getElementById('tbodyMensajes');
            if (tbodyMensajes) {
                if (data.mensajes.length === 0) {
                    tbodyMensajes.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;">Sin mensajes</td></tr>';
                } else {
                    tbodyMensajes.innerHTML = data.mensajes.map(m => `
                        <tr>
                            <td>${m.nombre}</td>
                            <td>${m.telefono || '—'}</td>
                            <td>${m.email}</td>
                            <td>${m.asunto || '—'}</td>
                            <td>${m.mensaje}</td>
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
            await fetch("php/logout.php", { method: "POST", credentials: "include" });
            window.location.href = "index.html";
        });
    }

    // ============ AUTO LOGOUT ============
    let tiempoInactividad;
    function resetTimer() {
        clearTimeout(tiempoInactividad);
        tiempoInactividad = setTimeout(() => {
            alert("Sesión cerrada por inactividad");
            fetch("php/logout.php", { credentials: "include" })
                .then(() => window.location.href = "index.html");
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
            reader.onload = ev => document.getElementById("promoImage").src = ev.target.result;
            reader.readAsDataURL(file);
        }
    });

    // ============ NAVEGACIÓN ============
    document.getElementById('menuNoticias')?.addEventListener('click',   () => window.location.href = 'avisos_noticias.html');
    document.getElementById('menuOferta')?.addEventListener('click',     () => window.location.href = 'oferta_academica.html');
    document.getElementById('menuAdmisiones')?.addEventListener('click', () => window.location.href = 'admisiones.html');
    document.getElementById('menuContacto')?.addEventListener('click',   () => window.location.href = 'contacto.html');

});

// ============ FORMATEAR FECHA ============
function formatearFecha(fechaBD) {
    if (!fechaBD) return '';
    const parte = fechaBD.split(' ')[0];
    const [anio, mes, dia] = parte.split('-');
    return `${dia}/${mes}/${anio}`;
}