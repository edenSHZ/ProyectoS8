<?php
include "../config/conexion.php";
include "../config/auth_check.php";

header("Content-Type: application/json; charset=UTF-8");

// ============ RECEPCIÓN Y VALIDACIÓN ============
$id          = $_POST['id_curso']    ?? null;
$duracion    = trim($_POST['duracion']    ?? '');
$horario     = trim($_POST['horario']     ?? '');
$requisitos  = trim($_POST['requisitos']  ?? '');
$descripcion = trim($_POST['descripcion'] ?? '');

// Validar ID como entero
$id = filter_var($id, FILTER_VALIDATE_INT);
if ($id === false || $id <= 0) {
    echo json_encode(["status" => "error", "mensaje" => "ID inválido"]);
    exit;
}

// Longitudes máximas
if (mb_strlen($duracion)    > 100) { echo json_encode(["status" => "error", "mensaje" => "Duración demasiado larga (máx. 100)"]); exit; }
if (mb_strlen($horario)     > 100) { echo json_encode(["status" => "error", "mensaje" => "Horario demasiado largo (máx. 100)"]); exit; }
if (mb_strlen($requisitos)  > 500) { echo json_encode(["status" => "error", "mensaje" => "Requisitos demasiado largos (máx. 500)"]); exit; }
if (mb_strlen($descripcion) > 2000){ echo json_encode(["status" => "error", "mensaje" => "Descripción demasiado larga (máx. 2000)"]); exit; }

// ============ OBTENER IMAGEN ACTUAL Y VERIFICAR EXISTENCIA ============
$stmtActual = $conn->prepare("SELECT imagen FROM CURSO WHERE id_curso = ?");
if (!$stmtActual) {
    error_log("Error al preparar consulta imagen actual (editar_curso): " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error interno"]);
    exit;
}

$stmtActual->bind_param("i", $id);
$stmtActual->execute();
$actual = $stmtActual->get_result()->fetch_assoc();
$stmtActual->close();

if (!$actual) {
    echo json_encode(["status" => "error", "mensaje" => "Curso no encontrado"]);
    exit;
}

$imagenNombre = $actual['imagen'] ?? null;

// ============ NUEVA IMAGEN ============
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

    $finfo     = finfo_open(FILEINFO_MIME_TYPE);
    $mime_type = finfo_file($finfo, $_FILES['imagen']['tmp_name']);
    finfo_close($finfo);

    $mimesPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!in_array($mime_type, $mimesPermitidos, true)) {
        echo json_encode(["status" => "error", "mensaje" => "El archivo no es una imagen válida"]);
        exit;
    }

    // Eliminar imagen anterior
    if ($imagenNombre) {
        $rutaAnterior = "../../uploads/cursos/" . $imagenNombre;
        if (file_exists($rutaAnterior)) unlink($rutaAnterior);
    }

    $carpeta = "../../uploads/cursos/";
    if (!is_dir($carpeta)) mkdir($carpeta, 0755, true);

    $imagenNombre = uniqid('cur_', true) . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
    if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $carpeta . $imagenNombre)) {
        echo json_encode(["status" => "error", "mensaje" => "Error al guardar la imagen en el servidor"]);
        exit;
    }
}

// ============ ACTUALIZACIÓN ============
$sql  = "UPDATE CURSO SET duracion=?, horario=?, requisitos=?, descripcion=?, imagen=? WHERE id_curso=?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    error_log("Error al preparar editar_curso: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error interno al preparar la consulta"]);
    exit;
}

$stmt->bind_param("sssssi", $duracion, $horario, $requisitos, $descripcion, $imagenNombre, $id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "imagen" => $imagenNombre], JSON_UNESCAPED_UNICODE);
} else {
    error_log("Error al actualizar curso id=$id: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error interno al actualizar el curso"]);
}

$stmt->close();
$conn->close();
?>