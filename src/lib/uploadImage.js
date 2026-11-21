import { supabase } from "./supabase";

const MAX_SIZE = 1600;
const QUALITY = 0.85;

// Reduce la foto a MAX_SIZE px en su lado mayor y la pasa a JPEG, para que el
// catálogo cargue rápido con datos móviles. Si el navegador no puede
// procesarla, se sube el archivo original.
async function resizeImage(file) {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    // Fondo blanco por si la imagen trae transparencia (PNG)
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
    if (!blob || blob.size >= file.size) return { body: file, ext: file.name.split(".").pop() };
    return { body: blob, ext: "jpg" };
  } catch {
    return { body: file, ext: file.name.split(".").pop() };
  }
}

// Borra del bucket las fotos de un producto. Ignora las URLs que no son del
// bucket (por ejemplo fotos viejas servidas desde /public).
export async function deleteProductImages(urls) {
  const marcador = "/product-images/";
  const nombres = urls
    .filter((u) => u && u.includes(marcador))
    .map((u) => decodeURIComponent(u.split(marcador)[1]));
  if (nombres.length === 0) return;
  await supabase.storage.from("product-images").remove(nombres);
}

export async function uploadProductImage(file) {
  const { body, ext } = await resizeImage(file);
  const nombre = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(nombre, body, { contentType: body.type || undefined });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(nombre);
  return data.publicUrl;
}
