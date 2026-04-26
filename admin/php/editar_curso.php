<?php
include "auth_check.php";
include "conexion.php";

header("Content-Type: application/json");

$id          = $_POST['id_curso']    ?? null;
$duracion    = $_POST['duracion']    ?? '';
$horario     = $_POST['horario']     ?? '';
$requisitos  = $_POST['requisitos']  ?? '';
$descripcion = $_POST['descripcion'] ?? '';

if (!$id || !is_numeric($id)) {
    echo json_encode(["status" => "error", "mensaje" => "ID inválido"]);
    exit;
}

// Obtener imagen actual
$stmtActual = $conn->prepare("SELECT imagen FROM CURSO WHERE id_curso = ?");
$stmtActual->bind_param("i", $id);
$stmtActual->execute();
$actual       = $stmtActual->get_result()->fetch_assoc();
$imagenNombre = $actual['imagen'] ?? null;
$stmtActual->close();

// Nueva imagen si viene
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

    if ($imagenNombre) {
        $rutaAnterior = "../uploads/cursos/" . $imagenNombre;
        if (file_exists($rutaAnterior)) unlink($rutaAnterior);
    }

    $carpeta = "../uploads/cursos/";
    if (!is_dir($carpeta)) mkdir($carpeta, 0755, true);

    $imagenNombre = uniqid() . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
    if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $carpeta . $imagenNombre)) {
        echo json_encode(["status" => "error", "mensaje" => "Error al subir imagen"]);
        exit;
    }
}

$sql  = "UPDATE CURSO SET duracion=?, horario=?, requisitos=?, descripcion=?, imagen=? WHERE id_curso=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sssssi", $duracion, $horario, $requisitos, $descripcion, $imagenNombre, $id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "imagen" => $imagenNombre]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al actualizar: " . $conn->error]);
}

$stmt->close();
$conn->close();
?>