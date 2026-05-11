document.addEventListener('DOMContentLoaded', function() {

    const form = document.querySelector('.contacto-form');

    // Convertir email a minúsculas en tiempo real mientras escribe
    const inputEmail = document.getElementById('email');
    inputEmail?.addEventListener('input', function() {
        const pos = this.selectionStart;
        this.value = this.value.toLowerCase();
        this.setSelectionRange(pos, pos);
    });

    // Limitar telefono a 15 dígitos en tiempo real
    const inputTelefono = document.getElementById('telefono');
    inputTelefono?.addEventListener('input', function() {
        // Permitir solo + al inicio, números, espacios y guiones
        this.value = this.value.replace(/[^0-9+\s\-]/g, '');

        // Contar solo los digitos para el limite de 15
        const soloDigitos = this.value.replace(/[^0-9]/g, '');
        if (soloDigitos.length > 15) {
            // Recortar si se pega un número muy largo
            this.value = this.value.slice(0, this.value.length - (soloDigitos.length - 15));
        }
    });

    form?.addEventListener('submit', function(e) {
        e.preventDefault();

        const nombre   = document.getElementById('nombre').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const email    = document.getElementById('email').value.trim().toLowerCase();
        const asunto   = document.getElementById('asunto').value.trim();
        const mensaje  = document.getElementById('mensaje').value.trim();

        // Campos obligatorios
        if (!nombre || !email || !mensaje) {
            mostrarToast("Por favor completa los campos obligatorios", "warning");
            return;
        }

        // Nombre — solo letras y espacios
        if (!/^[\p{L}\s]+$/u.test(nombre)) {
            mostrarToast("El nombre solo puede contener letras y espacios", "warning");
            return;
        }

        // Email — solo minúsculas, formato válido
        if (!validarEmail(email)) {
            mostrarToast("Correo inválido. Usa solo letras minúsculas, números y los caracteres . _ -", "warning");
            return;
        }

        // Verificar que no tenga mayúsculas (por si acaso)
        if (email !== email.toLowerCase()) {
            mostrarToast("El correo no puede contener mayúsculas", "warning");
            return;
        }

        // Telefono — máximo 15 dígitos
        if (telefono !== '') {
            const soloDigitos = telefono.replace(/[^0-9]/g, '');
            if (soloDigitos.length < 7) {
                mostrarToast("El teléfono debe tener al menos 7 dígitos", "warning");
                return;
            }
            if (soloDigitos.length > 15) {
                mostrarToast("El teléfono no puede tener más de 15 dígitos", "warning");
                return;
            }
            if (!/^\+?[0-9\s\-]+$/.test(telefono)) {
                mostrarToast("El teléfono solo puede contener números, espacios y guiones", "warning");
                return;
            }
        }

        const btnEnviar = document.querySelector('.btn-enviar');
        btnEnviar.textContent = "Enviando...";
        btnEnviar.disabled    = true;

        fetch("config/guardar_contacto.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest"
            },
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

    // Email estricto — solo minúsculas, números y . _ - @
    function validarEmail(email) {
        return /^[a-z0-9._\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/.test(email);
    }

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
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 4000);
    }

});