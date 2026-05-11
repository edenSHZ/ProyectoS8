<?php
include "../config/conexion.php";
include "../config/auth_check.php";

header("Content-Type: application/json; charset=UTF-8");

//    Sin htmlspecialchars aquí — los datos van en JSON, no en HTML.
//    json_encode() se encarga de escapar correctamente para JSON.
//    El escape XSS se hace en el JavaScript al insertar en el DOM.
$sql    = "SELECT id, titulo, descripcion, fecha, tipo, estado, imagen
            FROM noticia_evento
            ORDER BY fecha DESC";

$result = $conn->query($sql);

if (!$result) {
    // No se expone $conn->error al cliente (evita Information Disclosure)
    error_log("Error al consultar eventos: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error al consultar"]);
    exit;
}

$eventos = [];
while ($row = $result->fetch_assoc()) {
    $eventos[] = [
        "id"          => (int) $row['id'],       // Forzar entero — nunca string inesperado
        "titulo"      => $row['titulo'],
        "descripcion" => $row['descripcion'] ?? '',
        "fecha"       => $row['fecha'],
        "tipo"        => $row['tipo'],
        "estado"      => $row['estado'],
        "imagen"      => $row['imagen'] ?: null,  // null explícito si está vacío
    ];
}

echo json_encode($eventos, JSON_UNESCAPED_UNICODE);
$conn->close();
?>