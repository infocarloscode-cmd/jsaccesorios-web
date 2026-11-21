import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";
import { usernameToEmail } from "../utils/username";

export default function AdminLogin() {
  const { user, login } = useAuth();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await login(usernameToEmail(usuario), password);
    setLoading(false);
    if (error) setError("Usuario o contraseña incorrectos.");
  };

  return (
    <div className="min-h-screen grid place-items-center bg-cream px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <Logo size={80} />
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white border border-gold-200/60 rounded-2xl p-6 flex flex-col gap-4"
        >
          <h1 className="font-serif text-xl text-ink text-center">Panel de administración</h1>

          <div className="flex flex-col gap-1">
            <label htmlFor="usuario" className="text-sm text-ink-soft">Usuario</label>
            <input
              id="usuario"
              type="text"
              required
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="rounded-lg border border-gold-200 px-3 py-2 text-sm focus:outline-none focus:border-gold-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-ink-soft">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-gold-200 px-3 py-2 text-sm focus:outline-none focus:border-gold-400"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-gold-400 hover:bg-gold-500 transition-colors text-white font-medium px-6 py-2.5 text-sm disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
