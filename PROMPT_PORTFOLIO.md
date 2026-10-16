# Prompt — Portfólio Profissional do Davi (Laboratório 01 · DIW · PUC Minas)

> Copie tudo abaixo da linha `---` e cole na IA (Claude Code, Cursor, v0, etc.) dentro do repositório vazio.
> Antes de colar, troque os itens marcados com `TODO` pelos seus dados reais (projetos, experiências, links).

---

Você é um desenvolvedor front-end sênior e designer de interfaces. Construa **do zero, neste repositório**, o site de **portfólio profissional** de **Davi Furtado de Lacerda Zicker**, atendendo exatamente ao enunciado do *Laboratório 01 – Portfólio Profissional (DIW, PUC Minas, prof. João Paulo Carneiro Aramuni)*. O site deve ser **moderno, bonito, muito interativo, responsivo e acessível**, com identidade visual coerente com o perfil de estudante de Ciência da Computação.

## 1. Requisitos obrigatórios do enunciado

O site tem **menu de navegação** com 4 seções/páginas:

1. **Sobre Mim** — breve apresentação em **português e inglês** (alternância PT/EN por botão), destacando formação, área de atuação, interesses e objetivos profissionais.
2. **Projetos** — **linha do tempo (timeline) dinâmica**, do mais antigo ao mais recente. Cada projeto contém: nome e descrição; tecnologias utilizadas; link do repositório no GitHub; imagem ou GIF do projeto em funcionamento (telas, login, interações).
3. **Experiências** — profissionais, estágios, freelas, projetos open source ou eventos técnicos. Cada item: empresa/instituição, cargo ou atividade, período e breve descrição.
4. **Contato** — ícones clicáveis (e-mail, WhatsApp, LinkedIn, GitHub, etc.) **e** formulário (nome, e-mail, mensagem) com **envio real por e-mail** (EmailJS) e **validações**.

Além disso: design responsivo (mobile-first), cabeçalho + rodapé + área de conteúdo, hospedagem gratuita na nuvem (Vercel) e **README completo** (ver seção 8).

## 2. Stack (use exatamente esta)

- **Next.js 14+ (App Router) + TypeScript**
- **Tailwind CSS** + **shadcn/ui** (componentes base)
- **Framer Motion** (animações, transições de página, scroll reveal, timeline)
- **React Hook Form + Zod** (validação do formulário)
- **EmailJS** (`@emailjs/browser`) para enviar e-mail direto do front-end
- **next-themes** (modo claro/escuro)
- **lucide-react** + **react-icons** (ícones, incl. WhatsApp/LinkedIn/GitHub)
- **Three.js via @react-three/fiber** *(opcional, só no hero e com fallback leve para mobile / `prefers-reduced-motion`)*
- Internacionalização **simples e sem biblioteca pesada**: dicionários `pt.ts` / `en.ts` + `LanguageContext` com persistência em `localStorage`.
- Deploy: **Vercel**. Controle de versão: GitHub.

## 3. Dados do Davi (use como conteúdo real)

**Nome:** Davi Furtado de Lacerda Zicker — **Estudante de Ciência da Computação**
**Contato:** (31) 98383-2972 · davizicker9@gmail.com · Belo Horizonte/MG
**Foto:** `public/images/davi.jpg` (o usuário coloca o arquivo; use `next/image` com `priority` e um placeholder caso não exista)
**Disponibilidade:** após 13h
**Idiomas:** Português (fluente), Inglês (intermediário), Espanhol (intermediário)

**Objetivo profissional:** Atuar em apoio administrativo e tecnológico, contribuindo com atendimento ao público, organização de documentos, apoio em sistemas, conferência de informações e elaboração de planilhas.

**Perfil:** Estudante de Ciência da Computação, com formação técnica em Informática e interesse em rotinas administrativas digitais. Perfil comunicativo, responsável e atento a detalhes, com disposição para apoiar equipes em organização documental, acompanhamento de demandas, uso de sistemas e melhoria de controles.

**Formação (timeline):**
- Ciência da Computação — PUC Minas (em andamento)
- Técnico em Informática — Colégio COTEMIG Barroca — 2024
- Colégio Sebrae — 2022 a 2023
- Colégio Marista Dom Silvério — 2014 a 2022

**Qualificações e cursos:** Datilografia; Canva; Microsoft Word; Excel básico; PowerPoint; edição de vídeos com Filmora 9; noções de manutenção de computadores; noções de HTML, CSS, JavaScript, Python, MySQL e C#.

**Competências:** organização de documentos, informações e controles internos; atenção a detalhes e facilidade para seguir procedimentos; conferência de dados, registros, prazos e pendências; boa comunicação, responsabilidade, discrição e disposição para aprender; facilidade com sistemas, aplicativos e ferramentas digitais.

**Ferramentas / Skills (com nível 0–100 para barras animadas):** HTML, CSS, JavaScript, Python, MySQL, C#, Word, Excel, PowerPoint, Canva, Filmora 9, manutenção de PCs.

