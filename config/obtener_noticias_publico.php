<?php
// ============================================================
// Archivo PÚBLICO — va en /config/obtener_noticias_publico.php
// Devuelve todos los eventos/noticias publicados
// No requiere sesión de admin
// ============================================================
include "conexion.php";

header("Content-Type: application/json; charset=UTF-8");

$sql = "SELECT id, titulo, descripcion, fecha, tipo, imagen
        FROM NOTICIA_EVENTO
        WHERE estado = 'publicado'
        ORDER BY fecha DESC";

$result = $conn->query($sql);

if (!$result) {
    error_log("Error al consultar noticias publicas: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error al consultar"]);
    exit;
}

$noticias = [];
while ($row = $result->fetch_assoc()) {
    // ✅ Sin htmlspecialchars — datos van en JSON, el escape XSS lo hace el JS
    $noticias[] = [
        "id"          => (int) $row['id'],
        "titulo"      => $row['titulo'],
        "descripcion" => $row['descripcion'] ?? '',
        "fecha"       => $row['fecha'],
        "tipo"        => $row['tipo'],
        "imagen"      => $row['imagen'] ?: null,
    ];
}

echo json_encode($noticias, JSON_UNESCAPED_UNICODE);
$conn->close();
?>