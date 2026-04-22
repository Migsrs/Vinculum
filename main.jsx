import "./index.css";
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Plus,
  LogIn,
  Search,
  Heart,
  Phone,
  Mail,
  MapPin,
  Shield,
  BadgeCheck,
  Home,
  User,
  MessageCircle,
  Star,
  ExternalLink,
  Image as ImageIcon,
  Trash2,
  ArrowLeft,
  Pencil,
} from "lucide-react";

/* =================== Home Page =================== */
function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-0 md:pb-8">
      <HeroSection />
      <div className="mt-6 md:mt-8">
        <PromoCarousel />
        <QuickTiles />
      </div>
    </div>
  );
}

/*
  Vinculum — MVP marketplace para contratação de assistentes geriátricos
  Visual mobile-first e amigável
*/

// =================== Utilidades LocalStorage ===================
const LS_KEYS = {
  users: "vinculum_users",
  session: "vinculum_session",
  services: "vinculum_services",
  contacts: "vinculum_contacts",
};

function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// -------- Helpers de usuário (perfil) --------
function getUsers() {
  return readLS(LS_KEYS.users, []);
}
function setUsers(arr) {
  writeLS(LS_KEYS.users, arr);
}
function getUserByEmail(email) {
  return getUsers().find((u) => u.email === email) || null;
}
function slugify(text = "") {
  const base = (text || "").toString().toLowerCase().trim();
  if (!base) return "";
  return base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
function userSlug(u) {
  if (!u) return "";
  const name = u.name || u.email?.split("@")[0] || "usuario";
  return slugify(`${name}`);
}
function getUserBySlug(slug) {
  const list = getUsers();
  return list.find((u) => userSlug(u) === slug) || null;
}
function upsertUser(updated) {
  const list = getUsers();
  const idx = list.findIndex((u) => u.email === updated.email);
  if (idx === -1) list.push(updated);
  else list[idx] = { ...list[idx], ...updated };
  setUsers(list);
}
function calcAge(yyyy_mm_dd) {
  if (!yyyy_mm_dd) return "";
  const dob = new Date(yyyy_mm_dd);
  if (isNaN(dob)) return "";
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

// =================== Seeds (Geriatria) ===================
const seedServices = [
  {
    id: crypto.randomUUID(),
    title: "Acompanhamento Geriátrico Domiciliar",
    description:
      "Auxílio na rotina do idoso: medicação, alimentação, mobilidade, prevenção de quedas e orientação à família.",
    hourlyPrice: 110,
    remote: false,
    location: "São Paulo - SP",
    tags: ["Domicílio", "Cuidados", "Prevenção de quedas"],
    ownerEmail: "ana@nurse.com",
    ownerName: "Ana Souza",
    rating: 4.9,
    cover:
      "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: crypto.randomUUID(),
    title: "Teleassistência Geriátrica",
    description:
      "Monitoramento remoto de sinais vitais, lembretes de medicação e orientação a cuidadores.",
    hourlyPrice: 80,
    remote: true,
    location: "Remoto",
    tags: ["Teleassistência", "Medicação", "Acompanhamento"],
    ownerEmail: "carlos@onco.com",
    ownerName: "Carlos Ferreira",
    rating: 4.7,
    cover:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1200&auto=format&fit=crop",
  },
];

// =================== Sessão ===================
function useSession() {
  const [session, setSession] = useState(() => readLS(LS_KEYS.session, null));
  const save = (s) => {
    setSession(s);
    writeLS(LS_KEYS.session, s);
  };
  const logout = () => save(null);
  return { session, save, logout };
}

// =================== UI Básica ===================
function Button({ as: As = "button", className = "", children, ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 shadow-sm transition hover:shadow-md active:scale-[.99] disabled:opacity-60 bg-amber-600 text-white";
  return (
    <As className={`${base} ${className}`} {...props}>
      {children}
    </As>
  );
}
function GhostButton({
  as: As = "button",
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center gap-2 rounded-2xl px-3 py-2 transition hover:bg-gray-100 text-gray-800";
  return (
    <As className={`${base} ${className}`} {...props}>
      {children}
    </As>
  );
}
function Input({ className = "", ...props }) {
  const base =
    "w-full rounded-full border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/20";
  return <input className={`${base} ${className}`} {...props} />;
}
function Textarea({ className = "", ...props }) {
  const base =
    "w-full rounded-2xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/20 min-h-[120px]";
  return <textarea className={`${base} ${className}`} {...props} />;
}
function Card({ className = "", children }) {
  return (
    <div
      className={`rounded-3xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

// =================== Profile Menu (com animação) ===================
function ProfileMenu({ session, onLogout }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const u = getUserByEmail(session?.email);

  const handleLogout = () => {
    onLogout?.();
    localStorage.removeItem("vinculum_session");
    navigate("/login");
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-menu")) setOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const isProvider = (u?.role || session?.role) === "provider";

  return (
    <div className="relative profile-menu">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-2xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
      >
        {u?.avatar ? (
          <img
            src={u.avatar}
            alt="avatar"
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <User className="h-4 w-4 text-amber-600" />
        )}
        {session?.name?.split(" ")[0] || session?.email}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-60 rounded-2xl border border-gray-200 bg-white py-2 shadow-xl z-50 origin-top-right"
          >
            <div className="flex items-center gap-3 px-4 pb-3 text-sm text-gray-700 border-b border-gray-100">
              {u?.avatar ? (
                <img
                  src={u.avatar}
                  alt="avatar"
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-amber-700" />
                </div>
              )}
              <div>
                <div className="font-medium">{u?.name || session?.email}</div>
                <div className="text-xs text-gray-500">
                  {u?.role === "provider" ? "Prestador" : "Cliente"}
                </div>
              </div>
            </div>

            <Link
              to="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 transition"
            >
              <User className="h-4 w-4 text-amber-600" /> Minha conta
            </Link>

            {isProvider && (
              <Link
                to={`/p/${userSlug(u)}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 transition"
              >
                <ExternalLink className="h-4 w-4 text-amber-600" /> Meu
                perfil público
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =================== AppBar ===================
function AppBar({ session }) {
  return (
    <div className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-amber-600" />
          <div className="leading-tight">
            <div className="text-xs text-gray-500">Localização</div>
            <div className="flex items-center gap-1 text-sm font-semibold">
              <MapPin className="h-4 w-4" /> {session?.city || "Brasil"}
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          {session ? (
            <ProfileMenu
              session={session}
              onLogout={() => window.dispatchEvent(new Event("logout"))}
            />
          ) : (
            <Link to="/login">
              <GhostButton>
                <LogIn className="h-4 w-4" /> Entrar
              </GhostButton>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// =================== Bottom Tabs (mobile) ===================
function BottomTabs({ session }) {
  const loc = useLocation();
  const is = (p) => loc.pathname.startsWith(p);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-5xl grid-cols-3 px-2 py-2 text-xs">
        <TabLink
          to="/services"
          label="Início"
          icon={Home}
          active={is("/services") || loc.pathname === "/"}
        />
        <TabLink
          to="/contacts"
          label="Contatos"
          icon={MessageCircle}
          active={is("/contacts")}
        />
        <TabLink
          to={session ? "/account" : "/login"}
          label={session ? "Conta" : "Entrar"}
          icon={User}
          active={is("/account") || is("/login")}
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

// =================== Páginas ===================
function HeroSection() {
  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl">
      <img
        src="https://images.unsplash.com/photo-1584017911766-d451b5dcbb49?q=80&w=1600&auto=format&fit=crop"
        alt="Cuidados"
        className="h-60 w-full object-cover md:h-72"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="max-w-xl rounded-2xl bg-black/40 p-5 text-center text-white shadow-lg backdrop-blur">
          <div className="text-2xl font-bold">Bem-vindo ao Vinculum</div>
          <p className="mt-2 text-sm opacity-90">
            Conectamos famílias a assistentes geriátricos de confiança — no
            domicílio ou por teleassistência.
          </p>
          <Link
            to="/services"
            className="mt-4 inline-flex rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-amber-600"
          >
            Conheça nossos serviços
          </Link>
        </div>
      </div>
    </div>
  );
}

function SearchBar({ value, onChange }) {
  return (
    <div className="mb-4">
      <div className="relative">
        <Input
          className="pl-11"
          placeholder="Buscar serviços, tags, cidade…"
          value={value}
          onChange={onChange}
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
}

function PromoCarousel() {
  return (
    <div className="mb-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 to-yellow-500 p-5 text-white shadow">
        <div className="text-sm opacity-90">Cuidados contínuos</div>
        <div className="mt-1 text-2xl font-bold leading-tight">
          Assistência geriátrica com 20% OFF
        </div>
        <div className="mt-2 text-sm opacity-90">
          Somente esta semana • Profissionais verificados
        </div>
      </div>
    </div>
  );
}

function QuickTiles() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Tile icon={Shield} title="Verificados" subtitle="+ qualidade" />
      <Tile icon={BadgeCheck} title="Bem avaliados" subtitle="> 4.5" />
      <Tile icon={MapPin} title="Perto de você" subtitle="local" />
      <Tile icon={Phone} title="Teleatendimento" subtitle="remoto" />
    </div>
  );
}
function Tile({ icon: Icon, title, subtitle }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-amber-50 p-2 text-amber-600">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs text-gray-500">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

// ---------- Auth ----------
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const users = readLS(LS_KEYS.users, []);
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) return setError("Credenciais inválidas.");
    onLogin({ email: user.email, name: user.name, role: user.role });
    navigate("/services");
  };

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6 md:pb-8">
      <h2 className="mb-2 text-2xl font-bold">Entrar</h2>
      <Card>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Senha</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-amber-600">{error}</p>}
          <Button className="w-full">Entrar</Button>
          <div className="text-center text-sm text-gray-600">
            Não tem conta?{" "}
            <Link className="text-amber-700 underline" to="/register">
              Cadastre-se
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
    dob: "",
    city: "",
    bio: "",
    avatar: "",
    specialties: "",
    yearsExp: "",
    certifications: "",
    careNeeds: "",
    caregiverContact: "",
  });
  const [error, setError] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    const users = readLS(LS_KEYS.users, []);
    if (users.some((u) => u.email === form.email))
      return setError("Email já cadastrado.");
    const newUsers = [...users, form];
    writeLS(LS_KEYS.users, newUsers);
    alert("Cadastro realizado! Faça login.");
    navigate("/login");
  };

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6 md:pb-8">
      <h2 className="mb-2 text-2xl font-bold">Criar conta</h2>
      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-gray-700">Nome</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-gray-700">Senha</label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Perfil</label>
              <div className="mt-2 flex gap-3">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="client"
                    checked={form.role === "client"}
                    onChange={() => setForm({ ...form, role: "client" })}
                  />
                  Cliente
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="provider"
                    checked={form.role === "provider"}
                    onChange={() => setForm({ ...form, role: "provider" })}
                  />
                  Prestador
                </label>
              </div>
            </div>
          </div>

          {/* Campos básicos opcionais */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-gray-700">Data de nascimento</label>
              <Input
                type="date"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Cidade</label>
              <Input
                placeholder="Cidade - UF"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
          </div>

          {/* Role-specific */}
          {form.role === "provider" ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-3">
                <label className="text-sm text-gray-700">Especialidades</label>
                <Input
                  placeholder="ex.: medicação, prevenção de quedas, demência leve"
                  value={form.specialties}
                  onChange={(e) =>
                    setForm({ ...form, specialties: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">
                  Anos de experiência
                </label>
                <Input
                  type="number"
                  min="0"
                  value={form.yearsExp}
                  onChange={(e) =>
                    setForm({ ...form, yearsExp: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-700">Certificações</label>
                <Input
                  placeholder="ex.: COREN 12345, Primeiros Socorros"
                  value={form.certifications}
                  onChange={(e) =>
                    setForm({ ...form, certifications: e.target.value })
                  }
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-gray-700">Necessidades</label>
                <Input
                  placeholder="ex.: ajuda com medicação, mobilidade"
                  value={form.careNeeds}
                  onChange={(e) =>
                    setForm({ ...form, careNeeds: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">
                  Cuidador principal (contato)
                </label>
                <Input
                  placeholder="Nome e telefone"
                  value={form.caregiverContact}
                  onChange={(e) =>
                    setForm({ ...form, caregiverContact: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-sm text-gray-700">Biografia</label>
            <Textarea
              placeholder="Fale um pouco sobre você…"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>

          {error && <p className="text-sm text-amber-600">{error}</p>}
          <Button className="w-full">Cadastrar</Button>
        </form>
      </Card>
    </div>
  );
}

// ---------- Serviços ----------
function Services({ session }) {
  const [query, setQuery] = useState("");
  const [services, setServices] = useState(
    () => readLS(LS_KEYS.services, null) ?? seedServices
  );

  // salva seeds na primeira carga
  useEffect(() => {
    const current = readLS(LS_KEYS.services, null);
    if (!current) writeLS(LS_KEYS.services, services);
  }, []);

  // excluir (apenas dono)
  const handleDelete = (id) => {
    const list = readLS(LS_KEYS.services, []);
    const svc = list.find((s) => s.id === id);
    if (!svc) return;
    if (!session || svc.ownerEmail !== session.email) {
      alert("Você só pode excluir serviços que você publicou.");
      return;
    }
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;

    const updated = list.filter((s) => s.id !== id);
    writeLS(LS_KEYS.services, updated);
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return services;
    return services.filter((s) =>
      [s.title, s.description, s.location, ...(s.tags || [])]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [query, services]);

  const isProvider = session?.role === "provider";

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-4 md:pb-8">
      <SearchBar value={query} onChange={(e) => setQuery(e.target.value)} />
      <PromoCarousel />

      {filtered.length === 0 ? (
        <Card>
          <p className="text-gray-600">Nenhum serviço encontrado para sua busca.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((s) => (
            <ServiceCard
              key={s.id}
              service={s}
              session={session}
              canDelete={session?.email === s.ownerEmail}
              onDelete={() => handleDelete(s.id)}
              allowManage={true}
            />
          ))}
        </div>
      )}

      {isProvider && (
        <Link to="/add-service" className="fixed bottom-20 right-4 md:right-8">
          <button className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-600 text-white shadow-lg transition hover:scale-105">
            <Plus className="h-7 w-7" />
          </button>
        </Link>
      )}
    </div>
  );
}

function ServiceCard({
  service,
  session,
  canDelete = false,
  onDelete = null,
  allowManage = false, // se false (página pública), não mostra Editar/Excluir
}) {
  const provider = getUserByEmail(service.ownerEmail);
  const isOwner = canDelete && session?.email === service.ownerEmail;

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      {service.cover && (
        <div
          className="h-36 w-full bg-gray-100 md:h-44"
          style={{
            backgroundImage: `url(${service.cover})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold leading-tight truncate">
              {service.title}
            </h3>
            <div className="mt-1 text-sm text-gray-600 flex items-center gap-2">
              {provider ? (
                <>
                  {provider.avatar ? (
                    <img
                      src={provider.avatar}
                      alt="avatar"
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-amber-600" />
                  )}
                  <Link
                    className="hover:text-amber-700 underline truncate"
                    to={`/p/${userSlug(provider)}`}
                    title={service.ownerName}
                  >
                    {service.ownerName}
                  </Link>
                </>
              ) : (
                <>por {service.ownerName}</>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700 whitespace-nowrap">
              R$ {service.hourlyPrice}/h
            </div>

            {allowManage && isOwner && (
              <>
                <Link
                  to={`/edit-service/${service.id}`}
                  className="rounded-xl bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-100 flex items-center gap-1"
                  title="Editar serviço"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </Link>
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="rounded-xl bg-red-50 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-100 flex items-center gap-1"
                    title="Excluir serviço"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <p className="mt-3 line-clamp-3 text-gray-700">{service.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
          {service.remote ? (
            <span className="rounded-xl bg-gray-100 px-2 py-1">Remoto</span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {service.location}
            </span>
          )}
          {service.tags?.slice(0, 3).map((t) => (
            <span key={t} className="rounded-xl bg-gray-100 px-2 py-1">
              #{t}
            </span>
          ))}
          <span className="ml-auto inline-flex items-center gap-1 text-amber-600">
            <Star className="h-4 w-4" />
            {service.rating?.toFixed(1) ?? "-"}
          </span>
        </div>

        <div className="mt-4">
          {session ? (
            <Link to="/contacts">
              <Button className="w-full">Entrar em contato</Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button className="w-full">Entrar em contato</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Adicionar serviço ----------
function AddService({ session }) {
  const navigate = useNavigate();
  const isProvider = session?.role === "provider";
  const [form, setForm] = useState({
    title: "",
    description: "",
    hourlyPrice: "",
    remote: false,
    location: "",
    tags: "",
    cover: "",
  });

  useEffect(() => {
    if (!isProvider) navigate("/services");
  }, [isProvider, navigate]);

  const onSubmit = (e) => {
    e.preventDefault();
    const list = readLS(LS_KEYS.services, seedServices);
    const payload = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      description: form.description.trim(),
      hourlyPrice: Number(form.hourlyPrice || 0),
      remote: !!form.remote,
      location: form.remote ? "Remoto" : form.location.trim(),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      ownerEmail: session?.email,
      ownerName: session?.name || session?.email,
      rating: 5,
      cover: form.cover.trim(),
    };
    writeLS(LS_KEYS.services, [payload, ...list]);
    alert("Serviço adicionado!");
    navigate("/services");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-4 md:pb-8">
      <h2 className="mb-2 text-2xl font-bold">Adicionar serviço</h2>
      <ServiceForm form={form} setForm={setForm} onSubmit={onSubmit} />
    </div>
  );
}

// ---------- Editar serviço (NOVO) ----------
function EditService({ session }) {
  const navigate = useNavigate();
  const { id } = useParams();

  // Carrega serviço
  const all = readLS(LS_KEYS.services, []);
  const existing = all.find((s) => s.id === id);

  // Validações: precisa existir e pertencer ao usuário
  useEffect(() => {
    if (!existing) {
      alert("Serviço não encontrado.");
      navigate("/services");
      return;
    }
    if (!session || existing.ownerEmail !== session.email) {
      alert("Você não tem permissão para editar este serviço.");
      navigate("/services");
    }
  }, [existing, session, navigate]);

  const [form, setForm] = useState(() => {
    if (!existing) {
      return {
        title: "",
        description: "",
        hourlyPrice: "",
        remote: false,
        location: "",
        tags: "",
        cover: "",
      };
    }
    return {
      title: existing.title,
      description: existing.description,
      hourlyPrice: existing.hourlyPrice,
      remote: existing.remote,
      location: existing.remote ? "" : existing.location,
      tags: (existing.tags || []).join(", "),
      cover: existing.cover || "",
    };
  });

  const onSubmit = (e) => {
    e.preventDefault();
    const list = readLS(LS_KEYS.services, []);
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) {
      alert("Serviço não encontrado.");
      return navigate("/services");
    }
    if (!session || list[idx].ownerEmail !== session.email) {
      alert("Você não tem permissão para editar este serviço.");
      return navigate("/services");
    }

    const updated = {
      ...list[idx],
      title: form.title.trim(),
      description: form.description.trim(),
      hourlyPrice: Number(form.hourlyPrice || 0),
      remote: !!form.remote,
      location: form.remote ? "Remoto" : form.location.trim(),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      cover: form.cover.trim(),
    };

    list[idx] = updated;
    writeLS(LS_KEYS.services, list);
    alert("Serviço atualizado!");
    navigate("/services");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-4 md:pb-8">
      <h2 className="mb-2 text-2xl font-bold">Editar serviço</h2>
      <ServiceForm form={form} setForm={setForm} onSubmit={onSubmit} />
    </div>
  );
}

// Formulário reutilizável (Adicionar/Editar)
function ServiceForm({ form, setForm, onSubmit }) {
  return (
    <Card>
      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label className="text-sm text-gray-700">Título</label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm text-gray-700">Descrição</label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-gray-700">Preço por hora (R$)</label>
            <Input
              type="number"
              min="0"
              step="1"
              value={form.hourlyPrice}
              onChange={(e) => setForm({ ...form, hourlyPrice: e.target.value })}
              required
            />
          </div>
          <div className="flex items-end gap-2">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.remote}
                onChange={(e) => setForm({ ...form, remote: e.target.checked })}
              />
              Atuação remota
            </label>
          </div>
        </div>
        {!form.remote && (
          <div>
            <label className="text-sm text-gray-700">Localização</label>
            <Input
              placeholder="Cidade - UF"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
        )}
        <div>
          <label className="text-sm text-gray-700">Tags (separadas por vírgula)</label>
          <Input
            placeholder="ex.: medicação, quedas, domiciliar"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm text-gray-700">Imagem de capa (URL)</label>
          <Input
            placeholder="https://..."
            value={form.cover}
            onChange={(e) => setForm({ ...form, cover: e.target.value })}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit">
            <Pencil className="h-4 w-4" /> Salvar
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ---------- Contatos ----------
function Contacts() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const onSubmit = (e) => {
    e.preventDefault();
    const list = readLS(LS_KEYS.contacts, []);
    writeLS(LS_KEYS.contacts, [
      { id: crypto.randomUUID(), ...form, createdAt: new Date().toISOString() },
      ...list,
    ]);
    setSent(true);
    setForm({ name: "", email: "", message: "" });
  };
  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-4 md:pb-8">
      <h2 className="mb-2 text-2xl font-bold">Fale conosco</h2>
      <Card>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-gray-700">Nome</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-700">Mensagem</label>
            <Textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            {sent && (
              <span className="text-sm text-emerald-700">
                Mensagem enviada! Responderemos em breve.
              </span>
            )}
            <Button type="submit">
              <Mail className="h-4 w-4" /> Enviar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ---------- Conta (simples) ----------
function Account({ session, onLogout }) {
  if (!session) return <Navigate to="/login" replace />;
  const u = getUserByEmail(session.email) || {};
  const age = calcAge(u.dob);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-4 md:pb-8">
      <h2 className="mb-2 text-2xl font-bold">Minha conta</h2>
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {u?.avatar ? (
              <img
                src={u.avatar}
                alt="avatar"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                <User className="h-7 w-7 text-amber-700" />
              </div>
            )}
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Logado como</div>
              <div className="text-lg font-semibold">
                {u.name || session.name || session.email}
              </div>
              <div className="text-sm text-gray-600">
                Perfil: {(u.role || session.role) === "provider"
                  ? "Prestador"
                  : "Cliente"}
              </div>

              <div className="mt-3 text-sm text-gray-700">
                {u.dob && (
                  <div>
                    <b>Nascimento:</b> {u.dob} {age ? `(${age} anos)` : ""}
                  </div>
                )}
                {u.city && (
                  <div>
                    <b>Cidade:</b> {u.city}
                  </div>
                )}
                {u.bio && (
                  <div className="mt-2">
                    <b>Bio:</b> {u.bio}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {(u.role || session.role) === "provider" && (
              <Link
                to={`/p/${userSlug(u)}`}
                className="inline-flex items-center justify-center rounded-2xl bg-amber-50 px-4 py-2 text-amber-700 hover:bg-amber-100"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver perfil público
              </Link>
            )}
            <Link
              to="/profile"
              className="inline-flex items-center justify-center rounded-2xl bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
            >
              Editar perfil
            </Link>
            <Button onClick={onLogout} className="bg-gray-900">
              Sair
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ---------- Página de Perfil (edição) ----------
function ProfilePage({ session }) {
  const navigate = useNavigate();
  if (!session) return <Navigate to="/login" replace />;

  const current =
    getUserByEmail(session.email) || {
      email: session.email,
      name: session.name,
      role: session.role,
    };
  const [form, setForm] = useState({
    name: current.name || "",
    email: current.email || "",
    role: current.role || "client",
    dob: current.dob || "",
    city: current.city || "",
    bio: current.bio || "",
    avatar: current.avatar || "",
    specialties: current.specialties || "",
    yearsExp: current.yearsExp || "",
    certifications: current.certifications || "",
    careNeeds: current.careNeeds || "",
    caregiverContact: current.caregiverContact || "",
  });

  const age = calcAge(form.dob);

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      setForm((f) => ({ ...f, avatar: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const onSave = (e) => {
    e.preventDefault();
    upsertUser({ ...current, ...form });
    const s = readLS(LS_KEYS.session, null);
    if (s?.email === form.email) {
      writeLS(LS_KEYS.session, { ...s, name: form.name, role: form.role });
    }
    alert("Perfil atualizado com sucesso!");
    navigate("/account");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-4 md:pb-8">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Meu perfil</h2>
        <Link
          to="/account"
          className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-white shadow hover:opacity-90"
        >
          Voltar
        </Link>
      </div>

      <Card>
        <form onSubmit={onSave} className="grid gap-4">
          <div className="flex items-center gap-4">
            {form.avatar ? (
              <img
                src={form.avatar}
                alt="avatar"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                <User className="h-7 w-7 text-amber-700" />
              </div>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">
              <ImageIcon className="h-4 w-4 text-amber-600" />
              <span>Trocar foto</span>
              <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-gray-700">Nome completo</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Email</label>
              <Input
                type="email"
                value={form.email}
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm text-gray-700">Data de nascimento</label>
              <Input
                type="date"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Idade</label>
              <Input value={age ? `${age} anos` : ""} readOnly className="bg-gray-50" />
            </div>
            <div>
              <label className="text-sm text-gray-700">Cidade</label>
              <Input
                placeholder="Cidade - UF"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700">Biografia</label>
            <Textarea
              placeholder="Fale um pouco sobre você…"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>

          {/* Campos por papel */}
          {form.role === "provider" ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-3">
                <label className="text-sm text-gray-700">Especialidades</label>
                <Input
                  placeholder="ex.: medicação, prevenção de quedas, demência leve"
                  value={form.specialties}
                  onChange={(e) =>
                    setForm({ ...form, specialties: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">
                  Anos de experiência
                </label>
                <Input
                  type="number"
                  min="0"
                  value={form.yearsExp}
                  onChange={(e) =>
                    setForm({ ...form, yearsExp: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-700">Certificações</label>
                <Input
                  placeholder="ex.: COREN 12345, Primeiros Socorros"
                  value={form.certifications}
                  onChange={(e) =>
                    setForm({ ...form, certifications: e.target.value })
                  }
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-gray-700">Necessidades</label>
                <Input
                  placeholder="ex.: ajuda com medicação, mobilidade"
                  value={form.careNeeds}
                  onChange={(e) =>
                    setForm({ ...form, careNeeds: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">
                  Cuidador principal (contato)
                </label>
                <Input
                  placeholder="Nome e telefone"
                  value={form.caregiverContact}
                  onChange={(e) =>
                    setForm({ ...form, caregiverContact: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit">Salvar alterações</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ---------- Perfil Público do Prestador ----------
function PublicProfile() {
  const { slug } = useParams();
  const u = getUserBySlug(slug);
  const services = readLS(LS_KEYS.services, seedServices).filter(
    (s) => s.ownerEmail && u && s.ownerEmail === u.email
  );

  if (!u || u.role !== "provider") {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-28 pt-4">
        <Card>
          <div className="text-center">
            <div className="text-xl font-bold">Perfil não encontrado</div>
            <p className="text-gray-600 mt-1">
              Verifique o link. Este perfil pode ser privado ou não existe.
            </p>
            <Link
              to="/services"
              className="inline-flex mt-4 rounded-full bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
            >
              Voltar aos serviços
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const age = calcAge(u.dob);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-28 pt-4">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mb-4">
        {u.avatar ? (
          <img
            src={u.avatar}
            alt={u.name}
            className="h-24 w-24 rounded-full object-cover"
          />
        ) : (
          <div className="h-24 w-24 rounded-full bg-amber-100 flex items-center justify-center">
            <User className="h-10 w-10 text-amber-700" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">{u.name}</h1>
          <div className="text-gray-600 text-sm mt-1">
            {u.city && <span className="mr-3">📍 {u.city}</span>}
            {age && <span>🎂 {age} anos</span>}
          </div>
          {u.bio && <p className="mt-2 text-gray-700">{u.bio}</p>}
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {u.specialties && (
              <span className="rounded-full bg-amber-50 text-amber-700 px-3 py-1">
                {u.specialties}
              </span>
            )}
            {u.certifications && (
              <span className="rounded-full bg-gray-100 px-3 py-1">
                {u.certifications}
              </span>
            )}
            {u.yearsExp && (
              <span className="rounded-full bg-gray-100 px-3 py-1">
                {u.yearsExp} anos de experiência
              </span>
            )}
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-2">Serviços oferecidos</h2>
      {services.length === 0 ? (
        <Card>
          <p className="text-gray-600">
            Este profissional ainda não cadastrou serviços.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} canDelete={false} allowManage={false} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Layout ----------
function FloatingNavButtons() {
  const navigate = useNavigate();
  return (
    <div className="fixed top-4 left-4 z-50 flex gap-2">
      <Link
        to="/"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600 text-white shadow-lg transition hover:scale-110 hover:bg-amber-700"
        title="Ir para a Home"
      >
        <Home className="h-5 w-5" />
      </Link>
      <button
        onClick={() => navigate(-1)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg ring-1 ring-gray-200 transition hover:scale-110 hover:bg-gray-50"
        title="Voltar página"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
    </div>
  );
}

function PageLayout({ session, onLogout, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-16 md:pb-0">
      <AppBar session={session} />
      <FloatingNavButtons />
      <main>{children}</main>
      <BottomTabs session={session} />
      <footer className="hidden border-t border-gray-200 bg-white md:block">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-amber-600" /> Vinculum ©{" "}
            {new Date().getFullYear()}
          </div>
          <div>Este é um MVP de demonstração. Não substitui orientação médica.</div>
        </div>
      </footer>
    </div>
  );
}

function PrivateRoute({ children, role, session }) {
  if (!session) return <Navigate to="/login" replace />;
  if (role && session.role !== role) return <Navigate to="/services" replace />;
  return children;
}

function App() {
  const { session, save, logout } = useSession();

  useEffect(() => {
    const svc = readLS(LS_KEYS.services, null);
    if (!svc) writeLS(LS_KEYS.services, seedServices);
    const users = readLS(LS_KEYS.users, []);
    if (users.length === 0) {
      writeLS(LS_KEYS.users, [
        {
          name: "Ana Souza",
          email: "ana@nurse.com",
          password: "123",
          role: "provider",
          dob: "",
          city: "",
          bio: "",
          avatar: "",
          specialties: "Prevenção de quedas, medicação",
          yearsExp: "5",
          certifications: "COREN 12345",
        },
        {
          name: "Carlos Ferreira",
          email: "carlos@onco.com",
          password: "123",
          role: "provider",
          dob: "",
          city: "",
          bio: "",
          avatar: "",
          specialties: "Teleassistência, mobilidade",
          yearsExp: "3",
          certifications: "Primeiros Socorros",
        },
        {
          name: "Paciente Demo",
          email: "paciente@demo.com",
          password: "123",
          role: "client",
          dob: "",
          city: "",
          bio: "",
          avatar: "",
          careNeeds: "Ajuda com medicação",
          caregiverContact: "",
        },
      ]);
    }

    const logoutHandler = () => logout();
    window.addEventListener("logout", logoutHandler);
    return () => window.removeEventListener("logout", logoutHandler);
  }, []);

  return (
    <BrowserRouter>
      <PageLayout session={session} onLogout={logout}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login onLogin={save} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/services" element={<Services session={session} />} />
          <Route
            path="/add-service"
            element={
              <PrivateRoute role="provider" session={session}>
                <AddService session={session} />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-service/:id"
            element={
              <PrivateRoute role="provider" session={session}>
                <EditService session={session} />
              </PrivateRoute>
            }
          />
          <Route path="/contacts" element={<Contacts />} />
          <Route
            path="/account"
            element={<Account session={session} onLogout={logout} />}
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute session={session}>
                <ProfilePage session={session} />
              </PrivateRoute>
            }
          />
          <Route path="/p/:slug" element={<PublicProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageLayout>
    </BrowserRouter>
  );
}

// Tailwind base (fonte + utilidades simples)
const style = document.createElement("style");
style.innerHTML = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  :root { font-family: Inter, ui-sans-serif, system-ui, -apple-system; }
  body { margin: 0; color: #0f172a; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
`;
document.head.appendChild(style);

const root = createRoot(document.getElementById("root"));
root.render(<App />);