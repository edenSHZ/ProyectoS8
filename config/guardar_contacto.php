<?php
header("Content-Type: application/json; charset=UTF-8");
include "conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

$nombre   = trim($data['nombre']   ?? '');
$telefono = trim($data['telefono'] ?? '');
$email    = trim($data['email']    ?? '');
$asunto   = trim($data['asunto']   ?? '');
$mensaje  = trim($data['mensaje']  ?? '');

// ==============================
// VALIDACIONES
// ==============================

if ($nombre === '' || $email === '' || $mensaje === '') {
    echo json_encode(["status" => "error", "mensaje" => "Campos obligatorios vacíos"]);
    exit;
}

// Nombre — solo letras, espacios y acentos, sin números ni especiales
if (!preg_match('/^[\p{L}\s]+$/u', $nombre)) {
    echo json_encode(["status" => "error", "mensaje" => "El nombre solo puede contener letras y espacios"]);
    exit;
}

// Email — solo minúsculas, sin mayúsculas ni caracteres raros
// Primero convertir a minúsculas por si acaso
$email = mb_strtolower($email, 'UTF-8');

// Validar formato estricto: letras minúsculas, números, puntos, guiones y @
if (!preg_match('/^[a-z0-9._\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/', $email)) {
    echo json_encode(["status" => "error", "mensaje" => "Correo inválido. Solo se permiten letras minúsculas, números y los caracteres . _ -"]);
    exit;
}

// Validacion adicional de PHP
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "mensaje" => "Correo inválido"]);
    exit;
}

// Telefono — exactamente entre 7 y 15 dígitos, puede incluir + al inicio y espacios
if ($telefono !== '') {
    // Eliminar espacios para contar solo dígitos
    $telefonoLimpio = preg_replace('/[\s\-]/', '', $telefono);

    if (!preg_match('/^\+?[0-9]{7,15}$/', $telefonoLimpio)) {
        echo json_encode(["status" => "error", "mensaje" => "Teléfono inválido. Solo dígitos, máximo 15"]);
        exit;
    }
}

// Asunto y mensaje — sin etiquetas HTML ni scripts
$asunto  = strip_tags($asunto);
$mensaje = strip_tags($mensaje);

// ==============================
// LIMITAR LONGITUD
// ==============================
$nombre   = mb_substr($nombre,   0, 100,  'UTF-8');
$telefono = mb_substr($telefono, 0, 20,   'UTF-8');
$email    = mb_substr($email,    0, 100,  'UTF-8');
$asunto   = mb_substr($asunto,   0, 150,  'UTF-8');
$mensaje  = mb_substr($mensaje,  0, 1000, 'UTF-8');

// ==============================
// CONSULTA SEGURA
// ==============================
$sql  = "INSERT INTO contacto (nombre, email, telefono, asunto, mensaje) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    error_log("Error al preparar guardar_contacto: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error en el servidor"]);
    exit;
}

$stmt->bind_param("sssss", $nombre, $email, $telefono, $asunto, $mensaje);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "mensaje" => "Mensaje enviado correctamente"]);
} else {
    error_log("Error al guardar contacto: " . $stmt->error);
    echo json_encode(["status" => "error", "mensaje" => "Error al guardar el mensaje"]);
}

$stmt->close();
$conn->close();
?>