<?php
include "../config/conexion.php";
include "../config/auth_check.php";

header("Content-Type: application/json");

$sql = "SELECT c.*, cat.nombre as categoria_nombre 
        FROM CURSO c
        JOIN CATEGORIA_CURSO cat ON c.id_categoria = cat.id_categoria
        WHERE cat.activo = TRUE
        ORDER BY c.id_categoria, c.id_curso";

$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["status" => "error", "mensaje" => "Error al consultar"]);
    exit;
}

$cursos = [];
while ($row = $result->fetch_assoc()) {
    $cursos[] = [
        "id_curso"          => (int) $row['id_curso'],
        "id_categoria"      => (int) $row['id_categoria'],
        "categoria_nombre"  => htmlspecialchars($row['categoria_nombre'], ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        "nombre"            => htmlspecialchars($row['nombre'],           ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        "descripcion"       => htmlspecialchars($row['descripcion'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        "imagen"            => $row['imagen'] ? htmlspecialchars($row['imagen'], ENT_QUOTES | ENT_HTML5, 'UTF-8') : null,
        "duracion"          => htmlspecialchars($row['duracion']   ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        "horario"           => htmlspecialchars($row['horario']    ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        "requisitos"        => htmlspecialchars($row['requisitos'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'),
    ];
}

echo json_encode($cursos);
$conn->close();
?>