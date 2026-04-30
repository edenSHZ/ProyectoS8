<?php
include "../config/auth_check.php";
include "../config/conexion.php";

header("Content-Type: application/json; charset=UTF-8");

// ============ RECEPCIÓN Y VALIDACIÓN DE DATOS ============
$id          = $_POST['id']          ?? null;
$titulo      = trim($_POST['titulo']      ?? '');
$descripcion = trim($_POST['descripcion'] ?? '');
$fecha       = trim($_POST['fecha']       ?? '');
$tipo        = trim($_POST['tipo']        ?? 'evento');
$estado      = trim($_POST['estado']      ?? 'borrador');

// Validar que el ID sea un entero válido
$id = filter_var($id, FILTER_VALIDATE_INT);
if ($id === false || $id <= 0) {
    echo json_encode(["status" => "error", "mensaje" => "ID inválido"]);
    exit;
}

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

// Whitelist estricta con comparación estricta (true)
if (!in_array($tipo, ['noticia', 'evento'], true)) {
    echo json_encode(["status" => "error", "mensaje" => "Tipo inválido"]);
    exit;
}

if (!in_array($estado, ['publicado', 'borrador'], true)) {
    echo json_encode(["status" => "error", "mensaje" => "Estado inválido"]);
    exit;
}

// ============ CONVERSIÓN Y VALIDACIÓN DE FECHA ============
$partes = explode('/', $fecha);
if (count($partes) === 3) {
    $fechaConvertida = $partes[2] . '-' . $partes[1] . '-' . $partes[0];
} else {
    $fechaConvertida = $fecha; // Ya viene en YYYY-MM-DD
}

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

// ============ OBTENER IMAGEN ACTUAL ============
// Se verifica que el evento exista antes de hacer cualquier otra operación
$stmtActual = $conn->prepare("SELECT imagen FROM NOTICIA_EVENTO WHERE id = ?");
if (!$stmtActual) {
    error_log("Error al preparar consulta imagen actual: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error interno"]);
    exit;
}

$stmtActual->bind_param("i", $id);
$stmtActual->execute();
$resultado = $stmtActual->get_result()->fetch_assoc();
$stmtActual->close();

// Si no existe el evento con ese ID, rechazar
if (!$resultado) {
    echo json_encode(["status" => "error", "mensaje" => "Evento no encontrado"]);
    exit;
}

$imagenNombre = $resultado['imagen'] ?? null;

// ============ NUEVA IMAGEN (si viene en el request) ============
if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {

    $extensionesPermitidas = ['jpg', 'jpeg', 'png', 'webp'];
    $extension = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));

    if (!in_array($extension, $extensionesPermitidas, true)) {
        echo json_encode(["status" => "error", "mensaje" => "Tipo de imagen no permitido"]);
        exit;
    }

    if ($_FILES['imagen']['size'] > 2 * 1024 * 1024) {
        echo json_encode(["status" => "error", "mensaje" => "La imagen supera el límite de 2 MB"]);
        exit;
    }

    // Verificar MIME real — no confiar solo en la extensión
    $finfo     = finfo_open(FILEINFO_MIME_TYPE);
    $mime_type = finfo_file($finfo, $_FILES['imagen']['tmp_name']);
    finfo_close($finfo);

    $mimesPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!in_array($mime_type, $mimesPermitidos, true)) {
        echo json_encode(["status" => "error", "mensaje" => "El archivo no es una imagen válida"]);
        exit;
    }

    // Eliminar imagen anterior del servidor antes de subir la nueva
    if ($imagenNombre) {
        $rutaAnterior = "../uploads/eventos/" . $imagenNombre;
        if (file_exists($rutaAnterior)) {
            unlink($rutaAnterior);
        }
    }

    $carpeta = "../uploads/eventos/";
    if (!is_dir($carpeta)) {
        mkdir($carpeta, 0755, true);
    }

    // Nombre generado por el servidor — sin datos del usuario (evita path traversal)
    $imagenNombre = uniqid('evt_', true) . '_' . bin2hex(random_bytes(8)) . '.' . $extension;

    if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $carpeta . $imagenNombre)) {
        echo json_encode(["status" => "error", "mensaje" => "Error al guardar la imagen en el servidor"]);
        exit;
    }
}

// ============ ELIMINAR IMAGEN SI SE SOLICITÓ ============
// Se valida que el valor sea exactamente '1' (comparación estricta)
if (isset($_POST['eliminar_imagen']) && $_POST['eliminar_imagen'] === '1') {
    if ($imagenNombre) {
        $rutaAnterior = "../uploads/eventos/" . $imagenNombre;
        if (file_exists($rutaAnterior)) {
            unlink($rutaAnterior);
        }
    }
    $imagenNombre = null;
}

// ============ ACTUALIZACIÓN EN BASE DE DATOS ============
// Prepared statement con bind_param — inmune a SQL injection
$sql  = "UPDATE NOTICIA_EVENTO SET titulo=?, descripcion=?, fecha=?, tipo=?, estado=?, imagen=? WHERE id=?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    error_log("Error al preparar editar_evento: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error interno al preparar la consulta"]);
    exit;
}

$stmt->bind_param("ssssssi", $titulo, $descripcion, $fecha, $tipo, $estado, $imagenNombre, $id);

if ($stmt->execute()) {
    // Sin htmlspecialchars — los datos van en JSON, el escape XSS lo hace el JS
    echo json_encode([
        "status" => "success",
        "imagen" => $imagenNombre,
    ], JSON_UNESCAPED_UNICODE);
} else {
    // Error real solo al log — no se expone al cliente
    error_log("Error al actualizar evento id=$id: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error interno al actualizar el evento"]);
}

$stmt->close();
$conn->close();
?>