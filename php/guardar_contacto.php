<?php
header("Content-Type: application/json");
include "conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

$nombre   = $data['nombre']   ?? '';
$telefono = $data['telefono'] ?? '';
$email    = $data['email']    ?? '';
$asunto   = $data['asunto']   ?? '';
$mensaje  = $data['mensaje']  ?? '';

// Validaciones
if (empty($nombre) || empty($email) || empty($mensaje)) {
    echo json_encode(["status" => "error", "mensaje" => "Campos obligatorios vacíos"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "mensaje" => "Correo inválido"]);
    exit;
}

// Sanitizar longitudes
$nombre   = substr($nombre,   0, 100);
$telefono = substr($telefono, 0, 20);
$asunto   = substr($asunto,   0, 150);

$sql  = "INSERT INTO CONTACTO (nombre, email, telefono, asunto, mensaje)
        VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sssss", $nombre, $email, $telefono, $asunto, $mensaje);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "mensaje" => "Mensaje enviado correctamente"]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al guardar: " . $conn->error]);
}

$stmt->close();
$conn->close();
?>