<?php
// ============================================================
// verificar_sesion.php — va en /admin/api/config/
// Lo llama el JS del panel para saber si hay sesión activa
// ============================================================
ini_set('session.use_only_cookies', 1);
ini_set('session.use_trans_sid', 0);

session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => false,     // cambiar a true en producción con HTTPS
    'httponly' => true,
    'samesite' => 'Strict'
]);
session_start();

header("Content-Type: application/json; charset=UTF-8");

$inactivity_limit = 900;  // 15 minutos 
$absolute_limit   = 28800; // 8 horas

// ── Timeout absoluto ─────────────────────────────────────
if (isset($_SESSION['absolute_timeout']) && time() > $_SESSION['absolute_timeout']) {
    session_unset();
    session_destroy();
    echo json_encode(["logueado" => false, "codigo" => "SESSION_EXPIRED"]);
    exit;
}

// ── Timeout por inactividad ──────────────────────────────
$ultimaActividad = $_SESSION['last_activity'] ?? $_SESSION['ultima_actividad'] ?? 0;
if ($ultimaActividad > 0 && time() - $ultimaActividad > $inactivity_limit) {
    session_unset();
    session_destroy();
    echo json_encode(["logueado" => false, "codigo" => "SESSION_EXPIRED"]);
    exit;
}

// ── Verificar que exista sesión ──────────────────────────
if (!isset($_SESSION['admin_id']) || !isset($_SESSION['session_token'])) {
    echo json_encode(["logueado" => false, "codigo" => "NO_SESSION"]);
    exit;
}

// ── Verificar token contra la BD ────────────────────────
include_once "conexion.php"; // mismo nivel en api/config/

$adminId = (int) $_SESSION['admin_id'];
$stmt = $conn->prepare(
    "SELECT session_token FROM administrador WHERE id_admin = ? LIMIT 1"
);

if ($stmt) {
    $stmt->bind_param("i", $adminId);
    $stmt->execute();
    $adminDB = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$adminDB || $adminDB['session_token'] === null ||
        !hash_equals($adminDB['session_token'], $_SESSION['session_token'])) {
        session_destroy();
        echo json_encode(["logueado" => false, "codigo" => "SESSION_DISPLACED"]);
        exit;
    }
}

// ✅ Sesión válida — actualizar actividad
$_SESSION['last_activity']    = time();
$_SESSION['ultima_actividad'] = time();

echo json_encode([
    "logueado" => true,
    "usuario"  => $_SESSION['usuario'] ?? '',
    "email"    => $_SESSION['email']   ?? ''
]);

$conn->close();
?>