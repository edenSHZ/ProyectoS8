<?php
ini_set('session.use_only_cookies', 1);
session_start();
header("Content-Type: application/json");

// Capa 7 - Verificar autenticación
if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "No autenticado"]);
    exit;
}

// Capa 5 - Verificar inactividad
$inactivity_limit = 1800;
if (isset($_SESSION['last_activity'])) {
    if (time() - $_SESSION['last_activity'] > $inactivity_limit) {
        session_unset();
        session_destroy();
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Sesión expirada"]);
        exit;
    }
}

$_SESSION['last_activity'] = time();

echo json_encode([
    "status"  => "success",
    "usuario" => htmlspecialchars($_SESSION['usuario'], ENT_QUOTES | ENT_HTML5, 'UTF-8'),
    "email"   => htmlspecialchars($_SESSION['email'],   ENT_QUOTES | ENT_HTML5, 'UTF-8')
]);
?>