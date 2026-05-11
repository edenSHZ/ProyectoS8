<?php
// ============================================================
// Archivo PÚBLICO — va en /config/obtener_noticia_detalle_publico.php
// Devuelve una sola noticia por ID para la página de detalle
// No requiere sesión de admin
// ============================================================
include "conexion.php";

header("Content-Type: application/json; charset=UTF-8");

$id = $_GET['id'] ?? null;

// Validar que el ID sea un entero positivo
$id = filter_var($id, FILTER_VALIDATE_INT);
if ($id === false || $id <= 0) {
    echo json_encode(["status" => "error", "mensaje" => "ID inválido"]);
    exit;
}

$sql  = "SELECT id, titulo, descripcion, fecha, tipo, imagen
        FROM noticia_evento
        WHERE id = ? AND estado = 'publicado'";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    error_log("Error al preparar obtener_noticia_detalle: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error interno"]);
    exit;
}

$stmt->bind_param("i", $id);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$row) {
    echo json_encode(["status" => "error", "mensaje" => "Noticia no encontrada"]);
    exit;
}

// ✅ Sin htmlspecialchars — datos van en JSON, el escape XSS lo hace el JS
echo json_encode([
    "status"      => "success",
    "id"          => (int) $row['id'],
    "titulo"      => $row['titulo'],
    "descripcion" => $row['descripcion'] ?? '',
    "fecha"       => $row['fecha'],
    "tipo"        => $row['tipo'],
    "imagen"      => $row['imagen'] ?: null,
], JSON_UNESCAPED_UNICODE);

$conn->close();
?>