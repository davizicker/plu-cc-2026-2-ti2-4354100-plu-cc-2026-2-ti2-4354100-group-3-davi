import type { Project } from "@/types";

// Ordem cronológica (do mais antigo ao mais recente). Para adicionar um projeto,
// copie um bloco, coloque o print em public/projects/ e ajuste os campos.
export const projects: Project[] = [
  {
    id: "adacct",
    year: 2023,
    name: "ADACCT — checagem de contas do Active Directory",
    description: {
      pt: "Ferramenta em Python que confere e-mails e hashes de senha das contas do Active Directory no banco do HaveIBeenPwned, para descobrir quais usuários tiveram dados vazados. Criei com minha outra conta do GitHub (I506dk) e mantenho este espelho no meu perfil principal.",
      en: "Python tool that checks Active Directory account emails and password hashes against HaveIBeenPwned to find which users have exposed data. I built it under my other GitHub account (I506dk) and keep this mirror on my main profile.",
    },
    highlights: [
      { pt: "Lê os e-mails dos usuários direto do Active Directory", en: "Reads user emails straight from Active Directory" },
      { pt: "Consulta a API do HaveIBeenPwned e confere hashes NTLM", en: "Queries the HaveIBeenPwned API and checks NTLM hashes" },
      { pt: "Mostra os comprometidos na tela ou envia por e-mail", en: "Shows compromised accounts on screen or sends them by email" },
    ],
    technologies: ["Python", "Active Directory", "Segurança"],
    repoUrl: "https://github.com/davizicker/ADACCT",
    media: "/projects/adacct.svg",
  },
  {
    id: "puc-cc",
    year: 2026,
    name: "Meus projetos do curso de Ciência da Computação",
    description: {
      pt: "Repositório pessoal onde guardo o que produzo na PUC Minas: listas de exercícios em C++, Algoritmos e Estruturas de Dados, Matemática Discreta, DIW, TI1, projeto extensionista e mentoria de carreira — organizado por período.",
      en: "Personal repository where I keep what I produce at PUC Minas: C++ exercise lists, Algorithms and Data Structures, Discrete Math, Web Interfaces, TI1, an outreach project and career mentoring — organized by semester.",
    },
    highlights: [
      { pt: "1º e 2º períodos documentados, com exercícios, tarefas e projetos", en: "1st and 2nd semesters documented, with exercises, assignments and projects" },
      { pt: "Mostra minha evolução do básico de programação até aplicações web", en: "Shows my progress from programming basics to web applications" },
    ],
    technologies: ["C++", "HTML", "CSS", "JavaScript", "Git"],
    repoUrl: "https://github.com/davizicker/PUC_MINAS_CC",
    media: "/projects/puc-cc.svg",
  },
  {
    id: "av1-diw",
    year: 2026,
    name: "AV1 — Página de perfil (DIW)",
    description: {
      pt: "Primeira avaliação de Desenvolvimento de Interfaces Web na PUC Minas: uma página de perfil em HTML e CSS puros, com cabeçalho, foto, lista de hobbies, link externo e rodapé.",
      en: "First Web Interface Development assessment at PUC Minas: a profile page in plain HTML and CSS with header, photo, hobby list, external link and footer.",
    },
    technologies: ["HTML", "CSS"],
    repoUrl: "https://github.com/davizicker/AV1-DIW",
    media: "/projects/av1-diw.png",
  },
  {
    id: "painel-dipe",
    year: 2026,
    name: "Painel DIPE — leitura de atos com OCR",
    description: {
      pt: "Painel para ler e revisar atos de pessoal publicados no Diário Oficial, usando OCR em Python e interface em React, e gerar laudas automaticamente. Evoluiu com dezenas de correções e testes para acertar casos reais de formatação do Diário.",
      en: "Dashboard to read and review personnel acts published in the Official Gazette, using Python OCR and a React interface, and to generate reports automatically. It evolved through dozens of fixes and tests to handle real-world formatting cases.",
    },
    highlights: [
      { pt: "Backend em Python com OCR e API; frontend em React + TypeScript", en: "Python backend with OCR and API; React + TypeScript frontend" },
      { pt: "Testes automatizados e documentação de cada correção", en: "Automated tests and documentation of every fix" },
      { pt: "Publicação configurada para a Render (Docker + site estático)", en: "Deployment configured for Render (Docker + static site)" },
    ],
    technologies: ["React", "TypeScript", "Python", "OCR", "Docker"],
    repoUrl: "https://github.com/davizicker/anderson",
    private: true,
    media: "/projects/painel-dipe.svg",
  },
  {
    id: "lacuna",
    year: 2026,
    name: "Lacuna — startup de diagnóstico e matching",
    description: {
      pt: "Ideia de startup que detecta falhas de mercado e conecta empresas com problemas a métodos, ferramentas e especialistas que os resolvem. Montei o mapa do negócio e um site de conceito navegável, com demo de diagnóstico, simulador de receita, roadmap e checklist.",
      en: "A startup idea that spots market gaps and connects companies with problems to the methods, tools and specialists that solve them. I built the business map and a navigable concept site with a diagnosis demo, revenue simulator, roadmap and checklist.",
    },
    highlights: [
      { pt: "Jornada do cliente em 7 etapas, do problema ao resultado medido", en: "7-step customer journey, from problem to measured result" },
      { pt: "Demo de diagnóstico e matching + mapa de demanda local", en: "Diagnosis & matching demo + local demand map" },
      { pt: "Modelo de negócio, personas, concorrência, riscos e métricas", en: "Business model, personas, competition, risks and metrics" },
    ],
    technologies: ["HTML", "CSS", "JavaScript"],
    repoUrl: "https://github.com/davizicker/STARTUP",
    private: true,
    media: "/projects/lacuna.png",
  },
  {
    id: "portal-sre",
    year: 2026,
    name: "Portal / Painel SRE Metropolitana A",
    description: {
      pt: "Dashboard institucional que substitui uma planilha de atalhos usada como página inicial de um setor e hoje atende vários setores, cada um com seu espaço próprio. Tudo é editável pelo próprio site: grupos, sistemas, cores, ícones e links.",
      en: "Institutional dashboard that replaces a spreadsheet of shortcuts used as a department's home page and now serves several departments, each with its own space. Everything is editable on the site itself: groups, systems, colors, icons and links.",
    },
    highlights: [
      { pt: "Login protegido com três papéis (diretor, coordenador e servidor) e acesso isolado por setor", en: "Protected login with three roles (director, coordinator, staff) and per-department access" },
      { pt: "Cadastro de contas com aprovação, verificação por e-mail e regras de segurança no banco (RLS)", en: "Account sign-up with approval, email verification and database security rules (RLS)" },
      { pt: "Calculadora de pagamento e leitor do Diário Oficial de MG com PDF e OCR", en: "Payroll calculator and a Minas Gerais Official Gazette reader using PDF parsing and OCR" },
      { pt: "Catálogo de ferramentas liberadas por setor, busca rápida e tema claro/escuro", en: "Tool catalog enabled per department, quick search and light/dark theme" },
    ],
    technologies: ["JavaScript", "Supabase", "PostgreSQL", "Edge Functions", "HTML", "CSS"],
    repoUrl: "https://github.com/davizicker/jerf",
    private: true,
    extraLinks: [{ label: "Painel (versão mais recente)", url: "https://github.com/nte2coord-dev/PAINEL-METROPOLITANA" }],
    media: "/projects/portal-sre.png",
  },
  {
    id: "portfolio",
    year: 2026,
    name: "Este portfólio",
    description: {
      pt: "O site que você está vendo: bilíngue, com tema claro/escuro, timeline interativa e formulário de contato funcional.",
      en: "The site you're looking at: bilingual, light/dark theme, interactive timeline and a working contact form.",
    },
    technologies: ["Next.js", "TypeScript", "Tailwind", "Framer Motion"],
    repoUrl: "https://github.com/davizicker/plu-cc-2026-2-ti2-4354100-plu-cc-2026-2-ti2-4354100-group-3-davi",
    media: "/projects/portfolio.png",
  },
];
