<?php
include "../config/conexion.php";
include "../config/auth_check.php";

header("Content-Type: application/json");

if (!isset($_FILES['archivo']) || $_FILES['archivo']['error'] !== 0) {
    echo json_encode(["status" => "error", "mensaje" => "No se recibió archivo"]);
    exit;
}

if ($_FILES['archivo']['size'] > 10 * 1024 * 1024) {
    echo json_encode(["status" => "error", "mensaje" => "El PDF supera 10MB"]);
    exit;
}

$finfo     = finfo_open(FILEINFO_MIME_TYPE);
$mime_type = finfo_file($finfo, $_FILES['archivo']['tmp_name']);
finfo_close($finfo);

if ($mime_type !== 'application/pdf') {
    echo json_encode(["status" => "error", "mensaje" => "Solo se permiten archivos PDF"]);
    exit;
}

$carpeta = "../uploads/calendarios/";
if (!is_dir($carpeta)) mkdir($carpeta, 0755, true);

$nombreOriginal = basename($_FILES['archivo']['name']);
$nombreSeguro   = uniqid() . '_' . bin2hex(random_bytes(8)) . '.pdf';

if (!move_uploaded_file($_FILES['archivo']['tmp_name'], $carpeta . $nombreSeguro)) {
    echo json_encode(["status" => "error", "mensaje" => "Error al subir PDF"]);
    exit;
}

$sql  = "INSERT INTO EVENTO_CALENDARIO (archivo, tipo_archivo) VALUES (?, 'pdf')";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $nombreSeguro);

if ($stmt->execute()) {
    echo json_encode([
        "status"   => "success",
        "id"       => $conn->insert_id,
        "archivo"  => $nombreSeguro,
        "nombre"   => $nombreOriginal
    ]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al guardar en BD"]);
}

$stmt->close();
$conn->close();
?>