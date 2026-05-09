<?php
// ============================================================
// Archivo PÚBLICO — va en /config/buscar_publico.php
// Busca en cursos, categorías y noticias/eventos publicados
// No requiere sesión de admin
// ============================================================
include "conexion.php";

header("Content-Type: application/json; charset=UTF-8");

$q = trim($_GET['q'] ?? '');

// Validar que la búsqueda tenga al menos 2 caracteres
if (mb_strlen($q, 'UTF-8') < 2) {
    echo json_encode(["status" => "error", "mensaje" => "Búsqueda muy corta"]);
    exit;
}

// Limitar longitud máxima para evitar abuso
if (mb_strlen($q, 'UTF-8') > 100) {
    echo json_encode(["status" => "error", "mensaje" => "Búsqueda demasiado larga"]);
    exit;
}

$termino = '%' . $q . '%';
$resultados = [];

// ── 1. Buscar en CURSOS ──────────────────────────────────
$sqlCursos = "SELECT
                c.id_curso,
                c.nombre,
                c.descripcion,
                c.imagen,
                cat.id_categoria,
                cat.nombre AS categoria_nombre
              FROM curso c
              JOIN categoria_curso cat ON c.id_categoria = cat.id_categoria
              WHERE cat.activo = TRUE
                AND (
                    c.nombre      LIKE ? OR
                    c.descripcion LIKE ? OR
                    c.duracion    LIKE ? OR
                    c.horario     LIKE ? OR
                    c.requisitos  LIKE ?
                )
              ORDER BY c.nombre
              LIMIT 8";

$stmtCursos = $conn->prepare($sqlCursos);
if ($stmtCursos) {
    $stmtCursos->bind_param("sssss", $termino, $termino, $termino, $termino, $termino);
    $stmtCursos->execute();
    $resCursos = $stmtCursos->get_result();
    while ($row = $resCursos->fetch_assoc()) {
        $resultados[] = [
            "tipo"              => "curso",
            "id"                => (int) $row['id_curso'],
            "titulo"            => $row['nombre'],
            "subtitulo"         => $row['categoria_nombre'],
            "descripcion"       => mb_substr($row['descripcion'] ?? '', 0, 80, 'UTF-8'),
            "id_categoria"      => (int) $row['id_categoria'],
            "categoria_nombre"  => $row['categoria_nombre'],
        ];
    }
    $stmtCursos->close();
}

// ── 2. Buscar en CATEGORÍAS ──────────────────────────────
$sqlCats = "SELECT id_categoria, nombre, descripcion
            FROM categoria_curso
            WHERE activo = TRUE
            AND (nombre LIKE ? OR descripcion LIKE ?)
            ORDER BY nombre
            LIMIT 4";

$stmtCats = $conn->prepare($sqlCats);
if ($stmtCats) {
    $stmtCats->bind_param("ss", $termino, $termino);
    $stmtCats->execute();
    $resCats = $stmtCats->get_result();
    while ($row = $resCats->fetch_assoc()) {
        $resultados[] = [
            "tipo"             => "categoria",
            "id"               => (int) $row['id_categoria'],
            "titulo"           => $row['nombre'],
            "subtitulo"        => "Categoría de cursos",
            "descripcion"      => mb_substr($row['descripcion'] ?? '', 0, 80, 'UTF-8'),
            "id_categoria"     => (int) $row['id_categoria'],
            "categoria_nombre" => $row['nombre'],
        ];
    }
    $stmtCats->close();
}

// ── 3. Buscar en NOTICIAS y EVENTOS publicados ───────────
$sqlNoticias = "SELECT id, titulo, descripcion, tipo, fecha
                FROM noticia_evento
                WHERE estado = 'publicado'
                AND (titulo LIKE ? OR descripcion LIKE ?)
                ORDER BY fecha DESC
                LIMIT 5";

$stmtNoticias = $conn->prepare($sqlNoticias);
if ($stmtNoticias) {
    $stmtNoticias->bind_param("ss", $termino, $termino);
    $stmtNoticias->execute();
    $resNoticias = $stmtNoticias->get_result();
    while ($row = $resNoticias->fetch_assoc()) {
        $resultados[] = [
            "tipo"        => "noticia",
            "id"          => (int) $row['id'],
            "titulo"      => $row['titulo'],
            "subtitulo"   => ucfirst($row['tipo']),
            "descripcion" => mb_substr($row['descripcion'] ?? '', 0, 80, 'UTF-8'),
        ];
    }
    $stmtNoticias->close();
}

echo json_encode([
    "status"     => "success",
    "resultados" => $resultados,
    "total"      => count($resultados),
], JSON_UNESCAPED_UNICODE);

$conn->close();
?>