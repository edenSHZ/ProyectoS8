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

$id       = (int) $data['id'];
$id_admin = (int) $_SESSION['admin_id']; // tomamos el admin de la sesión

$stmt = $conn->prepare("UPDATE CONTACTO SET leido = TRUE, id_admin = ? WHERE id_contacto = ?");
$stmt->bind_param("ii", $id_admin, $id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al actualizar"]);
}

$stmt->close();
$conn->close();
?>