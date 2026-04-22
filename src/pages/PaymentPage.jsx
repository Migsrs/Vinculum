// src/pages/PaymentPage.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Input } from "../components/ui";
import { CreditCard, QrCode, CheckCircle, XCircle } from "lucide-react";

// ── Algoritmo de Luhn ──────────────────────────────────────
function luhn(raw) {
  const digits = raw.replace(/\D/g, "");
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

// ── Detecta bandeira (Visa / Mastercard) ───────────────────
function detectBrand(raw) {
  const d = raw.replace(/\D/g, "");
  if (d.length < 1) return null;

  // Visa: começa com 4, 13 ou 16 dígitos
  if (/^4/.test(d) && (d.length === 13 || d.length === 16)) return "visa";

  // Mastercard clássico: 51–55
  if (/^5[1-5]/.test(d) && d.length === 16) return "mastercard";

  // Mastercard novo range: 2221–2720
  if (d.length === 16) {
    const prefix = parseInt(d.substring(0, 4), 10);
    if (prefix >= 2221 && prefix <= 2720) return "mastercard";
  }

  return null;
}

// ── Formata número do cartão em grupos de 4 ────────────────
function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

// ── Formata validade MM/AA ─────────────────────────────────
function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

// ── Chave aleatória para o QR (não representa nada real) ───
function randomPixKey() {
  return (
    "VINCULUM-" +
    Math.random().toString(36).substring(2, 10).toUpperCase() +
    "-" +
    Date.now().toString(36).toUpperCase()
  );
}

// ══════════════════════════════════════════════════════════
export default function PaymentPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("pix");

  // ── PIX ─────────────────────────────────────────────────
  const [pixKey] = useState(randomPixKey);
  const [pixConfirmed, setPixConfirmed] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const timerRef = useRef(null);

  // reinicia countdown sempre que entra na aba PIX
  useEffect(() => {
    if (tab !== "pix" || pixConfirmed) return;

    setCountdown(10);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setPixConfirmed(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // ── Cartão ───────────────────────────────────────────────
  const [card, setCard] = useState({ number: "", holder: "", expiry: "", cvv: "" });
  const [brand, setBrand] = useState(null);
  const [cardResult, setCardResult] = useState(null); // null | "success" | "fail"

  const handleNumber = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCard((c) => ({ ...c, number: formatted }));
    setBrand(detectBrand(formatted));
    setCardResult(null);
  };

  const handleExpiry = (e) => {
    setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }));
  };

  const handlePay = (e) => {
    e.preventDefault();
    const detectedBrand = detectBrand(card.number);
    const valid = detectedBrand && luhn(card.number);
    setCardResult(valid ? "success" : "fail");
  };

  // URL do QR via serviço público (conteúdo é uma string aleatória sem significado)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixKey)}`;

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6 md:pb-8">
      <h2 className="mb-6 text-center text-2xl font-bold">Pagamento</h2>

      {/* ── Tabs ── */}
      <div className="mb-6 flex rounded-2xl border border-gray-200 bg-gray-50 p-1">
        <button
          type="button"
          onClick={() => setTab("pix")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition ${
            tab === "pix"
              ? "bg-white shadow-sm text-amber-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <QrCode className="h-4 w-4" />
          PIX
        </button>
        <button
          type="button"
          onClick={() => setTab("card")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition ${
            tab === "card"
              ? "bg-white shadow-sm text-amber-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Cartão
        </button>
      </div>

      {/* ── Aba PIX ── */}
      {tab === "pix" && (
        <Card>
          <div className="flex flex-col items-center gap-5 py-4">
            <p className="text-center text-sm text-gray-600">
              Escaneie o QR Code abaixo com o aplicativo do seu banco
            </p>

            <div className="rounded-2xl border-4 border-amber-500 p-2 shadow-md">
              <img
                src={qrUrl}
                alt="QR Code PIX"
                width={200}
                height={200}
                className="rounded-xl"
              />
            </div>

            <p className="text-xs text-gray-400">
              Chave: <span className="font-mono">{pixKey}</span>
            </p>

            {!pixConfirmed && (
              <div className="flex items-center gap-3 text-sm text-amber-700 font-medium">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-lg font-bold">
                  {countdown}
                </span>
                <span>segundos aguardando confirmação…</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ── Aba Cartão ── */}
      {tab === "card" && (
        <Card>
          <form onSubmit={handlePay} className="grid gap-4">
            {/* Número */}
            <div>
              <label className="mb-1 block text-sm text-gray-700">Número do cartão</label>
              <div className="relative">
                <Input
                  value={card.number}
                  onChange={handleNumber}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  inputMode="numeric"
                  required
                />
                {brand && (
                  <span
                    className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-widest ${
                      brand === "visa"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {brand}
                  </span>
                )}
              </div>
            </div>

            {/* Titular */}
            <div>
              <label className="mb-1 block text-sm text-gray-700">Nome no cartão</label>
              <Input
                value={card.holder}
                onChange={(e) => setCard((c) => ({ ...c, holder: e.target.value.toUpperCase() }))}
                placeholder="NOME SOBRENOME"
                required
              />
            </div>

            {/* Validade + CVV */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-gray-700">Validade</label>
                <Input
                  value={card.expiry}
                  onChange={handleExpiry}
                  placeholder="MM/AA"
                  maxLength={5}
                  inputMode="numeric"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">CVV</label>
                <Input
                  type="password"
                  value={card.cvv}
                  onChange={(e) =>
                    setCard((c) => ({
                      ...c,
                      cvv: e.target.value.replace(/\D/g, "").slice(0, 3),
                    }))
                  }
                  placeholder="•••"
                  maxLength={3}
                  inputMode="numeric"
                  required
                />
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Nenhuma informação de pagamento é armazenada.
            </p>

            {/* Resultado */}
            {cardResult && (
              <div
                className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${
                  cardResult === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {cardResult === "success" ? (
                  <CheckCircle className="h-5 w-5 shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 shrink-0" />
                )}
                {cardResult === "success" ? "Pagamento efetuado" : "Pagamento recusado"}
              </div>
            )}

            <Button type="submit" className="w-full">
              Pagar
            </Button>
          </form>
        </Card>
      )}

      {/* ── Pop-up PIX autorizado ── */}
      {pixConfirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
            <CheckCircle className="mx-auto mb-4 h-20 w-20 text-green-500" />
            <h3 className="text-2xl font-bold text-gray-900">Pagamento autorizado!</h3>
            <p className="mt-2 text-sm text-gray-500">
              Seu pagamento via PIX foi confirmado com sucesso.
            </p>
            <Button
              className="mt-6 w-full"
              onClick={() => navigate("/services")}
            >
              Voltar aos serviços
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
