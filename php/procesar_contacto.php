<?php


// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_NAME', 'base_de_datos');     // Cambiar por el nombre real de la BD
define('DB_USER', 'root');           // Me imagino que el usuario es root sino lo es, entonces se cambiaria
define('DB_PASS', '');        // Pues no creo que exista una contraseña pero si la hay entonces se agregara
define('DB_CHARSET', 'utf8mb4');

/*
// Configuración de correo (opcional - para notificaciones)
define('ADMIN_EMAIL', 'contacto@institutofrances.edu.mx');
define('SITE_NAME', 'Instituto Francés de Ciencias');
*/

// Establecer headers de seguridad
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Verificar que la petición sea POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarRespuesta(false, 'Método no permitido');
    exit;
}

// Verificar token CSRF (opcional pero recomendado) lo dejare por si acaso si ya lo agregaste tu la función de verificar sesión lo puedes 
// eliminar eden
session_start();
if (!isset($_POST['csrf_token']) || !isset($_SESSION['csrf_token']) || 
    $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
    enviarRespuesta(false, 'Token de seguridad inválido');
    exit;
}

// Limpiar token usado
unset($_SESSION['csrf_token']);

// Obtener y sanitizar datos del formulario
$nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
$telefono = isset($_POST['telefono']) ? trim($_POST['telefono']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$asunto = isset($_POST['asunto']) ? trim($_POST['asunto']) : '';
$mensaje = isset($_POST['mensaje']) ? trim($_POST['mensaje']) : '';

// Validaciones del lado del servidor
$errores = [];

// Validar nombre
if (empty($nombre)) {
    $errores['nombre'] = 'El nombre es obligatorio';
} elseif (strlen($nombre) < 3) {
    $errores['nombre'] = 'El nombre debe tener al menos 3 caracteres';
} elseif (strlen($nombre) > 100) {
    $errores['nombre'] = 'El nombre no puede exceder los 100 caracteres';
} elseif (!preg_match('/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.\-]+$/', $nombre)) {
    $errores['nombre'] = 'El nombre contiene caracteres no permitidos';
}

// Validar teléfono (opcional pero con formato)
if (!empty($telefono)) {
    // Eliminar caracteres no numéricos para validación flexible
    $telefonoLimpio = preg_replace('/[^0-9+]/', '', $telefono);
    if (strlen($telefonoLimpio) < 10 || strlen($telefonoLimpio) > 15) {
        $errores['telefono'] = 'El teléfono debe tener entre 10 y 15 dígitos';
    }
}

// Validar email
if (empty($email)) {
    $errores['email'] = 'El correo electrónico es obligatorio';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errores['email'] = 'El correo electrónico no es válido';
} elseif (strlen($email) > 100) {
    $errores['email'] = 'El correo no puede exceder los 100 caracteres';
}

// Validar asunto
if (empty($asunto)) {
    $errores['asunto'] = 'El asunto es obligatorio';
} elseif (strlen($asunto) < 3) {
    $errores['asunto'] = 'El asunto debe tener al menos 3 caracteres';
} elseif (strlen($asunto) > 150) {
    $errores['asunto'] = 'El asunto no puede exceder los 150 caracteres';
}

// Validar mensaje
if (empty($mensaje)) {
    $errores['mensaje'] = 'El mensaje es obligatorio';
} elseif (strlen($mensaje) < 10) {
    $errores['mensaje'] = 'El mensaje debe tener al menos 10 caracteres';
}

// Si hay errores, devolverlos
if (!empty($errores)) {
    enviarRespuesta(false, 'Por favor corrige los errores del formulario', ['errores' => $errores]);
    exit;
}

// Conectar a la base de datos
try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false, // Usar prepared statements nativos
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
    ]);
} catch (PDOException $e) {
    error_log('Error de conexión a BD: ' . $e->getMessage());
    enviarRespuesta(false, 'Error de conexión. Por favor intenta más tarde.');
    exit;
}

