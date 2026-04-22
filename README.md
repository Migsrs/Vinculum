# Vinculum — Marketplace de Serviços para Idosos

Plataforma que conecta famílias e idosos a prestadores de serviços de saúde e cuidado: fisioterapeutas, nutricionistas, psicólogos, cuidadores domiciliares e muito mais.

🔗 **Deploy:** [vinculum.netlify.app](https://vinculum.netlify.app)

---

## Funcionalidades

### Serviços
- Catálogo de serviços com busca por texto
- Filtro por categoria (menu suspenso)
- Cards com avaliação média, localização e badge de categoria
- CRUD completo para prestadores (adicionar, editar, excluir)
- 8 categorias fixas: Cuidador Domiciliar, Fisioterapia, Nutrição Clínica, Psicologia, Terapia Ocupacional, Teleassistência, Enfermagem, Acompanhamento Geriátrico

### Autenticação
- Cadastro com email/senha e login com Google
- Validação de CPF (algoritmo Módulo 11 — Receita Federal)
- Senhas armazenadas com hash SHA-256 (Web Crypto API)
- Rate limiting de login (máx. 5 tentativas em 15 minutos)
- Validação de força de senha (mínimo 8 caracteres com letras e números)

### Perfis
- **Prestador:** perfil público acessível via `/p/:slug` com serviços e avaliações
- **Cliente:** perfil privado com necessidades de cuidado
- Edição de perfil com foto, bio, especialidades e certificações
- Seletor de Estado + Cidade integrado à API do IBGE

### Pagamento
- PIX: QR Code gerado dinamicamente com confirmação simulada em 10 segundos
- Cartão de crédito/débito: validação Luhn + detecção de bandeira Visa/Mastercard
- CVV ocultado — nenhum dado de pagamento é armazenado

### Avaliações
- Clientes podem avaliar prestadores de 1 a 5 estrelas com comentário
- Uma avaliação por cliente/prestador (atualizável)
- Média calculada em tempo real via Firestore

### Segurança
- Credenciais Firebase em variáveis de ambiente (`.env`)
- Sanitização de todos os campos de texto (remoção de `<>`)
- Limite de comprimento em campos de entrada
- Stars de avaliação validadas no intervalo 1–5

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + React Router v6 |
| Estilo | Tailwind CSS |
| Ícones | lucide-react |
| Banco de dados | Firebase Firestore |
| Autenticação Google | Firebase Auth |
| Persistência local | localStorage (híbrido) |
| Municípios | API pública do IBGE |
| Build | Vite |
| Deploy | Netlify |

---

## Como rodar localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/Migsrs/Vinculum.git
cd Vinculum
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz com suas credenciais do Firebase:
```
VITE_FIREBASE_API_KEY=sua_chave
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id
```

### 4. Rodar em desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:5173`

---

## Usuários de demonstração

Ao iniciar, o app carrega automaticamente usuários e serviços de exemplo.

### Prestadores
| Nome | Email | Senha | Especialidade |
|---|---|---|---|
| Ana Souza | ana@nurse.com | 123 | Acompanhamento Geriátrico |
| Carlos Ferreira | carlos@onco.com | 123 | Teleassistência |
| Patrícia Lima | patricia@fisio.com | 123 | Fisioterapia |
| Marcos Oliveira | marcos@cuidador.com | 123 | Cuidador 24h |
| Júlia Mendes | julia@nutri.com | 123 | Nutrição Clínica |
| Roberto Costa | roberto@to.com | 123 | Terapia Ocupacional |
| Fernanda Rocha | fernanda@psico.com | 123 | Psicologia |

### Cliente
| Nome | Email | Senha |
|---|---|---|
| Paciente Demo | paciente@demo.com | 123 |

---

## Estrutura do projeto

```
src/
├── components/
│   ├── layout.jsx          # AppBar, BottomTabs, navegação
│   ├── ui.jsx              # Button, Card, Input, SearchBar
│   └── StateCitySelect.jsx # Seletor Estado + Cidade (IBGE)
├── pages/
│   ├── HomePage.jsx        # Landing + carrossel de destaques
│   ├── AuthPages.jsx       # Login, Cadastro, Google OAuth
│   ├── ServicesPages.jsx   # Listagem, filtro, CRUD de serviços
│   ├── ProfilePages.jsx    # Conta, edição de perfil, perfil público
│   ├── ContactsPage.jsx    # Página de contato
│   └── PaymentPage.jsx     # PIX e cartão de crédito/débito
├── services/
│   ├── firestoreUsers.js   # Operações de usuário no Firestore
│   ├── firestoreServices.js
│   └── firestoreReviews.js
├── utils/
│   ├── storage.js          # localStorage helpers
│   ├── seeds.js            # Dados iniciais + categorias
│   └── security.js         # Hash, sanitização, rate limiting
├── hooks/
│   └── useSession.js
├── firebase.js             # Inicialização Firebase (usa .env)
└── App.jsx                 # Rotas e inicialização
```

---

## Regras de acesso

| Ação | Permissão |
|---|---|
| Visualizar serviços | Público |
| Buscar e filtrar | Público |
| Ver perfil público do prestador | Público |
| Entrar em contato / Contratar | Usuário logado |
| Adicionar serviço | Prestador logado |
| Editar / Excluir serviço | Prestador dono do serviço |
| Avaliar prestador | Cliente logado |
| Editar perfil | Usuário logado (próprio perfil) |

---

## Fluxos principais

**Prestador:**
1. Cadastra-se como Prestador
2. Preenche perfil (especialidades, certificações, cidade)
3. Adiciona serviços com categoria, descrição e preço/hora
4. Recebe avaliações de clientes
5. Divulga link público: `/p/nome-sobrenome`

**Cliente:**
1. Busca e filtra serviços por categoria ou texto
2. Visualiza perfil público do prestador
3. Faz login para contratar ou entrar em contato
4. Realiza pagamento via PIX ou cartão
5. Avalia o prestador após o atendimento

---

## Roadmap

- [ ] Chat em tempo real entre cliente e prestador
- [ ] Agendamento de sessões com calendário
- [ ] Notificações push
- [ ] Upload de documentos e certificações
- [ ] Moderação e verificação de perfis
- [ ] Acessibilidade (WAI-ARIA)
- [ ] SEO com metatags dinâmicas
