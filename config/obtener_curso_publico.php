<?php
// ============================================================
// Archivo PÚBLICO — va en /config/obtener_cursos_publico.php
// No requiere sesión de admin — solo lee cursos y categorías activas
// ============================================================
include "conexion.php";

header("Content-Type: application/json; charset=UTF-8");

// Traer categorías activas con sus cursos en una sola consulta
$sql = "SELECT
            cat.id_categoria,
            cat.nombre      AS categoria_nombre,
            c.id_curso,
            c.nombre        AS curso_nombre,
            c.descripcion,
            c.imagen,
            c.duracion,
            c.horario,
            c.requisitos
        FROM categoria_curso cat
        LEFT JOIN curso c ON c.id_categoria = cat.id_categoria
        WHERE cat.activo = TRUE
        ORDER BY cat.id_categoria, c.id_curso";

$result = $conn->query($sql);

if (!$result) {
    error_log("Error al consultar cursos publicos: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error al consultar"]);
    exit;
}

// Agrupar cursos por categoría
$categorias = [];
while ($row = $result->fetch_assoc()) {
    $idCat = (int) $row['id_categoria'];

    // Crear la categoría si no existe aún
    if (!isset($categorias[$idCat])) {
        $categorias[$idCat] = [
            "id_categoria" => $idCat,
            "nombre"       => $row['categoria_nombre'],
            "cursos"       => []
        ];
    }

    // Solo agregar el curso si tiene id (LEFT JOIN puede traer NULLs si no hay cursos)
    if ($row['id_curso'] !== null) {
        $categorias[$idCat]["cursos"][] = [
            "id_curso"    => (int) $row['id_curso'],
            "nombre"      => $row['curso_nombre'],
            "descripcion" => $row['descripcion'] ?? '',
            "imagen"      => $row['imagen'] ?: null,
            "duracion"    => $row['duracion']    ?? '',
            "horario"     => $row['horario']     ?? '',
            "requisitos"  => $row['requisitos']  ?? '',
        ];
    }
}

// Devolver como array indexado (no objeto con claves numéricas)
echo json_encode(array_values($categorias), JSON_UNESCAPED_UNICODE);
$conn->close();
?>