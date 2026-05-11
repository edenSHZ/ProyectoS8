<?php
// ============================================================
// logout.php — va en /admin/ (mismo nivel que login.php)
// ============================================================
ini_set('session.use_only_cookies', 1);

session_set_cookie_params([
    'secure'   => false,     // cambiar a true en producción con HTTPS
    'httponly' => true,
    'samesite' => 'Strict'
]);
session_start();

header("Content-Type: application/json; charset=UTF-8");

if (isset($_SESSION['admin_id'])) {
    $adminId = (int) $_SESSION['admin_id'];

    include "api/config/conexion.php"; // ✅ ruta correcta desde admin/

    // Limpiar token en la BD
    $stmt = $conn->prepare(
        "UPDATE administrador
         SET session_token  = NULL,
             session_fecha  = NULL,
             session_ip     = NULL,
             session_agente = NULL
         WHERE id_admin = ?"
    );

    if ($stmt) {
        $stmt->bind_param("i", $adminId);
        $stmt->execute();
        $stmt->close();
    }

    $conn->close();
}

// Destruir sesión completamente
session_unset();
session_destroy();

// Eliminar cookie de sesión del navegador
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(), '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

echo json_encode(["status" => "success"]);
?>