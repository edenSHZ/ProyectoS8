<?php
include "../config/conexion.php";
include "../config/auth_check.php";

header("Content-Type: application/json; charset=UTF-8");

$data = json_decode(file_get_contents("php://input"), true);
$id   = $data['id'] ?? null;

// Validar ID como entero positivo
$id = filter_var($id, FILTER_VALIDATE_INT);
if ($id === false || $id <= 0) {
    echo json_encode(["status" => "error", "mensaje" => "ID inválido"]);
    exit;
}

// Obtener nombre del archivo antes de eliminar
$stmt = $conn->prepare("SELECT archivo FROM EVENTO_CALENDARIO WHERE id_evento = ?");
if (!$stmt) {
    error_log("Error al preparar consulta eliminar_calendario: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error interno"]);
    exit;
}

$stmt->bind_param("i", $id);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$row) {
    echo json_encode(["status" => "error", "mensaje" => "Calendario no encontrado"]);
    exit;
}

// Eliminar archivo físico del servidor
$rutaArchivo = "../../uploads/calendarios/" . $row['archivo'];
if (file_exists($rutaArchivo)) {
    unlink($rutaArchivo);
}

// Eliminar registro de la BD
$stmtDel = $conn->prepare("DELETE FROM EVENTO_CALENDARIO WHERE id_evento = ?");
if (!$stmtDel) {
    error_log("Error al preparar DELETE eliminar_calendario: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error interno al eliminar"]);
    exit;
}

$stmtDel->bind_param("i", $id);

if ($stmtDel->execute()) {
    echo json_encode(["status" => "success"], JSON_UNESCAPED_UNICODE);
} else {
    error_log("Error al eliminar calendario id=$id: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error interno al eliminar"]);
}

$stmtDel->close();
$conn->close();
?>