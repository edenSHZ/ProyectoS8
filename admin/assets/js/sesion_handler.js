// ============================================================
// sesion_handler.js — va en /admin/assets/js/
// Maneja todos los errores de sesión del panel admin
// Incluir en TODOS los HTML del panel admin
// ============================================================

// ── Mensajes por código de error ────────────────────────
const MENSAJES_SESION = {
    SESSION_DISPLACED : 'Tu sesión fue cerrada porque se inició sesión desde otro dispositivo.',
    SESSION_EXPIRED   : 'Tu sesión expiró por inactividad. Por favor inicia sesión nuevamente.',
    SESSION_IP_MISMATCH: 'Tu sesión fue cerrada por seguridad (cambio de red detectado).',
    SESSION_INVALID   : 'Sesión no válida. Por favor inicia sesión nuevamente.',
    NO_SESSION        : 'No hay sesión activa. Por favor inicia sesión.',
};

// ── Redirigir al login con mensaje ───────────────────────
function cerrarSesionForzado(codigo) {
    const mensaje = MENSAJES_SESION[codigo] || 'Sesión cerrada. Por favor inicia sesión.';
    alert(mensaje);
    window.location.href = `${BASE_URL}/index.html`;
}

// ── Verificar respuesta de cualquier fetch del admin ─────
// Úsala en TODOS los .then(data => ...) del panel
function verificarSesion(data) {
    if (!data) return false;

    const codigosSesion = [
        'SESSION_DISPLACED',
        'SESSION_EXPIRED',
        'SESSION_IP_MISMATCH',
        'SESSION_INVALID',
        'NO_SESSION'
    ];

    if (data.status === 'error' && codigosSesion.includes(data.codigo)) {
        cerrarSesionForzado(data.codigo);
        return false; // indica que no se debe continuar procesando
    }

    return true; // sesión válida, continuar normalmente
}

// ── Interceptar fetch globalmente ────────────────────────
// Sobreescribe fetch para verificar sesión en TODAS las peticiones
// sin tener que agregar verificarSesion() en cada fetch manualmente
const _fetchOriginal = window.fetch;

window.fetch = function (...args) {
    return _fetchOriginal.apply(this, args).then(async response => {
        // Clonar la respuesta para poder leerla sin consumirla
        const clon = response.clone();

        try {
            const data = await clon.json();

            // Si es un error de sesión, redirigir automáticamente
            const codigosSesion = [
                'SESSION_DISPLACED',
                'SESSION_EXPIRED',
                'SESSION_IP_MISMATCH',
                'SESSION_INVALID',
                'NO_SESSION'
            ];

            if (data.status === 'error' && codigosSesion.includes(data.codigo)) {
                cerrarSesionForzado(data.codigo);
                // Retornar la respuesta original para no romper el flujo
                return response;
            }
        } catch (e) {
            // Si la respuesta no es JSON, ignorar
        }

        return response;
    });
};

// ── Verificar sesión activa al cargar cualquier página del admin ──
document.addEventListener('DOMContentLoaded', () => {
    fetch(`${BASE_URL}/api/config/verificar_sesion.php`, {
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" }
    })
    .then(res => res.json())
    .then(data => {
        if (!data.logueado) {
            window.location.href = `${BASE_URL}/index.html`;
        }
    })
    .catch(() => {
        // Si falla la verificación no redirigir — puede ser error de red
        console.warn('No se pudo verificar la sesión');
    });
});