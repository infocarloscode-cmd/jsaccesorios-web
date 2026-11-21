import { useCallback, useEffect, useState } from "react";
import { KeyRound, Trash2, UserPlus } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { USERNAME_PATTERN } from "../utils/username";

const inputClass =
  "rounded-lg border border-gold-200 px-3 py-2 text-sm focus:outline-none focus:border-gold-400";

function mensajeError(error) {
  if (error?.code === "PGRST202" || /function .* does not exist/i.test(error?.message ?? "")) {
    return "Falta instalar las funciones de cuentas en Supabase (archivo supabase_usuarios.sql).";
  }
  return error?.message ?? "Ocurrió un error.";
}

function fecha(iso) {
  return iso ? new Date(iso).toLocaleDateString("es-VE", { timeZone: "America/Caracas" }) : "nunca";
}

export default function AdminUsers() {
  const { user } = useAuth();
  const [cuentas, setCuentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState(null);
  const [nuevo, setNuevo] = useState({ username: "", password: "", confirmar: "" });
  const [creando, setCreando] = useState(false);
  const [cambiandoId, setCambiandoId] = useState(null);
  const [nuevaClave, setNuevaClave] = useState("");

  const cargar = useCallback(async () => {
    const { data, error } = await supabase.rpc("admin_list_users");
    if (error) setAviso({ tipo: "error", texto: mensajeError(error) });
    else setCuentas(data ?? []);
    setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const usuario = nuevo.username.trim().toLowerCase();
  const usuarioValido = USERNAME_PATTERN.test(usuario);
  const claveValida = nuevo.password.length >= 6;
  const coinciden = nuevo.password === nuevo.confirmar;

  const crear = async () => {
    if (!usuarioValido || !claveValida || !coinciden) return;
    setCreando(true);
    setAviso(null);
    const { error } = await supabase.rpc("admin_create_user", { p_username: usuario, p_password: nuevo.password });
    setCreando(false);
    if (error) return setAviso({ tipo: "error", texto: mensajeError(error) });
    setNuevo({ username: "", password: "", confirmar: "" });
    setAviso({ tipo: "ok", texto: `Cuenta "${usuario}" creada. Ya puede entrar con su usuario y contraseña.` });
    cargar();
  };

  const cambiarClave = async (cuenta) => {
    if (nuevaClave.length < 6) return;
    const { error } = await supabase.rpc("admin_set_password", { p_id: cuenta.id, p_password: nuevaClave });
    if (error) return setAviso({ tipo: "error", texto: mensajeError(error) });
    setCambiandoId(null);
    setNuevaClave("");
    setAviso({ tipo: "ok", texto: `Contraseña de "${cuenta.username}" actualizada.` });
  };

  const borrar = async (cuenta) => {
    if (!confirm(`¿Borrar la cuenta "${cuenta.username}"? Ya no podrá entrar al panel.`)) return;
    const { error } = await supabase.rpc("admin_delete_user", { p_id: cuenta.id });
    if (error) return setAviso({ tipo: "error", texto: mensajeError(error) });
    setAviso({ tipo: "ok", texto: `Cuenta "${cuenta.username}" borrada.` });
    cargar();
  };

  return (
    <section className="flex flex-col gap-4 border-t border-gold-200/60 pt-6">
      <div>
        <h2 className="font-serif text-xl text-ink">Cuentas de administración</h2>
        <p className="text-xs text-ink-soft mt-1">
          Cada persona entra al panel con su propio usuario y contraseña. Todas las cuentas tienen los mismos permisos.
        </p>
      </div>

      {cargando ? (
        <p className="text-sm text-ink-soft">Cargando cuentas...</p>
      ) : (
        cuentas.length > 0 && (
          <ul className="border border-gold-200/60 rounded-xl bg-white divide-y divide-gold-100">
            {cuentas.map((c) => (
              <li key={c.id} className="px-4 py-3 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink break-words">
                      {c.username}
                      {c.id === user?.id && <span className="ml-2 text-[11px] text-gold-600">(tú)</span>}
                    </p>
                    <p className="text-[11px] text-ink-soft">
                      Creada {fecha(c.created_at)} · Último acceso {fecha(c.last_sign_in_at)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCambiandoId(cambiandoId === c.id ? null : c.id);
                      setNuevaClave("");
                    }}
                    className="grid place-items-center w-8 h-8 rounded-full hover:bg-gold-100 text-ink-soft"
                    title="Cambiar contraseña"
                    aria-label={`Cambiar contraseña de ${c.username}`}
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>
                  {c.id !== user?.id && (
                    <button
                      type="button"
                      onClick={() => borrar(c)}
                      className="grid place-items-center w-8 h-8 rounded-full hover:bg-red-50 text-ink-soft hover:text-red-500"
                      title="Borrar cuenta"
                      aria-label={`Borrar cuenta ${c.username}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {cambiandoId === c.id && (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={nuevaClave}
                      onChange={(e) => setNuevaClave(e.target.value)}
                      placeholder="Nueva contraseña (mín. 6)"
                      className={`${inputClass} flex-1 min-w-[180px]`}
                    />
                    <button
                      type="button"
                      onClick={() => cambiarClave(c)}
                      disabled={nuevaClave.length < 6}
                      className="rounded-full bg-gold-400 hover:bg-gold-500 disabled:opacity-50 text-white text-xs font-medium px-4 py-2"
                    >
                      Guardar
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )
      )}

      <div className="border border-gold-200/60 rounded-xl bg-white p-4 flex flex-col gap-3">
        <p className="text-sm font-medium text-ink flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-gold-500" /> Nueva cuenta
        </p>
        <input
          value={nuevo.username}
          onChange={(e) => setNuevo((n) => ({ ...n, username: e.target.value }))}
          placeholder="Usuario (ej. maria)"
          autoCapitalize="none"
          spellCheck={false}
          autoComplete="off"
          className={inputClass}
        />
        {nuevo.username && !usuarioValido && (
          <p className="text-xs text-red-600 -mt-2">
            De 3 a 30 caracteres: letras sin acento, números, punto, guion o guion bajo. Sin espacios.
          </p>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            type="password"
            autoComplete="new-password"
            value={nuevo.password}
            onChange={(e) => setNuevo((n) => ({ ...n, password: e.target.value }))}
            placeholder="Contraseña (mín. 6)"
            className={inputClass}
          />
          <input
            type="password"
            autoComplete="new-password"
            value={nuevo.confirmar}
            onChange={(e) => setNuevo((n) => ({ ...n, confirmar: e.target.value }))}
            placeholder="Repetir contraseña"
            className={inputClass}
          />
        </div>
        {nuevo.confirmar && !coinciden && <p className="text-xs text-red-600 -mt-2">Las contraseñas no coinciden.</p>}
        <button
          type="button"
          onClick={crear}
          disabled={creando || !usuarioValido || !claveValida || !coinciden}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-400 hover:bg-gold-500 disabled:opacity-50 transition-colors text-white font-medium px-5 py-2.5 text-sm w-fit"
        >
          <UserPlus className="w-4 h-4" />
          {creando ? "Creando..." : "Crear cuenta"}
        </button>
      </div>

      {aviso && (
        <p
          className={`text-sm rounded-lg px-3 py-2 ${
            aviso.tipo === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
          }`}
        >
          {aviso.texto}
        </p>
      )}
    </section>
  );
}
