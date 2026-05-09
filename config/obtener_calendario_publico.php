<?php
include "conexion.php";

header("Content-Type: application/json; charset=UTF-8");

// Obtener el único calendario (porque usas opción A)
$sql = "SELECT archivo FROM evento_calendario LIMIT 1";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();

    echo json_encode([
        "status" => "success",
        "archivo" => $row['archivo']
    ]);
} else {
    echo json_encode([
        "status" => "empty",
        "mensaje" => "No hay calendario disponible"
    ]);
}

$conn->close();
?>