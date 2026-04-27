<?php
include "../config/conexion.php";
include "../config/auth_check.php";

header("Content-Type: application/json");

$data        = json_decode(file_get_contents("php://input"), true);
$nombre      = $data['nombre']      ?? '';
$descripcion = $data['descripcion'] ?? '';

if (empty($nombre)) {
    echo json_encode(["status" => "error", "mensaje" => "El nombre es obligatorio"]);
    exit;
}

$nombre      = substr($nombre,      0, 100);
$descripcion = substr($descripcion, 0, 500);

$stmt = $conn->prepare("INSERT INTO CATEGORIA_CURSO (nombre, descripcion, activo) VALUES (?, ?, TRUE)");
$stmt->bind_param("ss", $nombre, $descripcion);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "id" => $conn->insert_id]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al guardar"]);
}

$stmt->close();
$conn->close();
?>