<?php
include "../config/conexion.php";
include "../config/auth_check.php";

header("Content-Type: application/json");

$sql    = "SELECT * FROM contacto ORDER BY created_at DESC";
$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["status" => "error", "mensaje" => "Error al consultar"]);
    exit;
}

$mensajes = [];
while ($row = $result->fetch_assoc()) {
    $mensajes[] = [
        "id_contacto" => (int) $row['id_contacto'],
        "nombre"      => htmlspecialchars($row['nombre'],   ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        "email"       => htmlspecialchars($row['email'],    ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        "telefono"    => htmlspecialchars($row['telefono'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        "asunto"      => htmlspecialchars($row['asunto']   ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        "mensaje"     => htmlspecialchars($row['mensaje'],  ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        "leido"       => (bool) $row['leido'],
        "created_at"  => $row['created_at']
    ];
}

echo json_encode($mensajes);
$conn->close();
?>