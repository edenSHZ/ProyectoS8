<?php
include "../config/conexion.php";
include "../config/auth_check.php";

header("Content-Type: application/json; charset=UTF-8");

// ============ RECEPCIÓN Y VALIDACIÓN DE DATOS ============
$titulo      = trim($_POST['titulo']      ?? '');
$descripcion = trim($_POST['descripcion'] ?? '');
$fecha       = trim($_POST['fecha']       ?? '');
$tipo        = trim($_POST['tipo']        ?? 'evento');
$estado      = trim($_POST['estado']      ?? 'borrador');

// Campos obligatorios
if ($titulo === '' || $fecha === '') {
    echo json_encode(["status" => "error", "mensaje" => "Campos obligatorios vacíos"]);
    exit;
}

// Longitudes máximas
if (mb_strlen($titulo) > 255) {
    echo json_encode(["status" => "error", "mensaje" => "El título es demasiado largo (máx. 255 caracteres)"]);
    exit;
}

if (mb_strlen($descripcion) > 5000) {
    echo json_encode(["status" => "error", "mensaje" => "La descripción es demasiado larga (máx. 5000 caracteres)"]);
    exit;
}

// Whitelist estricta para tipo y estado
if (!in_array($tipo, ['noticia', 'evento'], true)) {
    echo json_encode(["status" => "error", "mensaje" => "Tipo inválido"]);
    exit;
}

if (!in_array($estado, ['publicado', 'borrador'], true)) {
    echo json_encode(["status" => "error", "mensaje" => "Estado inválido"]);
    exit;
}

// ============ CONVERSIÓN Y VALIDACIÓN DE FECHA ============
// Acepta DD/MM/AAAA y convierte a YYYY-MM-DD
$partes = explode('/', $fecha);
if (count($partes) === 3) {
    $fechaConvertida = $partes[2] . '-' . $partes[1] . '-' . $partes[0];
} else {
    $fechaConvertida = $fecha; // Ya viene en YYYY-MM-DD
}

// Validar que sea una fecha real
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fechaConvertida) ||
    !checkdate(
        (int) substr($fechaConvertida, 5, 2),
        (int) substr($fechaConvertida, 8, 2),
        (int) substr($fechaConvertida, 0, 4)
    )) {
    echo json_encode(["status" => "error", "mensaje" => "Formato de fecha inválido"]);
    exit;
}

$fecha = $fechaConvertida;

// ============ MANEJO DE IMAGEN ============
$imagenNombre = null;

if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {

    $extensionesPermitidas = ['jpg', 'jpeg', 'png', 'webp'];
    $extension = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));

    if (!in_array($extension, $extensionesPermitidas, true)) {
        echo json_encode(["status" => "error", "mensaje" => "Tipo de imagen no permitido"]);
        exit;
    }

    // Límite de 2 MB
    if ($_FILES['imagen']['size'] > 2 * 1024 * 1024) {
        echo json_encode(["status" => "error", "mensaje" => "La imagen supera el límite de 2 MB"]);
        exit;
    }

    // Verificar MIME real del archivo (no confiar solo en la extensión)
    $finfo     = finfo_open(FILEINFO_MIME_TYPE);
    $mime_type = finfo_file($finfo, $_FILES['imagen']['tmp_name']);
    finfo_close($finfo);

    $mimesPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!in_array($mime_type, $mimesPermitidos, true)) {
        echo json_encode(["status" => "error", "mensaje" => "El archivo no es una imagen válida"]);
        exit;
    }

    $carpeta = "../uploads/eventos/";
    if (!is_dir($carpeta)) {
        mkdir($carpeta, 0755, true);
    }

    // Nombre generado por el servidor — sin datos del usuario para evitar path traversal
    $imagenNombre = uniqid('evt_', true) . '_' . bin2hex(random_bytes(8)) . '.' . $extension;

    if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $carpeta . $imagenNombre)) {
        echo json_encode(["status" => "error", "mensaje" => "Error al guardar la imagen en el servidor"]);
        exit;
    }
}

// ============ INSERCIÓN EN BASE DE DATOS ============
// ✅ Prepared statement con bind_param — inmune a SQL injection
$sql  = "INSERT INTO NOTICIA_EVENTO (titulo, descripcion, fecha, tipo, estado, imagen)
         VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    error_log("Error al preparar guardar_evento: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error interno al preparar la consulta"]);
    exit;
}

$stmt->bind_param("ssssss", $titulo, $descripcion, $fecha, $tipo, $estado, $imagenNombre);

if ($stmt->execute()) {
    $nuevoId = $conn->insert_id;

    // ✅ Sin htmlspecialchars en la respuesta JSON —
    //    json_encode() escapa correctamente para JSON.
    //    El escape XSS se realiza en el JS al insertar en el DOM con escapeHtml().
    echo json_encode([
        "status" => "success",
        "id"     => $nuevoId,
        "imagen" => $imagenNombre,
    ], JSON_UNESCAPED_UNICODE);
} else {
    // Error real solo al log — no se expone al cliente
    error_log("Error al guardar evento: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error interno al guardar el evento"]);
}

$stmt->close();
$conn->close();
?>