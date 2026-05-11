<?php
include "../config/conexion.php";
include "../config/auth_check.php";
include "../config/imagen_helper.php"; // ← agregar

header("Content-Type: application/json");

$tipo     = $_POST['tipo']  ?? '';
$orden    = $_POST['orden'] ?? 1;
$id_admin = (int) $_SESSION['admin_id'];

if (!in_array($tipo, ['carrusel', 'promocion'])) {
    echo json_encode(["status" => "error", "mensaje" => "Tipo inválido"]);
    exit;
}

if ($tipo === 'carrusel') {
    $check = $conn->query("SELECT COUNT(*) as total FROM promocion_galeria WHERE tipo = 'carrusel' AND activo = TRUE");
    $total = $check->fetch_assoc()['total'];
    if ($total >= 4) {
        echo json_encode(["status" => "error", "mensaje" => "Ya tienes 4 imágenes en el carrusel. Elimina una primero."]);
        exit;
    }
}

if ($tipo === 'promocion') {
    $check = $conn->query("SELECT COUNT(*) as total FROM promocion_galeria WHERE tipo = 'promocion' AND activo = TRUE");
    $total = $check->fetch_assoc()['total'];
    if ($total >= 1) {
        echo json_encode(["status" => "error", "mensaje" => "Ya tienes una imagen de promoción. Elimínala primero o usa cambiar."]);
        exit;
    }
}

if (!isset($_FILES['imagen']) || $_FILES['imagen']['error'] !== 0) {
    echo json_encode(["status" => "error", "mensaje" => "No se recibió imagen"]);
    exit;
}

$extensionesPermitidas = ['jpg', 'jpeg', 'png', 'webp'];
$extension = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));

if (!in_array($extension, $extensionesPermitidas)) {
    echo json_encode(["status" => "error", "mensaje" => "Tipo de imagen no permitido"]);
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

$carpeta = "../../uploads/galeria/";
if (!is_dir($carpeta)) mkdir($carpeta, 0755, true);

// ← nombre sin extension, el helper agrega .webp
$nombreBase   = uniqid() . '_' . bin2hex(random_bytes(8));
$imagenNombre = procesarImagen(
    $_FILES['imagen']['tmp_name'],
    $extension,
    $carpeta,
    $nombreBase,
    1400, // carrusel mas ancho
    600,
    85
);

if (!$imagenNombre) {
    echo json_encode(["status" => "error", "mensaje" => "Error al procesar imagen"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO promocion_galeria (id_admin, tipo, imagen, orden, activo) VALUES (?, ?, ?, ?, TRUE)");
$stmt->bind_param("issi", $id_admin, $tipo, $imagenNombre, $orden);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "id" => $conn->insert_id, "imagen" => $imagenNombre]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al guardar"]);
}

$stmt->close();
$conn->close();
?>