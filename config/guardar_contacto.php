<?php
header("Content-Type: application/json; charset=UTF-8");
include "conexion.php";

// Obtener datos JSON
$data = json_decode(file_get_contents("php://input"), true);

// Obtener y limpiar datos
$nombre   = trim($data['nombre']   ?? '');
$telefono = trim($data['telefono'] ?? '');
$email    = trim($data['email']    ?? '');
$asunto   = trim($data['asunto']   ?? '');
$mensaje  = trim($data['mensaje']  ?? '');

// ==============================
// VALIDACIONES
// ==============================

// Campos obligatorios
if ($nombre === '' || $email === '' || $mensaje === '') {
    echo json_encode(["status" => "error", "mensaje" => "Campos obligatorios vacíos"]);
    exit;
}

// Validar email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "mensaje" => "Correo inválido"]);
    exit;
}

// Validar teléfono (opcional pero si viene debe ser válido)
if ($telefono !== '' && !preg_match('/^[0-9+\-\s]{7,20}$/', $telefono)) {
    echo json_encode(["status" => "error", "mensaje" => "Teléfono inválido"]);
    exit;
}

// ==============================
// LIMITAR LONGITUD (anti abuso)
// ✅ mb_substr en lugar de substr — respeta caracteres UTF-8
//    como á, é, ñ, ü sin cortarlos a la mitad
// ==============================
$nombre   = mb_substr($nombre,   0, 100,  'UTF-8');
$telefono = mb_substr($telefono, 0, 20,   'UTF-8');
$email    = mb_substr($email,    0, 100,  'UTF-8');
$asunto   = mb_substr($asunto,   0, 150,  'UTF-8');
$mensaje  = mb_substr($mensaje,  0, 1000, 'UTF-8');

// ==============================
// CONSULTA SEGURA (ANTI SQLi)
// ==============================
$sql = "INSERT INTO contacto (nombre, email, telefono, asunto, mensaje)
        VALUES (?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    error_log("Error al preparar guardar_contacto: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error en el servidor"]);
    exit;
}

$stmt->bind_param("sssss", $nombre, $email, $telefono, $asunto, $mensaje);

// ==============================
// EJECUCIÓN
// ==============================
if ($stmt->execute()) {
    echo json_encode(["status" => "success", "mensaje" => "Mensaje enviado correctamente"]);
} else {
    //    Error real al log del servidor — no se expone al cliente
    error_log("Error al guardar contacto: " . $stmt->error);
    echo json_encode(["status" => "error", "mensaje" => "Error al guardar el mensaje"]);
}

$stmt->close();
$conn->close();
?>