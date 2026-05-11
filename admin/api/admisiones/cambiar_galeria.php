<?php
include "../config/conexion.php";
include "../config/auth_check.php";
include "../config/imagen_helper.php"; // ← agregar esta linea

header("Content-Type: application/json");

$id       = $_POST['id']    ?? null;
$id_admin = (int) $_SESSION['admin_id'];

if (!$id || !is_numeric($id)) {
    echo json_encode(["status" => "error", "mensaje" => "ID inválido"]);
    exit;
}

if (!isset($_FILES['imagen']) || $_FILES['imagen']['error'] !== 0) {
    echo json_encode(["status" => "error", "mensaje" => "No se recibió imagen"]);
    exit;
}

$extensionesPermitidas = ['jpg', 'jpeg', 'png', 'webp'];
$extension = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));

if (!in_array($extension, $extensionesPermitidas)) {
    echo json_encode(["status" => "error", "mensaje" => "Tipo no permitido"]);
    exit;
}

if ($_FILES['imagen']['size'] > 5 * 1024 * 1024) {
    echo json_encode(["status" => "error", "mensaje" => "Imagen supera 5MB"]);
    exit;
}

$finfo     = finfo_open(FILEINFO_MIME_TYPE);
$mime_type = finfo_file($finfo, $_FILES['imagen']['tmp_name']);
finfo_close($finfo);

$mimesPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
if (!in_array($mime_type, $mimesPermitidos)) {
    echo json_encode(["status" => "error", "mensaje" => "Archivo no es imagen válida"]);
    exit;
}

// Obtener imagen anterior
$stmtActual = $conn->prepare("SELECT imagen FROM promocion_galeria WHERE id = ?");
$stmtActual->bind_param("i", $id);
$stmtActual->execute();
$actual = $stmtActual->get_result()->fetch_assoc();
$stmtActual->close();

if ($actual && $actual['imagen']) {
    $rutaAnterior = "../../uploads/galeria/" . $actual['imagen'];
    if (file_exists($rutaAnterior)) unlink($rutaAnterior);
}

$carpeta = "../../uploads/galeria/";
if (!is_dir($carpeta)) mkdir($carpeta, 0755, true);

// ← nombreBase sin extension, el helper agrega .webp
$nombreBase   = uniqid() . '_' . bin2hex(random_bytes(8));

// ← reemplaza el move_uploaded_file
$imagenNombre = procesarImagen(
    $_FILES['imagen']['tmp_name'],
    $extension,
    $carpeta,
    $nombreBase,
    1200,  // ancho maximo px
    900,   // alto maximo px
    80     // calidad
);

if (!$imagenNombre) {
    echo json_encode(["status" => "error", "mensaje" => "Error al procesar imagen"]);
    exit;
}

$stmt = $conn->prepare("UPDATE promocion_galeria SET imagen = ?, id_admin = ? WHERE id = ?");
$stmt->bind_param("sii", $imagenNombre, $id_admin, $id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "imagen" => $imagenNombre]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al actualizar"]);
}

$stmt->close();
$conn->close();
?>