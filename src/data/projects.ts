import type { Project } from "@/types";

// TODO: substitua pelos seus projetos reais (do mais antigo ao mais recente).
// Coloque prints/GIFs em public/projects/ e atualize o campo `media`.
export const projects: Project[] = [
  {
    id: "tcc-cotemig",
    year: 2024,
    name: "Projeto de conclusão — Técnico em Informática",
    description: {
      pt: "Sistema desenvolvido no COTEMIG Barroca para fechar o curso técnico: da ideia ao banco de dados, passando pelas telas e pelo login.",
      en: "System built at COTEMIG Barroca to close out the technical course: from the idea to the database, including screens and login.",
    },
    technologies: ["HTML", "CSS", "JavaScript", "MySQL"],
    repoUrl: "https://github.com/davizicker",
    media: "/projects/projeto-1.svg",
  },
  {
    id: "planilhas",
    year: 2025,
    name: "Controle de pendências e prazos",
    description: {
      pt: "Planilha automatizada para acompanhar demandas, prazos e pendências — foco em organização e conferência de dados.",
      en: "Automated spreadsheet to track requests, deadlines and pending items — focused on organization and data checking.",
    },
    technologies: ["Excel", "Python"],
    repoUrl: "https://github.com/davizicker",
    media: "/projects/projeto-2.svg",
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
    repoUrl: "https://github.com/davizicker",
    media: "/projects/projeto-3.svg",
  },
];
