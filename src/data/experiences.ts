import type { Experience } from "@/types";

// TODO: adicione estágios, freelas, eventos e contribuições open source reais.
export const experiences: Experience[] = [
  {
    id: "puc",
    institution: "PUC Minas",
    role: { pt: "Graduando em Ciência da Computação", en: "Computer Science undergraduate" },
    period: { pt: "Em andamento", en: "In progress" },
    description: {
      pt: "Estudo algoritmos, estruturas de dados, desenvolvimento web e trabalho em equipe em projetos integradores.",
      en: "Studying algorithms, data structures, web development and teamwork in integrated projects.",
    },
    type: "academico",
  },
  {
    id: "cotemig",
    institution: "Colégio COTEMIG Barroca",
    role: { pt: "Técnico em Informática", en: "IT Technician" },
    period: { pt: "Concluído em 2024", en: "Completed in 2024" },
    description: {
      pt: "Base em programação, banco de dados, redes e manutenção de computadores.",
      en: "Foundation in programming, databases, networking and computer maintenance.",
    },
    type: "academico",
  },
  {
    id: "freela-video",
    institution: "Freelas",
    role: { pt: "Edição de vídeos e materiais visuais", en: "Video editing and visual materials" },
    period: { pt: "Projetos pontuais", en: "One-off projects" },
    description: {
      pt: "Edição com Filmora 9 e criação de peças no Canva. (TODO: confirme/ajuste este item)",
      en: "Editing with Filmora 9 and design in Canva. (TODO: confirm/adjust this item)",
    },
    type: "freela",
  },
];
