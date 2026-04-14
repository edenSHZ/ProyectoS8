document.addEventListener('DOMContentLoaded', function() {

    const form = document.querySelector('.contacto-form');

    form?.addEventListener('submit', function(e) {
        e.preventDefault();

        const nombre   = document.getElementById('nombre').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const email    = document.getElementById('email').value.trim();
        const asunto   = document.getElementById('asunto').value.trim();
        const mensaje  = document.getElementById('mensaje').value.trim();

        // Validaciones básicas
        if (!nombre || !email || !mensaje) {
            mostrarToast("Por favor completa los campos obligatorios", "warning");
            return;
        }

        if (!validarEmail(email)) {
            mostrarToast("Correo electrónico inválido", "warning");
            return;
        }

        const btnEnviar = document.querySelector('.btn-enviar');
        btnEnviar.textContent = "Enviando...";
        btnEnviar.disabled    = true;

        fetch("php/guardar_contacto.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, telefono, email, asunto, mensaje })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                mostrarToast("¡Mensaje enviado correctamente! Te contactaremos pronto.", "success");
                form.reset();
            } else {
                mostrarToast(data.mensaje || "Error al enviar", "error");
            }
            btnEnviar.textContent = "Enviar";
            btnEnviar.disabled    = false;
        })
        .catch(() => {
            mostrarToast("Error de conexión con el servidor", "error");
            btnEnviar.textContent = "Enviar";
            btnEnviar.disabled    = false;
        });
    });

    function validarEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

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
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 4000);
    }

});