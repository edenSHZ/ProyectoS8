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

// Obtener imagen para eliminarla
$stmt = $conn->prepare("SELECT imagen FROM CURSO WHERE id_curso = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if ($row && $row['imagen']) {
    $ruta = "../uploads/cursos/" . $row['imagen'];
    if (file_exists($ruta)) unlink($ruta);
}

$stmt = $conn->prepare("DELETE FROM CURSO WHERE id_curso = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "mensaje" => "Curso no encontrado"]);
    }
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al eliminar"]);
}

$stmt->close();
$conn->close();
?>