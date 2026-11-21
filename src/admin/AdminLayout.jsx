import { Navigate, Outlet, Link } from "react-router-dom";
import { LogOut, Settings, Store } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-ink-soft">Cargando...</div>;
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-10 bg-white border-b border-gold-200/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3">
            <Logo size={36} />
            <span className="font-serif text-lg text-ink">Admin</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link
              to="/admin/configuracion"
              className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configuración</span>
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink"
            >
              <Store className="w-4 h-4" />
              Ver tienda
            </a>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
