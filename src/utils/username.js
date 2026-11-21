// Supabase identifica a cada cuenta por correo. Para entrar con un usuario
// simple, cada usuario "maria" se guarda internamente como
// "maria@usuarios.jsaccesorios.app" (ese correo no existe ni recibe mensajes).
export const USER_DOMAIN = "usuarios.jsaccesorios.app";

export function usernameToEmail(username) {
  const u = username.trim().toLowerCase();
  // Las cuentas antiguas con correo real siguen funcionando.
  return u.includes("@") ? u : `${u}@${USER_DOMAIN}`;
}

export function emailToUsername(email = "") {
  const suffix = `@${USER_DOMAIN}`;
  return email.endsWith(suffix) ? email.slice(0, -suffix.length) : email;
}

export const USERNAME_PATTERN = /^[a-z0-9._-]{3,30}$/;
