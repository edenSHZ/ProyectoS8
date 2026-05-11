<?php
include "../config/conexion.php";
include "../config/auth_check.php";
include "../config/imagen_helper.php"; // ← agregar

header("Content-Type: application/json; charset=UTF-8");

$titulo      = trim($_POST['titulo']      ?? '');
$descripcion = trim($_POST['descripcion'] ?? '');
$fecha       = trim($_POST['fecha']       ?? '');
$tipo        = trim($_POST['tipo']        ?? 'evento');
$estado      = trim($_POST['estado']      ?? 'borrador');
$id_admin    = $_SESSION['admin_id'];

$id_admin = filter_var($id_admin, FILTER_VALIDATE_INT);
if ($id_admin === false || $id_admin <= 0) {
    echo json_encode(["status" => "error", "mensaje" => "Sesión inválida"]);
    exit;
}

if ($titulo === '' || $fecha === '') {
    echo json_encode(["status" => "error", "mensaje" => "Campos vacíos"]);
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
    $fecha = $partes[2] . '-' . $partes[1] . '-' . $partes[0];
}

$imagenNombre = null;

if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
    $ext     = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));
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

$sql  = "INSERT INTO noticia_evento (titulo, descripcion, fecha, tipo, estado, imagen, id_admin) VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssssi", $titulo, $descripcion, $fecha, $tipo, $estado, $imagenNombre, $id_admin);

if ($stmt->execute()) {
    $id_nuevo = $conn->insert_id;
    $stmt2    = $conn->prepare("SELECT created_at FROM noticia_evento WHERE id = ?");
    $stmt2->bind_param("i", $id_nuevo);
    $stmt2->execute();
    $fila = $stmt2->get_result()->fetch_assoc();

    echo json_encode([
        "status"     => "success",
        "id"         => $id_nuevo,
        "id_admin"   => $id_admin,
        "imagen"     => $imagenNombre,
        "created_at" => $fila['created_at']
    ]);
} else {
    echo json_encode(["status" => "error", "mensaje" => $conn->error]);
}

$stmt->close();
$conn->close();
?>