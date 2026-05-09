<?php
include "../config/conexion.php";
include "../config/auth_check.php";

header("Content-Type: application/json; charset=UTF-8");

// ✅ SELECT explícito — solo las columnas necesarias
$sql    = "SELECT id_categoria, nombre, descripcion
            FROM categoria_curso
            WHERE activo = TRUE
            ORDER BY id_categoria";

$result = $conn->query($sql);

if (!$result) {
    error_log("Error al consultar categorías: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error al consultar"]);
    exit;
}

$categorias = [];
while ($row = $result->fetch_assoc()) {
    // ✅ Sin htmlspecialchars — los datos van en JSON, no en HTML.
    //    json_encode() escapa correctamente para JSON.
    //    El escape XSS se hace en el JS al insertar en el DOM con escapeHtml().
    $categorias[] = [
        "id_categoria" => (int) $row['id_categoria'],
        "nombre"       => $row['nombre'],
        "descripcion"  => $row['descripcion'] ?? '',
    ];
}

echo json_encode($categorias, JSON_UNESCAPED_UNICODE);
$conn->close();
?>