<?php
ini_set('session.use_only_cookies', 1);
ini_set('session.use_trans_sid', 0);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header("Content-Type: application/json");

// Capa 7 - Verificar autenticación
if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "mensaje" => "No autenticado"]);
    exit;
}

// Capa 5 - Timeout absoluto
if (isset($_SESSION['absolute_timeout'])) {
    if (time() > $_SESSION['absolute_timeout']) {
        session_unset();
        session_destroy();
        http_response_code(401);
        echo json_encode(["status" => "error", "mensaje" => "Sesión expirada"]);
        exit;
    }
}

// Capa 5 - Timeout por inactividad
if (isset($_SESSION['last_activity'])) {
    if (time() - $_SESSION['last_activity'] > 1800) {
        session_unset();
        session_destroy();
        http_response_code(401);
        echo json_encode(["status" => "error", "mensaje" => "Sesión inactiva"]);
        exit;
    }
}

// Actualizar última actividad
$_SESSION['last_activity'] = time();
?>