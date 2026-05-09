<?php
// ============================================================
// Archivo PÚBLICO — va en /config/obtener_galeria_publica.php
// No requiere sesión de admin — solo lee imágenes activas
// ============================================================
include "conexion.php"; // mismo nivel que este archivo

header("Content-Type: application/json; charset=UTF-8");

// Solo columnas necesarias — sin id_admin (dato interno)
$sql = "SELECT id, tipo, imagen, orden
        FROM promocion_galeria
        WHERE activo = TRUE
        ORDER BY tipo, orden ASC";

$result = $conn->query($sql);

if (!$result) {
    error_log("Error al consultar galeria publica: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error al consultar"]);
    exit;
}

$galeria = [];
while ($row = $result->fetch_assoc()) {
    //    Sin htmlspecialchars — datos van en JSON
    //    json_encode() escapa para JSON, el escape XSS lo hace el JS
    $galeria[] = [
        "id"    => (int) $row['id'],
        "tipo"  => $row['tipo'],
        "imagen"=> $row['imagen'],
        "orden" => (int) $row['orden'],
    ];
}

echo json_encode($galeria, JSON_UNESCAPED_UNICODE);
$conn->close();
?>