**Projetos (`TODO` — substituir pelos reais; mantenha 3–5, ordem cronológica crescente):** crie `src/data/projects.ts` com o tipo abaixo e preencha com projetos reais das disciplinas/curso técnico (ex.: projeto do TCC do COTEMIG, trabalhos de TI2/DIW, etc.). Para cada um: `id`, `year`, `name`, `description {pt,en}`, `technologies[]`, `repoUrl`, `media` (imagem ou GIF em `public/projects/`), `liveUrl?`. Use placeholders claramente marcados `TODO` caso eu ainda não tenha os dados.

**Experiências (`TODO`):** crie `src/data/experiences.ts` com `institution`, `role {pt,en}`, `period`, `description {pt,en}`, `type` (`estagio | freela | opensource | evento | academico`). Inclua ao menos a experiência acadêmica/técnica (COTEMIG e PUC Minas) e deixe espaço para eu adicionar estágios/eventos.

## 4. Identidade visual

- **Paleta (baseada no currículo):** azul-marinho profundo `#0B2A5B` (primário), azul médio `#1E4FA8`, azul claro `#8FB4F0` (linhas/detalhes), fundo branco `#FFFFFF` / cinza muito claro `#F5F8FE`; no modo escuro: fundo `#070E1F`, superfícies `#0E1A36`, texto `#E8EEFB`. Acento opcional ciano `#22D3EE` para hovers/CTAs. Defina tudo como **CSS variables** (tokens) e integre ao tema do Tailwind/shadcn.
- **Tipografia:** títulos em fonte sans condensada/bold (ex.: *Barlow Condensed* ou *Space Grotesk*), texto em *Inter*, via `next/font`. Títulos de seção em CAIXA ALTA com sublinhado fino azul claro (remete ao currículo).
- **Estilo:** limpo, profissional, cantos arredondados, sombras suaves, glassmorphism sutil no header, grid generoso, bom contraste (WCAG AA).

## 5. Interatividade (o que torna o site "wow")

- **Hero** com foto do Davi em moldura animada, texto com efeito *typewriter* alternando papéis ("Estudante de Ciência da Computação", "Técnico em Informática", "Apoio administrativo e tecnológico"), botões CTA (Ver projetos / Baixar currículo / Contato) e fundo com partículas ou gradiente animado (leve, desligado com `prefers-reduced-motion`).
- **Header fixo** com blur, indicador animado da seção ativa (scroll-spy), menu hambúrguer animado no mobile, **toggle PT/EN** e **toggle claro/escuro**. Barra de progresso de rolagem no topo.
- **Transições** suaves entre seções/páginas e *scroll-reveal* (Framer Motion `whileInView`).
- **Sobre Mim:** cartão com foto, texto bilíngue (troca animada ao alternar idioma), contadores animados (ex.: anos de estudo, tecnologias, projetos), barras de skills animadas, cartões de idiomas e ferramentas com hover 3D (tilt).
- **Projetos:** timeline **vertical** (desktop alternando esquerda/direita; mobile linear) gerada dinamicamente a partir de `projects.ts`, ordenada do mais antigo ao mais recente; linha que "desenha" ao rolar; cada card com mídia (GIF/imagem), badges das tecnologias, botão **GitHub**; clique abre **modal/lightbox** com detalhes e a mídia ampliada. Filtro por tecnologia (chips).
- **Experiências:** cartões em grid/timeline com ícone por tipo, período, filtro por tipo e expansão (accordion) da descrição.
- **Contato:** ícones grandes clicáveis (mailto, `https://wa.me/5531983832972`, LinkedIn, GitHub) com hover animado + botão "copiar e-mail" com toast; formulário com feedback visual (loading, sucesso, erro) e confete/animação no sucesso.
- Micro-interações: cursor customizado discreto (apenas desktop), botões magnéticos, botão "voltar ao topo", *skeletons* no carregamento.
- Acessibilidade: navegação por teclado, `aria-*`, foco visível, `alt` em todas as imagens, `lang` do `<html>` atualizado conforme idioma, respeito a `prefers-reduced-motion`.

## 6. Formulário de contato (funcional)

- Campos: **nome**, **e-mail**, **mensagem** (+ honeypot anti-spam oculto).
- Validação com **Zod + React Hook Form**: nome ≥ 2 caracteres; e-mail válido; mensagem entre 10 e 1000 caracteres; mensagens de erro traduzidas (PT/EN); botão desabilitado durante envio.
- Envio via **EmailJS** usando variáveis de ambiente `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`. Forneça `.env.example` e **nunca** commite `.env.local`.
- Estados: idle / enviando / sucesso / erro, com toast. Limite simples de reenvio (ex.: 1 envio a cada 30 s via `localStorage`).

## 7. Estrutura de diretórios esperada

