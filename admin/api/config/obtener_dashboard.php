<?php
include "auth_check.php";
include "conexion.php";

header("Content-Type: application/json");

// Total mensajes
$totalMensajes = 0;
$resMensajes = $conn->query("SELECT COUNT(*) as total FROM CONTACTO");
if ($resMensajes) {
    $totalMensajes = (int) $resMensajes->fetch_assoc()['total'];
}

// Total noticias/eventos publicados
$totalPublicados = 0;
$resPublicados = $conn->query("SELECT COUNT(*) as total FROM NOTICIA_EVENTO WHERE estado = 'publicado'");
if ($resPublicados) {
    $totalPublicados = (int) $resPublicados->fetch_assoc()['total'];
}

// Últimas 5 noticias/eventos
$ultimosEventos = [];
$resEventos = $conn->query("SELECT id, titulo, fecha, estado FROM NOTICIA_EVENTO ORDER BY created_at DESC LIMIT 5");
if ($resEventos) {
    while ($row = $resEventos->fetch_assoc()) {
        $ultimosEventos[] = [
            "id"     => (int) $row['id'],
            "titulo" => htmlspecialchars($row['titulo'], ENT_QUOTES | ENT_HTML5, 'UTF-8'),
            "fecha"  => $row['fecha'],
            "estado" => htmlspecialchars($row['estado'], ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        ];
    }
}

// Últimos 5 mensajes
$ultimosMensajes = [];
$resMsgs = $conn->query("SELECT nombre, telefono, email, asunto, mensaje FROM CONTACTO ORDER BY created_at DESC LIMIT 5");
if ($resMsgs) {
    while ($row = $resMsgs->fetch_assoc()) {
        $ultimosMensajes[] = [
            "nombre"   => htmlspecialchars($row['nombre'],   ENT_QUOTES | ENT_HTML5, 'UTF-8'),
            "telefono" => htmlspecialchars($row['telefono'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'),
            "email"    => htmlspecialchars($row['email'],    ENT_QUOTES | ENT_HTML5, 'UTF-8'),
            "asunto"   => htmlspecialchars($row['asunto']   ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'),
            "mensaje"  => htmlspecialchars($row['mensaje'],  ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        ];
    }
}

echo json_encode([
    "totalMensajes"   => $totalMensajes,
    "totalPublicados" => $totalPublicados,
    "eventos"         => $ultimosEventos,
    "mensajes"        => $ultimosMensajes
]);

$conn->close();
?>