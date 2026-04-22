// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Tailwind base extra (fonte + utilidades simples) que você já usava
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