```
.
├── README.md
├── PROMPT_PORTFOLIO.md
├── .env.example
├── .gitignore
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── docs/
│   ├── wireframes/            # prints do Figma (home, sobre, projetos, experiências, contato; desktop + mobile)
│   └── screenshots/           # prints/GIF do site final
├── public/
│   ├── images/davi.jpg
│   ├── projects/              # imagens e GIFs dos projetos
│   └── curriculo-davi-zicker.pdf
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx           # compõe as seções
    │   ├── globals.css        # tokens (CSS variables) e estilos base
    │   └── not-found.tsx
    ├── components/
    │   ├── layout/            # Header, Footer, MobileMenu, ScrollProgress, BackToTop
    │   ├── sections/          # Hero, About, Projects, Experiences, Contact
    │   ├── ui/                # componentes shadcn/ui
    │   └── shared/            # Timeline, ProjectCard, ProjectModal, SkillBar, LanguageToggle, ThemeToggle, SocialLinks, SectionTitle
    ├── context/LanguageContext.tsx
    ├── data/                  # projects.ts, experiences.ts, skills.ts, education.ts, social.ts
    ├── i18n/                  # pt.ts, en.ts
    ├── hooks/                 # useScrollSpy, useMediaQuery, useReducedMotion
    ├── lib/                   # utils.ts, emailjs.ts, validators.ts (schemas Zod)
    └── types/index.ts
```

## 8. README.md (obrigatório — use o template do professor)

Siga o template: <https://github.com/joaopauloaramuni/desenvolvimento-de-interfaces-web/blob/main/TEMPLATES/template_README.md>. O README final deve conter:

- Título, descrição do projeto e objetivo;
- **Imagens dos protótipos/wireframes** (Figma, média fidelidade) em `docs/wireframes/`;
- **Tecnologias utilizadas** e **dependências/bibliotecas/frameworks** (lista com versão e para que servem);
- **Estrutura de diretórios** (a árvore acima, atualizada);
- **Instruções de instalação e execução local** (`git clone`, `npm install`, `cp .env.example .env.local`, `npm run dev`, `npm run build`);
- Como configurar o **EmailJS** (passo a passo curto);
- Funcionalidades implementadas por seção e **screenshots/GIFs** do site em funcionamento;
- **Decisões de design e arquitetura** (para a apresentação final);
- **Link do site publicado** (Vercel) e do repositório;
- Autor, licença.

## 9. Plano de entrega por sprint (siga esta ordem e faça commits pequenos e descritivos, em português, no padrão Conventional Commits)

**Lab01S01 – Planejamento e prototipação (4 pts)**
1. README inicial; estrutura do projeto; instalar dependências.
2. Gerar wireframes de média fidelidade no **Figma** (todas as páginas, desktop + mobile) e salvar prints em `docs/wireframes/`.
3. Protótipo do front-end: **layout principal** (Header, Footer, área de conteúdo), navegação entre seções, tema e tokens.

**Lab01S02 – Funcionalidades principais (4 pts)**
4. Sobre Mim bilíngue (PT/EN) + Hero.
5. Projetos com timeline dinâmica + modal.
6. Experiências organizadas com filtro.
7. Contato com ícones e formulário funcional (EmailJS) + validações + responsividade.
8. Preview em ambiente temporário (Vercel Preview).

**Lab01S03 – Hospedagem e finalização (7 pts)**
9. Deploy completo na **Vercel** (variáveis de ambiente configuradas), domínio `*.vercel.app`.
10. Ajustes visuais/usabilidade, performance (Lighthouse ≥ 90 em todas as categorias), SEO (metadata, Open Graph, favicon), imagens/GIFs dos projetos em execução.
11. README final com link publicado, instruções de uso/desenvolvimento, prints.

## 10. Critérios de qualidade (a avaliação considera)

- Qualidade do site: visual, responsividade (360px → 1440px+), conteúdo e funcionalidades;
- Organização do repositório e clareza do README;
- Alinhamento com protótipos e funcionalidades definidas;
- Funcionamento da hospedagem na nuvem.

## 11. Regras de execução para você (IA)

- Entregue **código completo e funcionando**, sem pseudo-código; rode `npm run lint` e `npm run build` e corrija todos os erros antes de finalizar.
- Não invente dados pessoais além dos fornecidos; onde faltar informação, use placeholders **explicitamente marcados com `TODO`** e liste ao final o que eu preciso preencher.
- Não use bibliotecas além das listadas sem justificar.
- Todo texto visível deve existir em **PT e EN**.
- Ao terminar, me entregue: (1) resumo do que foi feito, (2) lista de `TODO`s pendentes, (3) passo a passo para configurar EmailJS e fazer deploy na Vercel.

Comece pela sprint **Lab01S01**: crie a estrutura do projeto, configure Tailwind/shadcn/tokens, implemente Header/Footer/layout e navegação, e me mostre antes de seguir para a próxima sprint.
