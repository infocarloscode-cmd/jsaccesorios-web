// Logo real de la marca (medallón físico de la clienta), recortado y
// aislado de la foto original -- sin recrear ni alterar el diseño.
export default function Logo({ size = 96, className = "" }) {
  return (
    <img
      src="/logo.png"
      alt="Logo Accesorios Johaysi Salazar"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
