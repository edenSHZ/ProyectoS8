<?php
include "../config/conexion.php";
include "../config/auth_check.php";

header("Content-Type: application/json; charset=UTF-8");

// ============ VALIDAR SESIÓN ============
if (!isset($_SESSION['admin_id'])) {
    echo json_encode([
        "status" => "error",
        "mensaje" => "No autorizado"
    ]);
    exit;
}

$id_admin = $_SESSION['admin_id'];


// ============ VALIDAR ARCHIVO RECIBIDO ============
if (!isset($_FILES['archivo']) || $_FILES['archivo']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["status" => "error", "mensaje" => "No se recibió archivo"]);
    exit;
}

// Validar que realmente es un upload
if (!is_uploaded_file($_FILES['archivo']['tmp_name'])) {
    echo json_encode(["status" => "error", "mensaje" => "Archivo inválido"]);
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

// ============ ELIMINAR PDF ANTERIOR (OPCIÓN A) ============
$result = $conn->query("SELECT archivo FROM evento_calendario LIMIT 1");

if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $archivoAnterior = $row['archivo'];

    $rutaAnterior = $carpeta . $archivoAnterior;

    if (file_exists($rutaAnterior)) {
        unlink($rutaAnterior); // elimina archivo físico
    }

    // eliminar registros anteriores
    $conn->query("DELETE FROM evento_calendario");
}

// ============ NOMBRE SEGURO ============
$nombreOriginal = basename($_FILES['archivo']['name']);
$nombreSeguro = uniqid('cal_', true) . '_' . bin2hex(random_bytes(8)) . '.pdf';

// ============ MOVER ARCHIVO ============
if (!move_uploaded_file($_FILES['archivo']['tmp_name'], $carpeta . $nombreSeguro)) {
    echo json_encode(["status" => "error", "mensaje" => "Error al guardar el archivo en el servidor"]);
    exit;
}

// ============ INSERTAR EN BASE DE DATOS ============
$sql  = "INSERT INTO evento_calendario (archivo, tipo_archivo, id_admin) VALUES (?, 'pdf', ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    error_log("Error al preparar guardar_calendario: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error interno al preparar la consulta"]);
    exit;
}

$stmt->bind_param("si", $nombreSeguro, $id_admin);

if ($stmt->execute()) {
    echo json_encode([
        "status"  => "success",
        "id"      => $conn->insert_id,
        "archivo" => $nombreSeguro,
        "nombre"  => $nombreOriginal,
    ], JSON_UNESCAPED_UNICODE);
} else {
    error_log("Error al guardar calendario: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error interno al guardar el calendario"]);
}

$stmt->close();
$conn->close();
?>