<?php
ini_set('session.use_only_cookies', 1);
session_start();
header("Content-Type: application/json");

$inactivity_limit = 1800;  // 30 minutos
$absolute_limit   = 28800; // 8 horas

// Capa 5 - Timeout absoluto
if (isset($_SESSION['absolute_timeout'])) {
    if (time() > $_SESSION['absolute_timeout']) {
        session_unset();
        session_destroy();
        echo json_encode(["logueado" => false, "reason" => "timeout_absolute"]);
        exit;
    }
}

// Capa 5 - Timeout por inactividad
if (isset($_SESSION['last_activity'])) {
    if (time() - $_SESSION['last_activity'] > $inactivity_limit) {
        session_unset();
        session_destroy();
        echo json_encode(["logueado" => false, "reason" => "inactivity"]);
        exit;
    }
}

if (isset($_SESSION['admin_id'])) {
    $_SESSION['last_activity'] = time();
    echo json_encode([
        "logueado" => true,
        "usuario"  => htmlspecialchars($_SESSION['usuario'], ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        "email"    => htmlspecialchars($_SESSION['email'],   ENT_QUOTES | ENT_HTML5, 'UTF-8')
    ]);
} else {
    echo json_encode(["logueado" => false, "reason" => "no_session"]);
}
?>