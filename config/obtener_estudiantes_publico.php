<?php
// ============================================================
// Archivo PÚBLICO — va en /config/obtener_estudiantes_publico.php
// Devuelve la imagen de promoción y los cursos para estudiantes
// No requiere sesión de admin
// ============================================================
include "conexion.php";

header("Content-Type: application/json; charset=UTF-8");

// ── Imagen de promoción ──────────────────────────────────
$sqlPromo = "SELECT imagen
            FROM PROMOCION_GALERIA
            WHERE tipo = 'promocion' AND activo = TRUE
            ORDER BY id DESC
            LIMIT 1";
$resPromo = $conn->query($sqlPromo);
$promo    = $resPromo ? $resPromo->fetch_assoc() : null;

// ── Cursos de Verano (28) y Matemáticas (29) ────────────
$idsCursos = [28, 29];
$sql = "SELECT id_curso, nombre, descripcion, imagen, duracion, horario, requisitos
        FROM CURSO
        WHERE id_curso IN (28, 29)
        ORDER BY FIELD(id_curso, 28, 29)";

$result = $conn->query($sql);
$cursos = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $cursos[] = [
            "id_curso"    => (int) $row['id_curso'],
            "nombre"      => $row['nombre'],
            "descripcion" => $row['descripcion'] ?? '',
            "imagen"      => $row['imagen']      ?: null,
            "duracion"    => $row['duracion']    ?? '',
            "horario"     => $row['horario']     ?? '',
            "requisitos"  => $row['requisitos']  ?? '',
        ];
    }
}

echo json_encode([
    "promocion" => $promo ? $promo['imagen'] : null,
    "cursos"    => $cursos,
], JSON_UNESCAPED_UNICODE);

$conn->close();
?>