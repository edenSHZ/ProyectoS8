<?php
include "../config/conexion.php";
include "../config/auth_check.php";

header("Content-Type: application/json");

$titulo      = $_POST['titulo']      ?? '';
$descripcion = $_POST['descripcion'] ?? '';
$fecha       = $_POST['fecha']       ?? '';
$tipo        = $_POST['tipo']        ?? 'evento';
$estado      = $_POST['estado']      ?? 'borrador';

if (empty($titulo) || empty($fecha)) {
    echo json_encode(["status" => "error", "mensaje" => "Campos obligatorios vacíos"]);
    exit;
}

if (!in_array($tipo, ['noticia', 'evento'])) {
    echo json_encode(["status" => "error", "mensaje" => "Tipo inválido"]);
    exit;
}

if (!in_array($estado, ['publicado', 'borrador'])) {
    echo json_encode(["status" => "error", "mensaje" => "Estado inválido"]);
    exit;
}

// Convertir fecha DD/MM/AAAA → YYYY-MM-DD
$partes = explode('/', $fecha);
if (count($partes) === 3) {
    $fecha = $partes[2] . '-' . $partes[1] . '-' . $partes[0];
}

// IMAGEN
$imagenNombre = null;
if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === 0) {

    $extensionesPermitidas = ['jpg', 'jpeg', 'png', 'webp'];
    $extension = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));

    if (!in_array($extension, $extensionesPermitidas)) {
        echo json_encode(["status" => "error", "mensaje" => "Tipo de imagen no permitido"]);
        exit;
    }

    if ($_FILES['imagen']['size'] > 2 * 1024 * 1024) {
        echo json_encode(["status" => "error", "mensaje" => "Imagen supera 2MB"]);
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

    $carpeta = "../uploads/eventos/";
    if (!is_dir($carpeta)) mkdir($carpeta, 0755, true);

    $imagenNombre = uniqid() . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
    if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $carpeta . $imagenNombre)) {
        echo json_encode(["status" => "error", "mensaje" => "Error al subir imagen"]);
        exit;
    }
}

$sql  = "INSERT INTO NOTICIA_EVENTO (titulo, descripcion, fecha, tipo, estado, imagen)
        VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssss", $titulo, $descripcion, $fecha, $tipo, $estado, $imagenNombre);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "id" => $conn->insert_id, "imagen" => $imagenNombre]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al guardar: " . $conn->error]);
}

$stmt->close();
$conn->close();
?>