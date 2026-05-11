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

// Verificar si tiene cursos
$check = $conn->prepare("SELECT COUNT(*) as total FROM CURSO WHERE id_categoria = ?");
$check->bind_param("i", $id);
$check->execute();
$total = $check->get_result()->fetch_assoc()['total'];
$check->close();

if ($total > 0) {
    echo json_encode(["status" => "error", "mensaje" => "No se puede eliminar, la categoría tiene $total curso(s). Elimínalos primero."]);
    exit;
}

$stmt = $conn->prepare("DELETE FROM CATEGORIA_CURSO WHERE id_categoria = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al eliminar"]);
}

$stmt->close();
$conn->close();
?>