<?php
// ============================================================
// imagen_helper.php — va en /admin/api/config/
// Comprime, redimensiona y convierte cualquier imagen a WebP
// ============================================================

function procesarImagen(
    string $tmpPath,
    string $extension,
    string $carpeta,
    string $nombreBase,
    int $maxAncho = 1200,
    int $maxAlto  = 900,
    int $calidad  = 80
): string|false {

    // Crear imagen desde el archivo original
    $imgOriginal = match($extension) {
        'jpg', 'jpeg' => imagecreatefromjpeg($tmpPath),
        'png'         => imagecreatefrompng($tmpPath),
        'webp'        => imagecreatefromwebp($tmpPath),
        default       => false
    };

    if (!$imgOriginal) return false;

    $anchoOriginal = imagesx($imgOriginal);
    $altoOriginal  = imagesy($imgOriginal);

    // Calcular nuevas dimensiones manteniendo proporcion
    $ratio      = $anchoOriginal / $altoOriginal;
    $nuevoAncho = $anchoOriginal;
    $nuevoAlto  = $altoOriginal;

    if ($anchoOriginal > $maxAncho) {
        $nuevoAncho = $maxAncho;
        $nuevoAlto  = (int) ($maxAncho / $ratio);
    }

    if ($nuevoAlto > $maxAlto) {
        $nuevoAlto  = $maxAlto;
        $nuevoAncho = (int) ($maxAlto * $ratio);
    }

    // Crear imagen nueva
    $imgNueva = imagecreatetruecolor($nuevoAncho, $nuevoAlto);

    // Preservar transparencia para PNG
    if ($extension === 'png') {
        imagealphablending($imgNueva, false);
        imagesavealpha($imgNueva, true);
        $transparente = imagecolorallocatealpha($imgNueva, 0, 0, 0, 127);
        imagefill($imgNueva, 0, 0, $transparente);
    }

    // Redimensionar con alta calidad
    imagecopyresampled(
        $imgNueva, $imgOriginal,
        0, 0, 0, 0,
        $nuevoAncho, $nuevoAlto,
        $anchoOriginal, $altoOriginal
    );

    // Siempre guardar como WebP
    $nombreFinal = $nombreBase . '.webp';
    $resultado   = imagewebp($imgNueva, $carpeta . $nombreFinal, $calidad);

    imagedestroy($imgOriginal);
    imagedestroy($imgNueva);

    return $resultado ? $nombreFinal : false;
}
?>