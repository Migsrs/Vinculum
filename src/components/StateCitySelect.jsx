// src/components/StateCitySelect.jsx
import React, { useEffect, useState } from "react";

const STATES = [
  { uf: "AC", name: "Acre" },
  { uf: "AL", name: "Alagoas" },
  { uf: "AP", name: "Amapá" },
  { uf: "AM", name: "Amazonas" },
  { uf: "BA", name: "Bahia" },
  { uf: "CE", name: "Ceará" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "ES", name: "Espírito Santo" },
  { uf: "GO", name: "Goiás" },
  { uf: "MA", name: "Maranhão" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "PA", name: "Pará" },
  { uf: "PB", name: "Paraíba" },
  { uf: "PR", name: "Paraná" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "PI", name: "Piauí" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "RO", name: "Rondônia" },
  { uf: "RR", name: "Roraima" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "SP", name: "São Paulo" },
  { uf: "SE", name: "Sergipe" },
  { uf: "TO", name: "Tocantins" },
];

const selectBase =
  "w-full rounded-full border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm";

/**
 * Dois selects encadeados: Estado → Cidade.
 *
 * Props:
 *   stateUF      string  – sigla do estado selecionado (ex.: "SP")
 *   city         string  – nome da cidade selecionada
 *   onStateChange(uf)    – chamado quando o estado muda
 *   onCityChange(name)   – chamado quando a cidade muda
 *   required     bool    – aplica required nos dois selects
 */
export function StateCitySelect({
  stateUF = "",
  city = "",
  onStateChange,
  onCityChange,
  required = false,
}) {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!stateUF) {
      setCities([]);
      return;
    }

    let active = true;
    setLoading(true);

    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateUF}/municipios?orderBy=nome`
    )
      .then((r) => r.json())
      .then((data) => {
        if (active) setCities(data.map((m) => m.nome));
      })
      .catch(() => {
        if (active) setCities([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [stateUF]);

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div>
        <label className="text-sm text-gray-700">Estado</label>
        <select
          className={selectBase}
          value={stateUF}
          onChange={(e) => onStateChange(e.target.value)}
          required={required}
        >
          <option value="">Selecione o estado</option>
          {STATES.map((s) => (
            <option key={s.uf} value={s.uf}>
              {s.name} ({s.uf})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm text-gray-700">Cidade</label>
        <select
          className={`${selectBase} ${!stateUF ? "cursor-not-allowed opacity-50" : ""}`}
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={!stateUF || loading}
          required={required}
        >
          <option value="">
            {loading ? "Carregando…" : stateUF ? "Selecione a cidade" : "Selecione o estado primeiro"}
          </option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
