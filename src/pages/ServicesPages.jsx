// src/pages/ServicesPages.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MapPin, Star, Plus, Pencil, Trash2, Filter } from "lucide-react";

import { Button, Card, Input, Textarea, SearchBar } from "../components/ui";
import {
  LS_KEYS,
  readLS,
  writeLS,
  getUserByEmail,
  userSlug,
} from "../utils/storage";
import { seedServices, SERVICE_CATEGORIES } from "../utils/seeds";
import { PromoCarousel } from "./HomePage";

// 🔥 Firestore (para média de avaliações)
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

// =================== FILTRO DE CATEGORIA ===================
function CategoryFilter({ categories, active, onChange, queryText, onQueryChange }) {
  const [open, setOpen] = useState(false);

  const select = (cat) => {
    onChange(cat);
    setOpen(false);
  };

  return (
    <div className="mb-4 flex gap-3">
      <div className="flex-1">
        <SearchBar value={queryText} onChange={onQueryChange} />
      </div>

      <div className="relative shrink-0">
        {/* Botão com ícone de funil */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`flex h-full items-center justify-center rounded-full border px-3 shadow-sm transition hover:shadow-md ${
            active
              ? "border-amber-500 bg-amber-600 text-white"
              : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
          }`}
          title={active ? `Filtro: ${active}` : "Filtrar por categoria"}
        >
          <Filter className="h-5 w-5" />
        </button>

        {/* Dropdown customizado */}
        {open && (
          <>
            {/* overlay invisível para fechar ao clicar fora */}
            <div
              className="fixed inset-0 z-30"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 z-40 mt-2 w-56 rounded-2xl border border-gray-200 bg-white py-2 text-sm shadow-xl">
              <button
                type="button"
                onClick={() => select(null)}
                className={`flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-50 ${
                  !active ? "font-semibold text-amber-700" : "text-gray-700"
                }`}
              >
                Todas as categorias
              </button>
              <div className="my-1 border-t border-gray-100" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => select(cat)}
                  className={`flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-50 ${
                    active === cat ? "font-semibold text-amber-700" : "text-gray-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// =================== LISTAGEM DE SERVIÇOS ===================
export function Services({ session }) {
  const [queryText, setQueryText] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [services, setServices] = useState(
    () => readLS(LS_KEYS.services, null) ?? seedServices
  );

  // garante que todos os seeds estejam presentes e atualizados com category
  useEffect(() => {
    const current = readLS(LS_KEYS.services, null);
    if (!current) {
      writeLS(LS_KEYS.services, seedServices);
      return;
    }

    const seedMap = Object.fromEntries(seedServices.map((s) => [s.id, s]));
    let changed = false;

    // Adiciona seeds faltando + preenche category em seeds antigos que não tinham
    const merged = current.map((s) => {
      if (seedMap[s.id] && !s.category) {
        changed = true;
        return { ...s, category: seedMap[s.id].category };
      }
      return s;
    });

    const existingIds = new Set(current.map((s) => s.id));
    const missing = seedServices.filter((s) => !existingIds.has(s.id));
    if (missing.length > 0) {
      merged.push(...missing);
      changed = true;
    }

    if (changed) {
      writeLS(LS_KEYS.services, merged);
      setServices(merged);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setServices(updated);
  };

  const filtered = useMemo(() => {
    let result = services;

    // filtro por categoria
    if (activeCategory) {
      result = result.filter((s) => s.category === activeCategory);
    }

    // filtro por texto
    const q = queryText.trim().toLowerCase();
    if (q) {
      result = result.filter((s) =>
        [s.title, s.description, s.location, s.category, ...(s.tags || [])]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    return result;
  }, [queryText, activeCategory, services]);

  const isProvider = session?.role === "provider";

  // só mostra categorias que têm pelo menos um serviço cadastrado
  const usedCategories = useMemo(
    () => SERVICE_CATEGORIES.filter((cat) => services.some((s) => s.category === cat)),
    [services]
  );

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-4 md:pb-8">
      {/* ── Barra de busca + filtro de categoria ── */}
      <CategoryFilter
        categories={usedCategories}
        active={activeCategory}
        onChange={setActiveCategory}
        queryText={queryText}
        onQueryChange={(e) => setQueryText(e.target.value)}
      />

      <PromoCarousel />

      {filtered.length === 0 ? (
        <Card>
          <p className="text-gray-600">
            Nenhum serviço encontrado
            {activeCategory ? ` na categoria "${activeCategory}"` : " para sua busca"}.
          </p>
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

// =================== CARD DE SERVIÇO ===================
export function ServiceCard({
  service,
  session,
  canDelete = false,
  onDelete = null,
  allowManage = false,
}) {
  const provider = getUserByEmail(service.ownerEmail);
  const isOwner = canDelete && session?.email === service.ownerEmail;

  // 🔥 média das avaliações reais do prestador no Firestore
  const [avgRating, setAvgRating] = useState(null);
  const [loadingRating, setLoadingRating] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchAvg = async () => {
      if (!service.ownerEmail) return;
      try {
        setLoadingRating(true);
        const q = query(
          collection(db, "ratings"),
          where("providerEmail", "==", service.ownerEmail)
        );
        const snap = await getDocs(q);

        let sum = 0;
        let count = 0;
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          const stars = Number(data.stars || 0);
          if (!Number.isNaN(stars) && stars > 0) {
            sum += stars;
            count += 1;
          }
        });

        const avg = count > 0 ? sum / count : null;
        if (active) setAvgRating(avg);
      } catch (err) {
        console.error("Erro ao buscar média de avaliações no Firestore:", err);
        if (active) setAvgRating(null);
      } finally {
        if (active) setLoadingRating(false);
      }
    };

    fetchAvg();
    return () => {
      active = false;
    };
  }, [service.ownerEmail]);

  // se não tiver no Firestore, usa o rating estático do serviço (seed)
  const ratingToShow =
    avgRating != null ? avgRating : service.rating != null ? service.rating : null;

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
                    <MapPin className="h-4 w-4 text-amber-600" />
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

        <p className="mt-3 line-clamp-3 text-gray-700">
          {service.description}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
          {/* Categoria */}
          {service.category && (
            <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-700">
              {service.category}
            </span>
          )}

          {/* Localização */}
          {service.remote ? (
            <span className="rounded-xl bg-gray-100 px-2 py-1">Remoto</span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {service.location}
            </span>
          )}

          {/* Avaliação */}
          <span className="ml-auto inline-flex items-center gap-1 text-amber-600">
            <Star className="h-4 w-4" />
            {loadingRating
              ? "…"
              : ratingToShow != null
              ? ratingToShow.toFixed(1)
              : "-"}
          </span>
        </div>

        <div className="mt-4 grid gap-2">
          {session ? (
            <>
              <Link to="/payment">
                <Button className="w-full">Contratar</Button>
              </Link>
              <Link to="/contacts">
                <button className="w-full rounded-2xl border border-amber-600 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-50">
                  Entrar em contato
                </button>
              </Link>
            </>
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

// =================== FORMULÁRIO COMPARTILHADO ===================
function ServiceForm({ form, setForm, onSubmit, title }) {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-4 md:pb-8">
      <h2 className="mb-2 text-2xl font-bold">{title}</h2>
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
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-gray-700">
                Preço por hora (R$)
              </label>
              <Input
                type="number"
                min="0"
                step="1"
                value={form.hourlyPrice}
                onChange={(e) =>
                  setForm({ ...form, hourlyPrice: e.target.value })
                }
                required
              />
            </div>
            <div className="flex items-end gap-2">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.remote}
                  onChange={(e) =>
                    setForm({ ...form, remote: e.target.checked })
                  }
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
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
              />
            </div>
          )}

          <div>
            <label className="text-sm text-gray-700">Categoria</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
              className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">Selecione uma categoria…</option>
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-700">
              Imagem de capa (URL opcional)
            </label>
            <Input
              placeholder="https://..."
              value={form.cover}
              onChange={(e) => setForm({ ...form, cover: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Link
              to="/services"
              className="inline-flex items-center rounded-2xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// =================== ADICIONAR SERVIÇO ===================
export function AddService({ session }) {
  const navigate = useNavigate();
  const isProvider = session?.role === "provider";

  useEffect(() => {
    if (!isProvider) navigate("/services");
  }, [isProvider, navigate]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    hourlyPrice: "",
    remote: false,
    location: "",
    category: "",
    cover: "",
  });

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
      category: form.category,
      tags: [],
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
    <ServiceForm
      form={form}
      setForm={setForm}
      onSubmit={onSubmit}
      title="Adicionar serviço"
    />
  );
}

// =================== EDITAR SERVIÇO ===================
export function EditService({ session }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const list = readLS(LS_KEYS.services, seedServices);
  const existing = list.find((s) => s.id === id);

  useEffect(() => {
    if (!existing) {
      alert("Serviço não encontrado.");
      navigate("/services");
      return;
    }
    if (!session || existing.ownerEmail !== session.email) {
      alert("Você só pode editar serviços que você publicou.");
      navigate("/services");
    }
  }, [existing, session, navigate]);

  const [form, setForm] = useState(
    existing || {
      title: "",
      description: "",
      hourlyPrice: "",
      remote: false,
      location: "",
      category: "",
      cover: "",
    }
  );

  const onSubmit = (e) => {
    e.preventDefault();
    const updated = list.map((s) =>
      s.id === id
        ? {
            ...s,
            title: form.title.trim(),
            description: form.description.trim(),
            hourlyPrice: Number(form.hourlyPrice || 0),
            remote: !!form.remote,
            location: form.remote ? "Remoto" : form.location.trim(),
            category: form.category,
            tags: s.tags ?? [],
            cover: form.cover.trim(),
          }
        : s
    );

    writeLS(LS_KEYS.services, updated);
    alert("Serviço atualizado!");
    navigate("/services");
  };

  return (
    <ServiceForm
      form={form}
      setForm={setForm}
      onSubmit={onSubmit}
      title="Editar serviço"
    />
  );
}
