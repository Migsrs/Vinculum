// src/utils/storage.js

export const LS_KEYS = {
  users: "vinculum_users",
  session: "vinculum_session",
  services: "vinculum_services",
  contacts: "vinculum_contacts",
  googlePending: "vinculum_google_pending",
  ratings: "vinculum_ratings",
  contracts: "vinculum_contracts",
};

// ── ID de chat derivado dos nomes (ordem alfabética) ──────
export function getChatId(name1, name2) {
  const s1 = slugify(name1) || "usuario";
  const s2 = slugify(name2) || "usuario";
  return [s1, s2].sort().join("--");
}

// ── Contratos (serviços contratados após pagamento) ────────
export function getContracts() {
  return readLS(LS_KEYS.contracts, []);
}

export function addContract(contract) {
  const list = getContracts();
  if (list.find((c) => c.chatId === contract.chatId)) return; // evita duplicata
  writeLS(LS_KEYS.contracts, [{ ...contract, status: "active" }, ...list]);
}

export function closeContract(contractId) {
  const list = getContracts().map((c) =>
    c.id === contractId ? { ...c, status: "closed", closedAt: new Date().toISOString() } : c
  );
  writeLS(LS_KEYS.contracts, list);
}

export function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------- Usuários ----------
export function getUsers() {
  return readLS(LS_KEYS.users, []);
}

export function setUsers(arr) {
  writeLS(LS_KEYS.users, arr);
}

export function getUserByEmail(email) {
  return getUsers().find((u) => u.email === email) || null;
}

export function slugify(text = "") {
  const base = (text || "").toString().toLowerCase().trim();
  if (!base) return "";
  return base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function userSlug(u) {
  if (!u) return "";
  const name = u.name || u.email?.split("@")[0] || "usuario";
  return slugify(`${name}`);
}

export function getUserBySlug(slug) {
  const list = getUsers();
  return list.find((u) => userSlug(u) === slug) || null;
}

export function upsertUser(updated) {
  const list = getUsers();
  const idx = list.findIndex((u) => u.email === updated.email);
  if (idx === -1) list.push(updated);
  else list[idx] = { ...list[idx], ...updated };
  setUsers(list);
}

export function calcAge(yyyy_mm_dd) {
  if (!yyyy_mm_dd) return "";
  const dob = new Date(yyyy_mm_dd);
  if (isNaN(dob)) return "";
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

// ---------- Avaliações (ratings) ----------

export function getRatings() {
  return readLS(LS_KEYS.ratings, []);
}

export function setRatings(list) {
  writeLS(LS_KEYS.ratings, list);
}

export function getRatingsForProvider(providerEmail) {
  if (!providerEmail) return [];
  return getRatings().filter((r) => r.providerEmail === providerEmail);
}

/**
 * Calcula a média de estrelas de uma lista de avaliações.
 * Cada item deve ter a propriedade "stars" (1 a 5).
 */
export function calcAverageRating(ratings) {
  if (!ratings || ratings.length === 0) return 0;
  const total = ratings.reduce(
    (sum, r) => sum + (Number(r.stars) || 0),
    0
  );
  return total / ratings.length;
}

export function getAverageRatingForProvider(providerEmail) {
  const list = getRatingsForProvider(providerEmail);
  return calcAverageRating(list);
}
