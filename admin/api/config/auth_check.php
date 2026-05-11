<?php
// ============================================================
// auth_check.php — va en /admin/config/
// Ruta a conexion: ../../api/config/conexion.php
// Incluir al inicio de TODOS los PHP del panel admin
// ============================================================

ini_set('session.use_only_cookies', 1);
ini_set('session.use_trans_sid', 0);

session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => false,      // cambiar a true en producción con HTTPS
    'httponly' => true,
    'samesite' => 'Strict'
]);
session_start();

// ── 1. Verificar que exista sesión activa ────────────────
if (!isset($_SESSION['admin_id']) || !isset($_SESSION['session_token'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "mensaje" => "No autorizado", "codigo" => "NO_SESSION"]);
    exit;
}

$adminId     = (int) $_SESSION['admin_id'];
$tokenSesion = $_SESSION['session_token'];
$ipSesion    = $_SESSION['session_ip'] ?? '';

// ── 2. Timeout absoluto (8 horas) ───────────────────────
if (isset($_SESSION['absolute_timeout']) && time() > $_SESSION['absolute_timeout']) {
    session_unset();
    session_destroy();
    http_response_code(401);
    echo json_encode(["status" => "error", "mensaje" => "Sesión expirada", "codigo" => "SESSION_EXPIRED"]);
    exit;
}

// ── 3. Timeout por inactividad (30 minutos) ──────────────
$ultimaActividad = $_SESSION['ultima_actividad'] ?? $_SESSION['last_activity'] ?? 0;
if (time() - $ultimaActividad > 1800) {
    session_unset();
    session_destroy();
    http_response_code(401);
    echo json_encode(["status" => "error", "mensaje" => "Sesión expirada por inactividad", "codigo" => "SESSION_EXPIRED"]);
    exit;
}

// Actualizar última actividad
$_SESSION['ultima_actividad'] = time();
$_SESSION['last_activity']    = time();

// ── 4. Capa extra — verificar IP ─────────────────────────
$ipActual = $_SERVER['REMOTE_ADDR'] ?? '';
if ($ipSesion !== '' && $ipActual !== $ipSesion) {
    session_destroy();
    http_response_code(401);
    echo json_encode(["status" => "error", "mensaje" => "IP de sesión no coincide", "codigo" => "SESSION_IP_MISMATCH"]);
    exit;
}

// ── 5. Verificar token contra la BD ─────────────────────
include_once "conexion.php";

$stmt = $conn->prepare(
    "SELECT session_token FROM administrador WHERE id_admin = ? LIMIT 1"
);

if (!$stmt) {
    error_log("Error al preparar auth_check: " . $conn->error);
    http_response_code(500);
    echo json_encode(["status" => "error", "mensaje" => "Error interno"]);
    exit;
}

$stmt->bind_param("i", $adminId);
$stmt->execute();
$adminDB = $stmt->get_result()->fetch_assoc();
$stmt->close();

// Si no existe el admin o no tiene token
if (!$adminDB || $adminDB['session_token'] === null) {
    session_destroy();
    http_response_code(401);
    echo json_encode(["status" => "error", "mensaje" => "Sesión no válida", "codigo" => "SESSION_INVALID"]);
    exit;
}

// ── 6. Comparar token — detecta sesión desplazada ────────
if (!hash_equals($adminDB['session_token'], $tokenSesion)) {
    session_destroy();
    http_response_code(401);
    echo json_encode(["status" => "error", "mensaje" => "Tu sesión fue iniciada en otro dispositivo", "codigo" => "SESSION_DISPLACED"]);
    exit;
}

// ✅ Sesión válida — $conn disponible para el resto del archivo
?>