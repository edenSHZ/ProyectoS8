<?php
include "../config/conexion.php";
include "../config/auth_check.php";

header("Content-Type: application/json");

$sql    = "SELECT * FROM CATEGORIA_CURSO WHERE activo = TRUE ORDER BY id_categoria";
$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["status" => "error", "mensaje" => "Error al consultar"]);
    exit;
}

$categorias = [];
while ($row = $result->fetch_assoc()) {
    $categorias[] = [
        "id_categoria" => (int) $row['id_categoria'],
        "nombre"       => htmlspecialchars($row['nombre'],      ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        "descripcion"  => htmlspecialchars($row['descripcion'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'),
    ];
}

echo json_encode($categorias);
$conn->close();
?>