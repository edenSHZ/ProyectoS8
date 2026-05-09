<?php
include "../config/conexion.php";
include "../config/auth_check.php";

header("Content-Type: application/json; charset=UTF-8");

// SELECT explícito — no usar SELECT * para evitar traer columnas innecesarias
$sql = "SELECT c.id_curso, c.id_categoria, c.nombre, c.descripcion,
                c.imagen, c.duracion, c.horario, c.requisitos,
                cat.nombre AS categoria_nombre
        FROM curso c
        JOIN categoria_curso cat ON c.id_categoria = cat.id_categoria
        WHERE cat.activo = TRUE
        ORDER BY c.id_categoria, c.id_curso";

$result = $conn->query($sql);

if (!$result) {
    error_log("Error al consultar cursos: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error al consultar"]);
    exit;
}

$cursos = [];
while ($row = $result->fetch_assoc()) {
    //    Sin htmlspecialchars — los datos van en JSON, no en HTML.
    //    json_encode() escapa correctamente para JSON.
    //    El escape XSS se hace en el JS al insertar en el DOM con escapeHtml().
    $cursos[] = [
        "id_curso"         => (int) $row['id_curso'],
        "id_categoria"     => (int) $row['id_categoria'],
        "categoria_nombre" => $row['categoria_nombre'],
        "nombre"           => $row['nombre'],
        "descripcion"      => $row['descripcion']  ?? '',
        "imagen"           => $row['imagen']        ?: null,
        "duracion"         => $row['duracion']      ?? '',
        "horario"          => $row['horario']       ?? '',
        "requisitos"       => $row['requisitos']    ?? '',
    ];
}

echo json_encode($cursos, JSON_UNESCAPED_UNICODE);
$conn->close();
?>