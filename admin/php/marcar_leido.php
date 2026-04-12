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

$stmt = $conn->prepare("UPDATE CONTACTO SET leido = TRUE WHERE id_contacto = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al actualizar"]);
}

$stmt->close();
$conn->close();
?>