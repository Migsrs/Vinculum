// src/components/ui.jsx
import React from "react";
import { Search } from "lucide-react";

export function Button({ as: As = "button", className = "", children, ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 shadow-sm transition hover:shadow-md active:scale-[.99] disabled:opacity-60 bg-amber-600 text-white";
  return (
    <As className={`${base} ${className}`} {...props}>
      {children}
    </As>
  );
}

export function GhostButton({ as: As = "button", className = "", children, ...props }) {
  const base =
    "inline-flex items-center gap-2 rounded-2xl px-3 py-2 transition hover:bg-gray-100 text-gray-800";
  return (
    <As className={`${base} ${className}`} {...props}>
      {children}
    </As>
  );
}

export function Input({ className = "", ...props }) {
  const base =
    "w-full rounded-full border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/20";
  return <input className={`${base} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }) {
  const base =
    "w-full rounded-2xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/20 min-h-[120px]";
  return <textarea className={`${base} ${className}`} {...props} />;
}

export function Card({ className = "", children }) {
  return (
    <div className={`rounded-3xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <Input
        className="pl-11"
        placeholder="Buscar serviços, tags, cidade…"
        value={value}
        onChange={onChange}
      />
      <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
    </div>
  );
}
