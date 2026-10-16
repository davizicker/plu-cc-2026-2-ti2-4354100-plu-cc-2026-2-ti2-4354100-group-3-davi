import type { Project } from "@/types";

// Ordem cronológica (do mais antigo ao mais recente). Para adicionar um projeto,
// copie um bloco, coloque o print em public/projects/ e ajuste os campos.
export const projects: Project[] = [
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
