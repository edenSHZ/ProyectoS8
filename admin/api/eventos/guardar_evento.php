<?php
include "../config/conexion.php";
include "../config/auth_check.php";

header("Content-Type: application/json; charset=UTF-8");

$titulo      = trim($_POST['titulo'] ?? '');
$descripcion = trim($_POST['descripcion'] ?? '');
$fecha       = trim($_POST['fecha'] ?? '');
$tipo        = trim($_POST['tipo'] ?? 'evento');
$estado      = trim($_POST['estado'] ?? 'borrador');
$id_admin    = $_SESSION['admin_id'];

// Validar id_admin
$id_admin = filter_var($id_admin, FILTER_VALIDATE_INT);
if ($id_admin === false || $id_admin <= 0) {
    echo json_encode(["status" => "error", "mensaje" => "Sesión inválida"]);
    exit;
}

if ($titulo === '' || $fecha === '') {
    echo json_encode(["status"=>"error","mensaje"=>"Campos vacíos"]);
    exit;
}

// ✅ TIPOS ACTUALIZADOS
$tiposPermitidos = ['noticia', 'evento', 'curso', 'convocatoria', 'graduación', 'taller'];

if (!in_array($tipo, $tiposPermitidos, true)) {
    echo json_encode(["status"=>"error","mensaje"=>"Tipo inválido"]);
    exit;
}

if (!in_array($estado, ['publicado','borrador'], true)) {
    echo json_encode(["status"=>"error","mensaje"=>"Estado inválido"]);
    exit;
}

// FECHA
$partes = explode('/', $fecha);
if (count($partes) === 3) {
    $fecha = $partes[2].'-'.$partes[1].'-'.$partes[0];
}

// IMAGEN
$imagenNombre = null;

if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
    $ext = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));
    $carpeta = "../../uploads/eventos/";

    if (!is_dir($carpeta)) mkdir($carpeta, 0755, true);

    $imagenNombre = uniqid('evt_', true).'_'.bin2hex(random_bytes(8)).'.'.$ext;

    move_uploaded_file($_FILES['imagen']['tmp_name'], $carpeta.$imagenNombre);
}

// ✅ INSERT con id_admin
$sql = "INSERT INTO NOTICIA_EVENTO (titulo, descripcion, fecha, tipo, estado, imagen, id_admin)
        VALUES (?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssssi", $titulo, $descripcion, $fecha, $tipo, $estado, $imagenNombre, $id_admin);

if ($stmt->execute()) {
    // Obtener el created_at
    $id_nuevo = $conn->insert_id;
    $query = "SELECT created_at FROM NOTICIA_EVENTO WHERE id = ?";
    $stmt2 = $conn->prepare($query);
    $stmt2->bind_param("i", $id_nuevo);
    $stmt2->execute();
    $resultado = $stmt2->get_result();
    $fila = $resultado->fetch_assoc();
    
    echo json_encode([
        "status" => "success",
        "id" => $id_nuevo,
        "id_admin" => $id_admin,
        "imagen" => $imagenNombre,
        "created_at" => $fila['created_at']
    ]);
} else {
    echo json_encode(["status"=>"error", "mensaje"=>$conn->error]);
}

$stmt->close();
$conn->close();
?>