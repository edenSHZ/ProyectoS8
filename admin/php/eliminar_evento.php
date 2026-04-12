<?php
include "auth_check.php";
include "conexion.php";

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id']) || !is_numeric($data['id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "mensaje" => "ID inválido"]);
    exit;
}

$id = (int) $data['id'];

// Obtener imagen para eliminarla del servidor
$stmt = $conn->prepare("SELECT imagen FROM NOTICIA_EVENTO WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if ($row && $row['imagen']) {
    $ruta = "../uploads/eventos/" . $row['imagen'];
    if (file_exists($ruta)) unlink($ruta);
}

$stmt = $conn->prepare("DELETE FROM NOTICIA_EVENTO WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "mensaje" => "Evento no encontrado"]);
    }
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al eliminar"]);
}

$stmt->close();
$conn->close();
?>