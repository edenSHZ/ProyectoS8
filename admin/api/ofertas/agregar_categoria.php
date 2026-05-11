<?php
include "../config/conexion.php";
include "../config/auth_check.php";

header("Content-Type: application/json; charset=UTF-8");

// ============ RECEPCIÓN Y VALIDACIÓN ============
$data        = json_decode(file_get_contents("php://input"), true);
$nombre      = trim($data['nombre']      ?? '');
$descripcion = trim($data['descripcion'] ?? '');

if ($nombre === '') {
    echo json_encode(["status" => "error", "mensaje" => "El nombre es obligatorio"]);
    exit;
}

// Longitudes máximas — con mb_strlen para soporte multibyte (acentos, etc.)
if (mb_strlen($nombre) > 100) {
    echo json_encode(["status" => "error", "mensaje" => "El nombre es demasiado largo (máx. 100 caracteres)"]);
    exit;
}

if (mb_strlen($descripcion) > 500) {
    echo json_encode(["status" => "error", "mensaje" => "La descripción es demasiado larga (máx. 500 caracteres)"]);
    exit;
}

// ============ INSERCIÓN ============
$stmt = $conn->prepare("INSERT INTO categoria_curso (nombre, descripcion, activo) VALUES (?, ?, TRUE)");

if (!$stmt) {
    error_log("Error al preparar agregar_categoria: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error interno al preparar la consulta"]);
    exit;
}

$stmt->bind_param("ss", $nombre, $descripcion);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "id" => $conn->insert_id], JSON_UNESCAPED_UNICODE);
} else {
    error_log("Error al guardar categoría: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error interno al guardar la categoría"]);
}

$stmt->close();
$conn->close();
?>