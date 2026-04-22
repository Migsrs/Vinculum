# Vinculum - Marketplace de Assistentes Geriátricos (MVP)

Plataforma estilo iFood para conectar famílias a assistentes/cuidadores geriátricos.
Foco em simplicidade, mobile-first e validação rápida de hipótese.

> ⚠️ MVP educativo/demonstrativo — sem backend. Persistência via localStorage. Não usar em produção sem camadas de segurança/privacidade.

## ✨ Funcionalidades

Catálogo de serviços (listar/filtrar)

Cadastro / Login (MVP via localStorage)

Perfis:

Prestador: perfil público com slug (/p/:slug)

Cliente: perfil privado

CRUD de serviços (Prestador)

Adicionar, Editar, Excluir (somente o dono)

Contato: só permite acessar se estiver logado

Edição de perfil com: nome, email, data de nascimento (idade), cidade, bio, avatar e campos específicos por papel

Home com destaque (banner), cards rápidos e design mobile-first

Navegação:

Topo com localização, menu de perfil e botões flutuantes Home + Voltar

Bottom Tabs (mobile): Início, Contatos, Conta

## 🧱 Stack

React + React Router
Tailwind CSS
Framer Motion (animações sutis)
lucide-react (ícones)
localStorage (persistência do MVP)

## 🚀 Como rodar

1. Clonar

git clone https://github.com/seu-usuario/vinculum.git
cd vinculum

2. Instalar dependências

npm install ou yarn

3. Rodar em dev

npm run dev -> abra o endereço mostrado no terminal (ex.: http://localhost:5173)

> Se estiver iniciando do zero com Vite: npm create vite@latest, escolha React, depois instale Tailwind e as libs citadas.

---

## 👤 Usuários de teste (Seeds)

Ao iniciar, o app cria usuários e serviços exemplo:

Prestadores

Ana Souza — ana@nurse.com / 123

Carlos Ferreira — carlos@onco.com / 123


Cliente

Paciente Demo — paciente@demo.com / 123

> Após login como prestador, você verá Editar e Excluir nos seus serviços.

## 🗂️ Estrutura (simplificada)

src/main.jsx — App completo (rotas, páginas, componentes e lógica do MVP)

src/index.css — Tailwind (geral)

> Por ser MVP, centralizamos tudo no main.jsx para velocidade. Em produção, recomendável separar em módulos/páginas/hooks.


## 🔒 Regras de Acesso

Adicionar/Editar/Excluir serviço: apenas Prestador logado dono do serviço.

Contato: somente para usuário logado (cliente ou prestador).

## 🧪 Fluxos principais

Prestador:

1. Cadastra-se como Prestador

2. Preenche seu perfil (especialidades, certificações, etc.)

3. Adiciona serviços

4. Edita/Exclui quando necessário
5. 
6. Divulga link público: /p/:slug

Cliente:

1. Busca serviços

2. Visualiza perfis públicos

3. Faz login para entrar em contato
## 🧭 Decisões de MVP

Persistência em localStorage (sem backend)

Autenticação simplificada (somente e-mail/senha “em claro”)

Slugs para perfis públicos (URLs legíveis)

Design mobile-first com navegação simples (home, tabs, botões flutuantes)

## 🗺️ Roadmap (próximos passos)

API real (login seguro, perfis, serviços, contatos)

Upload de mídia em servidores/objet storage

Mensageria entre cliente ↔ prestador

Pagamentos/agenda (marcação de sessões)

Moderação/validação de perfis

Acessibilidade (WAI-ARIA) e i18n

SEO (metatags dinâmicas) e sitemap

## ⚠️ Aviso Legal

Este projeto é um protótipo educacional. Não substitui orientação médica, nem lida com dados sensíveis de forma adequada para produção.
