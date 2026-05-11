<?php
include "../config/auth_check.php";
include "../config/conexion.php";
include "../config/imagen_helper.php"; // ← agregar

header("Content-Type: application/json; charset=UTF-8");

$id          = $_POST['id']          ?? null;
$titulo      = trim($_POST['titulo']      ?? '');
$descripcion = trim($_POST['descripcion'] ?? '');
$fecha       = trim($_POST['fecha']       ?? '');
$tipo        = trim($_POST['tipo']        ?? 'evento');
$estado      = trim($_POST['estado']      ?? 'borrador');

$id = filter_var($id, FILTER_VALIDATE_INT);
if ($id === false || $id <= 0) {
    echo json_encode(["status" => "error", "mensaje" => "ID inválido"]);
    exit;
}

if ($titulo === '' || $fecha === '') {
    echo json_encode(["status" => "error", "mensaje" => "Campos obligatorios vacíos"]);
    exit;
}

if (mb_strlen($titulo) > 255) {
    echo json_encode(["status" => "error", "mensaje" => "Título demasiado largo"]);
    exit;
}

if (mb_strlen($descripcion) > 5000) {
    echo json_encode(["status" => "error", "mensaje" => "Descripción demasiado larga"]);
    exit;
}

$tiposPermitidos = ['noticia', 'evento', 'curso', 'convocatoria', 'graduación', 'taller'];
if (!in_array($tipo, $tiposPermitidos, true)) {
    echo json_encode(["status" => "error", "mensaje" => "Tipo inválido"]);
    exit;
}

if (!in_array($estado, ['publicado', 'borrador'], true)) {
    echo json_encode(["status" => "error", "mensaje" => "Estado inválido"]);
    exit;
}

$partes = explode('/', $fecha);
if (count($partes) === 3) {
    $fechaConvertida = $partes[2] . '-' . $partes[1] . '-' . $partes[0];
} else {
    $fechaConvertida = $fecha;
}

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fechaConvertida) ||
    !checkdate(
        (int) substr($fechaConvertida, 5, 2),
        (int) substr($fechaConvertida, 8, 2),
        (int) substr($fechaConvertida, 0, 4)
    )) {
    echo json_encode(["status" => "error", "mensaje" => "Fecha inválida"]);
    exit;
}

$fecha = $fechaConvertida;

$stmtActual = $conn->prepare("SELECT imagen FROM noticia_evento WHERE id = ?");
$stmtActual->bind_param("i", $id);
$stmtActual->execute();
$resultado = $stmtActual->get_result()->fetch_assoc();
$stmtActual->close();

if (!$resultado) {
    echo json_encode(["status" => "error", "mensaje" => "Evento no encontrado"]);
    exit;
}

$imagenNombre = $resultado['imagen'] ?? null;

if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {

    $ext        = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));
    $permitidas = ['jpg', 'jpeg', 'png', 'webp'];

    if (!in_array($ext, $permitidas, true)) {
        echo json_encode(["status" => "error", "mensaje" => "Tipo de imagen no permitido"]);
        exit;
    }

    if ($_FILES['imagen']['size'] > 2 * 1024 * 1024) {
        echo json_encode(["status" => "error", "mensaje" => "Máx 2MB"]);
        exit;
    }

    if ($imagenNombre) {
        $ruta = "../../uploads/eventos/" . $imagenNombre;
        if (file_exists($ruta)) unlink($ruta);
    }

    $carpeta = "../../uploads/eventos/";
    if (!is_dir($carpeta)) mkdir($carpeta, 0755, true);

    // ← nombre sin extension, el helper agrega .webp
    $nombreBase   = uniqid('evt_', true) . '_' . bin2hex(random_bytes(8));
    $imagenNombre = procesarImagen(
        $_FILES['imagen']['tmp_name'],
        $ext,
        $carpeta,
        $nombreBase,
        1200,
        900,
        80
    );

    if (!$imagenNombre) {
        echo json_encode(["status" => "error", "mensaje" => "Error al procesar imagen"]);
        exit;
    }
}

if (isset($_POST['eliminar_imagen']) && $_POST['eliminar_imagen'] === '1') {
    if ($imagenNombre) {
        $ruta = "../../uploads/eventos/" . $imagenNombre;
        if (file_exists($ruta)) unlink($ruta);
    }
    $imagenNombre = null;
}

$sql  = "UPDATE noticia_evento SET titulo=?, descripcion=?, fecha=?, tipo=?, estado=?, imagen=? WHERE id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssssi", $titulo, $descripcion, $fecha, $tipo, $estado, $imagenNombre, $id);

if ($stmt->execute()) {
    echo json_encode([
        "status"  => "success",
        "imagen"  => $imagenNombre,
        "mensaje" => "Evento actualizado correctamente"
    ]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al actualizar: " . $conn->error]);
}

$stmt->close();
$conn->close();
?>