// Guardar en la base de datos usando consulta parametrizada (protección contra SQL Injection)
try {
    $sql = "INSERT INTO CONTACTO (nombre, email, telefono, asunto, mensaje, leido, created_at) 
            VALUES (:nombre, :email, :telefono, :asunto, :mensaje, FALSE, NOW())";
    
    $stmt = $pdo->prepare($sql);
    
    // Ejecutar con parámetros (PDO escapa automáticamente)
    $resultado = $stmt->execute([
        ':nombre' => $nombre,
        ':email' => $email,
        ':telefono' => $telefono ?: null,
        ':asunto' => $asunto,
        ':mensaje' => $mensaje
    ]);
    
    $id_contacto = $pdo->lastInsertId();
    
} catch (PDOException $e) {
    error_log('Error al insertar contacto: ' . $e->getMessage());
    enviarRespuesta(false, 'Error al guardar el mensaje. Por favor intenta más tarde.');
    exit;
}

/*
// Opcional: Enviar notificación por correo al administrador
$correoEnviado = enviarCorreoNotificacion($nombre, $email, $telefono, $asunto, $mensaje);

// Preparar respuesta exitosa
$respuestaData = [
    'id_contacto' => $id_contacto,
    'mensaje_guardado' => true,
    'correo_enviado' => $correoEnviado
];

enviarRespuesta(true, '¡Gracias por contactarnos! Tu mensaje ha sido enviado correctamente. Te responderemos a la brevedad.', $respuestaData);
*/
/**
 * Envía una notificación por correo al administrador
 * 
 * @param string $nombre Nombre del remitente
 * @param string $email Email del remitente
 * @param string $telefono Teléfono del remitente
 * @param string $asunto Asunto del mensaje
 * @param string $mensaje Contenido del mensaje
 * @return bool True si el correo se envió correctamente
 */

/*
function enviarCorreoNotificacion($nombre, $email, $telefono, $asunto, $mensaje) {
    // Escapar datos para el correo (protección XSS en el contenido del email)
    $nombreSeguro = htmlspecialchars($nombre, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $emailSeguro = htmlspecialchars($email, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $telefonoSeguro = htmlspecialchars($telefono, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $asuntoSeguro = htmlspecialchars($asunto, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $mensajeSeguro = nl2br(htmlspecialchars($mensaje, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    
    $to = ADMIN_EMAIL;
    $subject = "[" . SITE_NAME . "] Nuevo mensaje de contacto: " . $asuntoSeguro;
    
    // Headers del correo
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: " . SITE_NAME . " <" . ADMIN_EMAIL . ">" . "\r\n";
    $headers .= "Reply-To: " . $emailSeguro . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    // Cuerpo del correo en HTML
    $message = "
    <html>
    <head>
        <title>Nuevo mensaje de contacto</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1E4D8F; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .field { margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            .field strong { color: #1E4D8F; display: inline-block; width: 100px; }
            .message-box { background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #DA1212; margin-top: 10px; }
            .footer { text-align: center; padding: 15px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>Nuevo mensaje de contacto</h2>
            </div>
            <div class='content'>
                <div class='field'><strong>Nombre:</strong> {$nombreSeguro}</div>
                <div class='field'><strong>Email:</strong> {$emailSeguro}</div>
                <div class='field'><strong>Teléfono:</strong> " . ($telefonoSeguro ?: 'No proporcionado') . "</div>
                <div class='field'><strong>Asunto:</strong> {$asuntoSeguro}</div>
                <div class='field'><strong>Mensaje:</strong></div>
                <div class='message-box'>{$mensajeSeguro}</div>
            </div>
            <div class='footer'>
                <p>Este mensaje fue enviado desde el formulario de contacto de " . SITE_NAME . "</p>
                <p>Fecha: " . date('d/m/Y H:i:s') . "</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Intentar enviar el correo
    return mail($to, $subject, $message, $headers);
}
*/

/**
 * Envía una respuesta JSON al cliente
 * 
 * @param bool $success Indica si la operación fue exitosa
 * @param string $message Mensaje para el usuario
 * @param array $data Datos adicionales (opcional)
 */

function enviarRespuesta($success, $message, $data = []) {
    $respuesta = [
        'success' => $success,
        'message' => $message
    ];
    
    if (!empty($data)) {
        $respuesta['data'] = $data;
    }
    
    echo json_encode($respuesta);
    exit;
}
?>