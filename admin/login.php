<?php
// ============================================================
// login.php — va en /admin/
// Ruta a conexion: ../api/config/conexion.php
// ============================================================
ini_set('session.use_only_cookies', 1);
ini_set('session.use_trans_sid', 0);

// Configurar cookies seguras ANTES de session_start()
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => false,      // cambiar a true en producción con HTTPS
    'httponly' => true,
    'samesite' => 'Strict'
]);
session_start();

header("Content-Type: application/json; charset=UTF-8");

include "api/config/conexion.php"; // ✅ ruta correcta desde admin/

$data     = json_decode(file_get_contents("php://input"), true);
$email    = trim($data['email']    ?? '');
$password = trim($data['password'] ?? '');

if (empty($email) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "Campos vacíos"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "message" => "Correo inválido"]);
    exit;
}

// ── Control de intentos fallidos ────────────────────────
$_SESSION['intentos'] = $_SESSION['intentos'] ?? 0;
$_SESSION['bloqueo']  = $_SESSION['bloqueo']  ?? 0;

if ($_SESSION['bloqueo'] > time()) {
    $espera = ceil(($_SESSION['bloqueo'] - time()) / 60);
    echo json_encode([
        "status"  => "error",
        "message" => "Demasiados intentos. Espera {$espera} minuto(s)."
    ]);
    exit;
}

// ── Buscar admin en la BD ────────────────────────────────
$stmt = $conn->prepare("SELECT * FROM administrador WHERE email = ? LIMIT 1");
if (!$stmt) {
    error_log("Error al preparar login: " . $conn->error);
    echo json_encode(["status" => "error", "message" => "Error interno"]);
    exit;
}

$stmt->bind_param("s", $email);
$stmt->execute();
$admin = $stmt->get_result()->fetch_assoc();
$stmt->close();

// ── Verificar contraseña ─────────────────────────────────
if (!$admin || !password_verify($password, $admin['password'])) {
    $_SESSION['intentos']++;

    if ($_SESSION['intentos'] >= 5) {
        $_SESSION['bloqueo']  = time() + (15 * 60);
        $_SESSION['intentos'] = 0;
        echo json_encode([
            "status"  => "error",
            "message" => "Demasiados intentos. Cuenta bloqueada 15 minutos."
        ]);
    } else {
        $restantes = 5 - $_SESSION['intentos'];
        echo json_encode([
            "status"  => "error",
            "message" => "Credenciales incorrectas. Intentos restantes: {$restantes}"
        ]);
    }
    exit;
}

// ── Login exitoso ────────────────────────────────────────
$_SESSION['intentos'] = 0;
$_SESSION['bloqueo']  = 0;

// Prevenir session fixation
session_regenerate_id(true);

// ── Generar token único ──────────────────────────────────
$token     = bin2hex(random_bytes(32));
$ip        = $_SERVER['REMOTE_ADDR']     ?? '';
$userAgent = mb_substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255, 'UTF-8');

// ── Guardar token en BD ──────────────────────────────────
$stmtToken = $conn->prepare(
    "UPDATE administrador
     SET session_token  = ?,
         session_fecha  = NOW(),
         session_ip     = ?,
         session_agente = ?
     WHERE id_admin = ?"
);

if (!$stmtToken) {
    error_log("Error al preparar token: " . $conn->error);
    echo json_encode(["status" => "error", "message" => "Error interno"]);
    exit;
}

$stmtToken->bind_param("sssi", $token, $ip, $userAgent, $admin['id_admin']);
$stmtToken->execute();
$stmtToken->close();

// ── Registrar último acceso ──────────────────────────────
$update = $conn->prepare("UPDATE administrador SET ultimo_acceso = NOW() WHERE id_admin = ?");
$update->bind_param("i", $admin['id_admin']);
$update->execute();
$update->close();

// ── Guardar en sesión PHP ────────────────────────────────
$_SESSION['admin_id']         = $admin['id_admin'];
$_SESSION['email']            = $admin['email'];
$_SESSION['usuario']          = $admin['usuario'];
$_SESSION['session_token']    = $token;
$_SESSION['session_ip']       = $ip;
$_SESSION['session_agente']   = $userAgent;
$_SESSION['last_activity']    = time();
$_SESSION['ultima_actividad'] = time();
$_SESSION['absolute_timeout'] = time() + 28800; // 8 horas

echo json_encode(["status" => "success"]);

$conn->close();
?>