const FALLBACK_IMAGE = '/images/image-fallback.png';

// Sustituye una imagen externa que no pudo descargarse por el recurso local precargado.
export function handleImageError(event) {
  const image = event.currentTarget;

  // Solo oculta la etiqueta si también falla la propia imagen local de respaldo.
  if (image.src.endsWith(FALLBACK_IMAGE)) {
    image.style.visibility = 'hidden';
    return;
  }

  image.style.visibility = 'visible';
  image.src = FALLBACK_IMAGE;
}
