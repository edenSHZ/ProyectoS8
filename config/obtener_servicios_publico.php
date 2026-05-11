<?php
// ============================================================
// Archivo PÚBLICO — va en /config/obtener_servicios_publico.php
// Devuelve los 4 cursos destacados para la página principal
// No requiere sesión de admin
// ============================================================
include "conexion.php";

header("Content-Type: application/json; charset=UTF-8");

// IDs de los cursos destacados para el index
$idsDestacados = [22, 25, 27, 29];
$placeholders  = implode(',', array_fill(0, count($idsDestacados), '?'));

$sql  = "SELECT id_curso, nombre, descripcion, imagen, duracion, horario, requisitos
        FROM curso
        WHERE id_curso IN ($placeholders)
         ORDER BY FIELD(id_curso, 22, 25, 27, 29)"; // mismo orden siempre

$stmt = $conn->prepare($sql);
if (!$stmt) {
    error_log("Error al preparar obtener_servicios_publico: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error al consultar"]);
    exit;
}

// bind dinámico para los 4 IDs
$stmt->bind_param("iiii", ...$idsDestacados);
$stmt->execute();
$result = $stmt->get_result();

$cursos = [];
while ($row = $result->fetch_assoc()) {
    // ✅ Sin htmlspecialchars — datos van en JSON, el escape XSS lo hace el JS
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

echo json_encode($cursos, JSON_UNESCAPED_UNICODE);
$stmt->close();
$conn->close();
?>