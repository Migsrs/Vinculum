// src/utils/security.js
// Utilitários de segurança centralizados

// ── 1. Hash de senha via Web Crypto API (SHA-256) ─────────────
// Nunca armazena a senha em texto puro — apenas o hash.
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ── 2. Verifica se uma string já é um hash SHA-256 ─────────────
export function isHashed(str) {
  return typeof str === "string" && /^[a-f0-9]{64}$/.test(str);
}

// ── 3. Validação de força de senha ─────────────────────────────
export function validatePasswordStrength(password) {
  if (!password || password.length < 8)
    return "A senha deve ter no mínimo 8 caracteres.";
  if (!/[0-9]/.test(password))
    return "A senha deve conter ao menos um número.";
  if (!/[a-zA-Z]/.test(password))
    return "A senha deve conter ao menos uma letra.";
  return null; // OK
}

// ── 4. Sanitização de texto de usuário ────────────────────────
// Remove caracteres que poderiam causar injeção de HTML/JS e
// limita o comprimento para evitar abuso de armazenamento.
export function sanitizeText(str, maxLen = 500) {
  return String(str ?? "")
    .trim()
    .replace(/[<>]/g, "")   // impede injeção de tags HTML
    .slice(0, maxLen);
}

// ── 5. Rate limiter em memória ────────────────────────────────
// Limita tentativas por chave (ex.: "login"). Reseta ao recarregar
// a página — barreira razoável sem backend.
const _attempts = new Map(); // key → { count, firstAt }

/**
 * Retorna true se a ação ainda é permitida, false se bloqueada.
 * @param {string} key        - identificador da ação (ex.: "login")
 * @param {number} maxAttempts - máximo de tentativas permitidas
 * @param {number} windowMs   - janela de tempo em ms (padrão: 15 min)
 */
export function checkRateLimit(key, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const entry = _attempts.get(key) ?? { count: 0, firstAt: now };

  // Janela expirou — reinicia contador
  if (now - entry.firstAt > windowMs) {
    _attempts.set(key, { count: 1, firstAt: now });
    return true;
  }

  if (entry.count >= maxAttempts) return false; // bloqueado

  _attempts.set(key, { ...entry, count: entry.count + 1 });
  return true;
}

/** Limpa o rate limit de uma chave (após login bem-sucedido) */
export function clearRateLimit(key) {
  _attempts.delete(key);
}
