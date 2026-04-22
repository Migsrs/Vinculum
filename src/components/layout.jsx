// src/components/layout.jsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Heart,
  MapPin,
  Home,
  ArrowLeft,
  User,
  LogOut,
  MessageCircle,
} from "lucide-react";

// =================== APP BAR (topo) ===================
export function AppBar({ session, onLogout }) {
  return (
    <div className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Lado esquerdo: localização */}
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-amber-600" />
          <div className="leading-tight">
            <div className="text-xs text-gray-500">Localização</div>
            <div className="flex items-center gap-1 text-sm font-semibold">
              <MapPin className="h-4 w-4" />
              Brasil
            </div>
          </div>
        </div>

        {/* 🔥 REMOVIDO botão Entrar */}
        <UserMenuButton session={session} onLogout={onLogout} />
      </div>
    </div>
  );
}

// =================== MENU DO USUÁRIO ===================
function UserMenuButton({ session, onLogout }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const toggle = () => setOpen((o) => !o);
  const close = () => setOpen(false);

  if (!session) {
    return null;
  }

  const initial =
    session.name?.[0]?.toUpperCase() || session.email[0]?.toUpperCase() || "?";

  const go = (path) => {
    navigate(path);
    close();
  };

  const handleLogout = () => {
    close();
    onLogout?.();
    navigate("/login");
  };

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="flex items-center gap-2 rounded-full bg-gray-100 px-2 py-1 pl-1 pr-3 text-sm hover:bg-gray-200"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm text-white">
          {initial}
        </div>
        <span className="hidden max-w-[120px] truncate font-medium sm:block">
          {session.name || session.email}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-200 bg-white py-2 text-sm shadow-xl">
          <div className="border-b border-gray-100 px-3 pb-2">
            <div className="text-xs text-gray-500">Logado como</div>
            <div className="truncate font-semibold">
              {session.name || session.email}
            </div>
          </div>

          <button
            onClick={() => go("/account")}
            className="flex w-full items-center gap-2 px-3 py-2 hover:bg-gray-50"
          >
            <User className="h-4 w-4" />
            <span>Minha conta</span>
          </button>

          <button
            onClick={() => go("/profile")}
            className="flex w-full items-center gap-2 px-3 py-2 hover:bg-gray-50"
          >
            <User className="h-4 w-4" />
            <span>Editar perfil</span>
          </button>

          <button
            onClick={() => go("/services")}
            className="flex w-full items-center gap-2 px-3 py-2 hover:bg-gray-50"
          >
            <Home className="h-4 w-4" />
            <span>Serviços</span>
          </button>

          <button
            onClick={() => go("/contacts")}
            className="flex w-full items-center gap-2 px-3 py-2 hover:bg-gray-50"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Contato</span>
          </button>

          <div className="mt-1 border-t border-gray-100 pt-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =================== BOTTOM TABS (mobile) ===================
export function BottomTabs({ session }) {
  const loc = useLocation();
  const is = (p) => loc.pathname.startsWith(p);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-5xl grid-cols-3 px-2 py-2 text-xs">
        <TabLink
          to="/"
          label="Início"
          icon={Home}
          active={loc.pathname === "/"}
        />
        <TabLink
          to="/contacts"
          label="Contatos"
          icon={MessageCircle}
          active={is("/contacts")}
        />

        {/* 🔥 sempre vai pra login se não estiver logado */}
        <TabLink
          to={session ? "/account" : "/login"}
          label="Conta"
          icon={User}
          active={is("/account")}
        />
      </div>
    </nav>
  );
}

function TabLink({ to, label, icon: Icon, active }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center rounded-xl px-3 py-1 ${
        active ? "text-amber-600" : "text-gray-600"
      }`}
    >
      <Icon className="h-6 w-6" />
      <span className="mt-1">{label}</span>
    </Link>
  );
}

// =================== BOTÕES FLUTUANTES ===================
function FloatingDesktopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="pointer-events-none fixed left-4 top-1 z-50 hidden gap-3 md:flex md:left-6 md:top-2">
      <button
        type="button"
        onClick={() => navigate("/")}
        className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md shadow-black/5 ring-1 ring-black/5 transition hover:scale-[1.03]"
      >
        <Home className="h-5 w-5 text-amber-600" />
      </button>

      {!isHome && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md shadow-black/5 ring-1 ring-black/5 transition hover:scale-[1.03]"
        >
          <ArrowLeft className="h-5 w-5 text-amber-600" />
        </button>
      )}
    </div>
  );
}

// =================== LAYOUT PRINCIPAL ===================
export function PageLayout({ session, onLogout, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-16 md:pb-0">
      <AppBar session={session} onLogout={onLogout} />
      <FloatingDesktopNav />
      <main>{children}</main>
      <BottomTabs session={session} />

      <footer className="hidden border-t border-gray-200 bg-white md:block">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-amber-600" />
            Vinculum © {new Date().getFullYear()}
          </div>
          <div>
            Este é um MVP de demonstração. Não substitui orientação médica.
          </div>
        </div>
      </footer>
    </div>
  );
}