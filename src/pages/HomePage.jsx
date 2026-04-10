import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, BadgeCheck, MapPin, Phone } from "lucide-react";
import { useSession } from "../hooks/useSession"; // ✅ IMPORT ADICIONADO

// =================== PÁGINA PRINCIPAL ===================
export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-0 md:pb-8">
      <HeroSection />
      <div className="mt-4 sm:mt-6">
        <PromoCarousel />
        <QuickTiles />
        <AboutSection />
      </div>
    </div>
  );
}

// =================== HERO ===================
function HeroSection() {
  const { user } = useSession(); // agora funciona
  const navigate = useNavigate();

  const handleClick = () => {
    if (user) {
      navigate("/services");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="relative mb-4 overflow-hidden rounded-3xl sm:mb-6">
      <img
        src="/img/Cuidados.jpg"
        alt="Cuidados com idosos"
        className="h-56 w-full object-cover sm:h-60 md:h-72"
      />

      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4">
        <div className="max-w-md rounded-2xl bg-black/45 p-4 text-center text-white shadow-lg backdrop-blur-sm sm:max-w-xl sm:p-5">
          <div className="text-xl font-bold sm:text-2xl">
            Bem-vindo ao Vinculum
          </div>

          <p className="mt-2 text-xs leading-relaxed opacity-90 sm:text-sm">
            Conectamos famílias a cuidadores geriátricos de confiança.
          </p>

          <button
            onClick={handleClick}
            className="mt-4 inline-flex rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-amber-600 sm:px-5 sm:text-sm"
          >
            Conheça nossos serviços
          </button>
        </div>
      </div>
    </div>
  );
}

// =================== CARROSSEL ===================
export function PromoCarousel() {
  const promotions = [
    {
      id: 1,
      label: "Promoção de lançamento",
      title: "Primeira diária com 20% OFF",
      description: "Para novos clientes cadastrados neste mês.",
    },
    {
      id: 2,
      label: "Pacote semanal",
      title: "7 dias com 1 dia grátis",
      description: "Ideal para famílias que precisam de apoio contínuo.",
    },
    {
      id: 3,
      label: "Teleatendimento",
      title: "Avaliação remota com 30% OFF",
      description: "Primeira consulta on-line com desconto especial.",
    },
    {
      id: 4,
      label: "Programa cuidador família",
      title: "Treinamento para familiares",
      description: "Aprenda boas práticas para cuidar de idosos em casa.",
    },
  ];

  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % promotions.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [promotions.length]);

  const touchStartX = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;

    if (Math.abs(diffX) > 40) {
      if (diffX < 0) {
        setActive((prev) => (prev + 1) % promotions.length);
      } else {
        setActive((prev) =>
          prev === 0 ? promotions.length - 1 : prev - 1
        );
      }
    }

    touchStartX.current = null;
  };

  const current = promotions[active];

  return (
    <div className="mb-4 sm:mb-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 to-yellow-500 p-5 text-white shadow">
        <div className="text-sm opacity-90">{current.label}</div>
        <div className="mt-1 text-2xl font-bold">{current.title}</div>
        <div className="mt-2 text-sm opacity-90">{current.description}</div>
      </div>
    </div>
  );
}

// =================== TILES ===================
function QuickTiles() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Tile icon={Shield} title="Verificados" subtitle="+ qualidade" />
      <Tile icon={BadgeCheck} title="Bem avaliados" subtitle="> 4.5" />
      <Tile icon={MapPin} title="Perto de você" subtitle="atendimento local" />
      <Tile icon={Phone} title="Teleatendimento" subtitle="modo remoto" />
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

// =================== SOBRE ===================
function AboutSection() {
  return (
    <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-6">
      <h2 className="text-lg font-semibold">Sobre o Vinculum</h2>
      <p className="mt-2 text-sm text-gray-700">
        O Vinculum conecta famílias a cuidadores confiáveis usando tecnologia.
      </p>
    </section>
  );
}