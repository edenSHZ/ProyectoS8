const loginForm     = document.getElementById('loginForm');
const emailInput    = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage  = document.getElementById('errorMessage');

// MOSTRAR ERROR
function showError(msg) {
    errorMessage.textContent = "⚠️ " + msg;
    errorMessage.classList.add('show');
    setTimeout(() => errorMessage.classList.remove('show'), 3000);
}

// VALIDAR EMAIL
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// VERIFICAR SESIÓN AL CARGAR
fetch(`${BASE_URL}/api/config/verificar_sesion.php`, { credentials: "include" })
    .then(res => res.json())
    .then(data => {
        if (data.logueado) {
            window.location.href = `${BASE_URL}/views/inicio_admin.html`;
        }
    })
    .catch(() => {});

// LOGIN
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const email    = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        showError("Completa todos los campos");
        return;
    }

    if (!validateEmail(email)) {
        showError("Correo inválido");
        return;
    }

    const btn = document.querySelector('.login-btn');
    btn.textContent = "Verificando...";
    btn.disabled    = true;

    fetch(`${BASE_URL}/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            btn.textContent      = "Ingresando...";
            btn.style.background = "#28a745";
            setTimeout(() => {
                window.location.href = `${BASE_URL}/views/inicio_admin.html`;
            }, 800);
        } else {
            showError(data.message);
            passwordInput.value = "";
            btn.textContent  = "Iniciar sesión";
            btn.disabled     = false;
        }
    })
    .catch(() => {
        showError("Error de conexión con el servidor");
        btn.textContent = "Iniciar sesión";
        btn.disabled    = false;
    });
});