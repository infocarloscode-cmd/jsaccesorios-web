// Usa el menú nativo de compartir si existe (móviles); si no, copia el texto.
export async function shareOrCopy({ title, text, url }, showToast, copiedMessage) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
    } catch {
      // La clienta canceló el diálogo: no hay nada que hacer.
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(text ? `${text} ${url}` : url);
    showToast(copiedMessage);
  } catch {
    showToast("No se pudo copiar el enlace");
  }
}
