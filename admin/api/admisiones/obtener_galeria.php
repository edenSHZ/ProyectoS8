<?php
include "../config/conexion.php";
include "../config/auth_check.php";

header("Content-Type: application/json");

$sql    = "SELECT * FROM promocion_galeria WHERE activo = TRUE ORDER BY tipo, orden ASC";
$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["status" => "error", "mensaje" => "Error al consultar"]);
    exit;
}

$galeria = [];
while ($row = $result->fetch_assoc()) {
    $galeria[] = [
        "id"       => (int) $row['id'],
        "tipo"     => $row['tipo'],
        "imagen"   => htmlspecialchars($row['imagen'], ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        "orden"    => (int) $row['orden'],
        "id_admin" => (int) $row['id_admin'],
    ];
}

echo json_encode($galeria);
$conn->close();
?>