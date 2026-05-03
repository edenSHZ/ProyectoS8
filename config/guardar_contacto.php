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

// Validar teléfono (opcional pero recomendado)
if ($telefono !== '' && !preg_match('/^[0-9+\-\s]{7,20}$/', $telefono)) {
    echo json_encode(["status" => "error", "mensaje" => "Teléfono inválido"]);
    exit;
}

// ==============================
// LIMITAR LONGITUD (anti abuso)
// ==============================
$nombre   = substr($nombre,   0, 100);
$telefono = substr($telefono, 0, 20);
$email    = substr($email,    0, 100);
$asunto   = substr($asunto,   0, 150);
$mensaje  = substr($mensaje,  0, 1000);

// ==============================
// CONSULTA SEGURA (ANTI SQLi)
// ==============================
$sql = "INSERT INTO CONTACTO (nombre, email, telefono, asunto, mensaje)
        VALUES (?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

if (!$stmt) {
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
    // NO mostrar errores internos al usuario
    echo json_encode(["status" => "error", "mensaje" => "Error al guardar el mensaje"]);
}

// Cerrar conexiones
$stmt->close();
$conn->close();
?>