<?php
include "../config/conexion.php";
include "../config/auth_check.php";

header("Content-Type: application/json; charset=UTF-8");

$sql = "SELECT id_evento, archivo, created_at
        FROM EVENTO_CALENDARIO
        WHERE tipo_archivo = 'pdf'
        ORDER BY created_at DESC";

$result = $conn->query($sql);

if (!$result) {
    error_log("Error al consultar calendarios: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error al consultar"]);
    exit;
}

$calendarios = [];
while ($row = $result->fetch_assoc()) {
    // ✅ Sin htmlspecialchars — datos van en JSON, el escape XSS lo hace el JS
    $calendarios[] = [
        "id"         => (int) $row['id_evento'],
        "archivo"    => $row['archivo'],
        "created_at" => $row['created_at'],
    ];
}

echo json_encode($calendarios, JSON_UNESCAPED_UNICODE);
$conn->close();
?>