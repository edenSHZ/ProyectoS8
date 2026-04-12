<?php
ini_set('session.use_only_cookies', 1);
ini_set('session.use_trans_sid', 0);

session_start();
header("Content-Type: application/json");

include "conexion.php";

$data     = json_decode(file_get_contents("php://input"), true);
$email    = $data['email']    ?? '';
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "Campos vacíos"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "message" => "Correo inválido"]);
    exit;
}

$sql  = "SELECT * FROM ADMINISTRADOR WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $admin = $result->fetch_assoc();

    if (password_verify($password, $admin['password'])) {

        // Capa 5 - Regenerar ID para prevenir session fixation
        session_regenerate_id(true);

        $_SESSION['admin_id'] = $admin['id_admin'];
        $_SESSION['email']    = $admin['email'];
        $_SESSION['usuario']  = $admin['usuario'];

        // Capa 5 - Timeouts de sesión
        $_SESSION['last_activity']    = time();
        $_SESSION['absolute_timeout'] = time() + 28800; // 8 horas

        $update = $conn->prepare("UPDATE ADMINISTRADOR SET ultimo_acceso = NOW() WHERE id_admin = ?");
        $update->bind_param("i", $admin['id_admin']);
        $update->execute();

        echo json_encode(["status" => "success"]);

    } else {
        echo json_encode(["status" => "error", "message" => "Credenciales incorrectas"]);
    }

} else {
    echo json_encode(["status" => "error", "message" => "Credenciales incorrectas"]);
}

$stmt->close();
$conn->close();
?>