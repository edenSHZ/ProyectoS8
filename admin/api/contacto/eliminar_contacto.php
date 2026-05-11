<?php
include "../config/conexion.php";
include "../config/auth_check.php";

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id']) || !is_numeric($data['id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "mensaje" => "ID inválido"]);
    exit;
}

$id = (int) $data['id'];

$stmt = $conn->prepare("DELETE FROM CONTACTO WHERE id_contacto = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "mensaje" => "Mensaje no encontrado"]);
    }
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al eliminar"]);
}

$stmt->close();
$conn->close();
?>