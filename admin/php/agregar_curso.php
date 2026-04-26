<?php
include "auth_check.php";
include "conexion.php";

header("Content-Type: application/json");

$id_categoria = $_POST['id_categoria'] ?? null;
$nombre       = $_POST['nombre']       ?? '';
$duracion     = $_POST['duracion']     ?? '';
$horario      = $_POST['horario']      ?? '';
$requisitos   = $_POST['requisitos']   ?? '';
$descripcion  = $_POST['descripcion']  ?? '';
$id_admin     = $_SESSION['admin_id'];

if (!$id_categoria || empty($nombre)) {
    echo json_encode(["status" => "error", "mensaje" => "Categoría y nombre son obligatorios"]);
    exit;
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

    $carpeta = "../uploads/cursos/";
    if (!is_dir($carpeta)) mkdir($carpeta, 0755, true);

    $imagenNombre = uniqid() . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
    if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $carpeta . $imagenNombre)) {
        echo json_encode(["status" => "error", "mensaje" => "Error al subir imagen"]);
        exit;
    }
}

$sql  = "INSERT INTO CURSO (id_categoria, id_admin, nombre, duracion, horario, requisitos, descripcion, imagen)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iissssss", $id_categoria, $id_admin, $nombre, $duracion, $horario, $requisitos, $descripcion, $imagenNombre);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "id" => $conn->insert_id]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al guardar: " . $conn->error]);
}

$stmt->close();
$conn->close();
?>