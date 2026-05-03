<?php
include "../config/conexion.php";
include "../config/auth_check.php";

header("Content-Type: application/json; charset=UTF-8");

// ============ VALIDAR ARCHIVO RECIBIDO ============
if (!isset($_FILES['archivo']) || $_FILES['archivo']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["status" => "error", "mensaje" => "No se recibió archivo"]);
    exit;
}

// ============ VALIDAR TAMAÑO (máx. 10MB) ============
if ($_FILES['archivo']['size'] > 10 * 1024 * 1024) {
    echo json_encode(["status" => "error", "mensaje" => "El PDF supera el límite de 10 MB"]);
    exit;
}

// ============ VALIDAR EXTENSIÓN ============
$extension = strtolower(pathinfo($_FILES['archivo']['name'], PATHINFO_EXTENSION));
if ($extension !== 'pdf') {
    echo json_encode(["status" => "error", "mensaje" => "Solo se permiten archivos PDF"]);
    exit;
}

// ============ VALIDAR MIME REAL ============
// Verifica los bytes internos del archivo — no confía solo en la extensión
$finfo     = finfo_open(FILEINFO_MIME_TYPE);
$mime_type = finfo_file($finfo, $_FILES['archivo']['tmp_name']);
finfo_close($finfo);

if ($mime_type !== 'application/pdf') {
    echo json_encode(["status" => "error", "mensaje" => "El archivo no es un PDF válido"]);
    exit;
}

// ============ PREPARAR CARPETA ============
$carpeta = "../../uploads/calendarios/";
if (!is_dir($carpeta)) {
    mkdir($carpeta, 0755, true);
}

// ============ NOMBRE SEGURO ============
// Nombre original solo para devolverlo en la respuesta — nunca se usa en rutas
$nombreOriginal = basename($_FILES['archivo']['name']);

// Nombre generado por el servidor — sin datos del usuario (evita path traversal)
$nombreSeguro = uniqid('cal_', true) . '_' . bin2hex(random_bytes(8)) . '.pdf';

if (!move_uploaded_file($_FILES['archivo']['tmp_name'], $carpeta . $nombreSeguro)) {
    echo json_encode(["status" => "error", "mensaje" => "Error al guardar el archivo en el servidor"]);
    exit;
}

// ============ INSERCIÓN EN BASE DE DATOS ============
// ✅ Prepared statement con bind_param — inmune a SQL injection
$sql  = "INSERT INTO EVENTO_CALENDARIO (archivo, tipo_archivo) VALUES (?, 'pdf')";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    error_log("Error al preparar guardar_calendario: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error interno al preparar la consulta"]);
    exit;
}

$stmt->bind_param("s", $nombreSeguro);

if ($stmt->execute()) {
    // ✅ Sin htmlspecialchars — los datos van en JSON, no en HTML
    //    json_encode() escapa correctamente para JSON
    echo json_encode([
        "status"  => "success",
        "id"      => $conn->insert_id,
        "archivo" => $nombreSeguro,
        "nombre"  => $nombreOriginal,
    ], JSON_UNESCAPED_UNICODE);
} else {
    // Error real solo al log — no se expone al cliente
    error_log("Error al guardar calendario: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error interno al guardar el calendario"]);
}

$stmt->close();
$conn->close();
?>