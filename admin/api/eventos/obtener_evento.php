<?php
include "../config/conexion.php";
include "../config/auth_check.php";

header("Content-Type: application/json");

$sql    = "SELECT * FROM NOTICIA_EVENTO ORDER BY fecha DESC";
$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["status" => "error", "mensaje" => "Error al consultar"]);
    exit;
}

$eventos = [];
while ($row = $result->fetch_assoc()) {
    $eventos[] = [
        "id"          => $row['id'],
        "titulo"      => htmlspecialchars($row['titulo'],      ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        "descripcion" => htmlspecialchars($row['descripcion'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        "fecha"       => $row['fecha'],
        "tipo"        => htmlspecialchars($row['tipo'],        ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        "estado"      => htmlspecialchars($row['estado'],      ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        "imagen"      => $row['imagen'] ? htmlspecialchars($row['imagen'], ENT_QUOTES | ENT_HTML5, 'UTF-8') : null,
    ];
}

echo json_encode($eventos);
$conn->close();
?>