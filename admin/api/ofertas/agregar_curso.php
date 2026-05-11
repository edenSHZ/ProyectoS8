<?php
include "../config/conexion.php";
include "../config/auth_check.php";
include "../config/imagen_helper.php"; // ← agregar

header("Content-Type: application/json; charset=UTF-8");

$id_categoria = $_POST['id_categoria'] ?? null;
$nombre       = trim($_POST['nombre']      ?? '');
$duracion     = trim($_POST['duracion']    ?? '');
$horario      = trim($_POST['horario']     ?? '');
$requisitos   = trim($_POST['requisitos']  ?? '');
$descripcion  = trim($_POST['descripcion'] ?? '');
$id_admin     = $_SESSION['admin_id'];

$id_categoria = filter_var($id_categoria, FILTER_VALIDATE_INT);
if ($id_categoria === false || $id_categoria <= 0) {
    echo json_encode(["status" => "error", "mensaje" => "Categoría inválida"]);
    exit;
}

$id_admin = filter_var($id_admin, FILTER_VALIDATE_INT);
if ($id_admin === false || $id_admin <= 0) {
    echo json_encode(["status" => "error", "mensaje" => "Sesión inválida"]);
    exit;
}

if ($nombre === '') {
    echo json_encode(["status" => "error", "mensaje" => "Categoría y nombre son obligatorios"]);
    exit;
}

if (mb_strlen($nombre)      > 150)  { echo json_encode(["status" => "error", "mensaje" => "Nombre demasiado largo (máx. 150)"]); exit; }
if (mb_strlen($duracion)    > 100)  { echo json_encode(["status" => "error", "mensaje" => "Duración demasiado larga (máx. 100)"]); exit; }
if (mb_strlen($horario)     > 100)  { echo json_encode(["status" => "error", "mensaje" => "Horario demasiado largo (máx. 100)"]); exit; }
if (mb_strlen($requisitos)  > 500)  { echo json_encode(["status" => "error", "mensaje" => "Requisitos demasiado largos (máx. 500)"]); exit; }
if (mb_strlen($descripcion) > 2000) { echo json_encode(["status" => "error", "mensaje" => "Descripción demasiado larga (máx. 2000)"]); exit; }

$imagenNombre = null;

if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {

    $extension = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));
    $extensionesPermitidas = ['jpg', 'jpeg', 'png', 'webp'];

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

    $carpeta = "../../uploads/calendarios/";
    if (!is_dir($carpeta)) mkdir($carpeta, 0755, true);

    // ← nombre sin extension, el helper agrega .webp
    $nombreBase   = uniqid('cur_', true) . '_' . bin2hex(random_bytes(8));
    $imagenNombre = procesarImagen(
        $_FILES['imagen']['tmp_name'],
        $extension,
        $carpeta,
        $nombreBase,
        800,
        600,
        80
    );

    if (!$imagenNombre) {
        echo json_encode(["status" => "error", "mensaje" => "Error al procesar imagen"]);
        exit;
    }
}

$sql  = "INSERT INTO curso (id_categoria, id_admin, nombre, duracion, horario, requisitos, descripcion, imagen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    error_log("Error al preparar agregar_curso: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error interno al preparar la consulta"]);
    exit;
}

$stmt->bind_param("iissssss", $id_categoria, $id_admin, $nombre, $duracion, $horario, $requisitos, $descripcion, $imagenNombre);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "id" => $conn->insert_id], JSON_UNESCAPED_UNICODE);
} else {
    error_log("Error al guardar curso: " . $conn->error);
    echo json_encode(["status" => "error", "mensaje" => "Error interno al guardar el curso"]);
}

$stmt->close();
$conn->close();
?>