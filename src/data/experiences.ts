import type { Experience } from "@/types";

// TODO: adicione estágios, freelas, eventos e contribuições open source reais.
export const experiences: Experience[] = [
  {
    id: "sre-metropolitana-a",
    institution: "SRE Metropolitana A",
    role: { pt: "Estagiário", en: "Intern" },
    period: { pt: "Estágio atual", en: "Current internship" }, // TODO: ajuste o período (ex.: "mar/2026 – atual")
    description: {
      pt: "Estágio na Superintendência Regional de Ensino Metropolitana A, no apoio administrativo e tecnológico: organização de documentos, conferência de informações, planilhas e atendimento. Também desenvolvi o Portal/Painel interno do setor, que substituiu uma planilha de atalhos por um site com login, setores e ferramentas próprias.",
      en: "Internship at the Metropolitana A Regional Education Office, in administrative and technology support: document organization, information checking, spreadsheets and customer service. I also built the department's internal Portal/Dashboard, which replaced a spreadsheet of shortcuts with a site featuring login, departments and its own tools.",
    },
    type: "estagio",
  },
  {
    id: "bradock-games",
    institution: "Bradock dos Games (Instagram)",
    role: { pt: "Criador de conteúdo e vendedor", en: "Content creator & seller" },
    period: { pt: "Projeto pessoal", en: "Personal project" }, // TODO: ajuste o período
    description: {
      pt: "Perfil sobre games que começou como hobby e virou também um espaço para praticar vendas: divulgar produtos, atender o público, negociar e fechar com clientes. O foco continua sendo a comunidade gamer, mas me deu uma boa noção de comunicação, confiança e relacionamento com cliente.",
      en: "A gaming profile that started as a hobby and also became a place to practice sales: promoting products, serving the audience, negotiating and closing deals. The focus is still the gamer community, but it gave me a good sense of communication, trust and customer relationships.",
    },
    type: "criador",
  },
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
      pt: "Edição com Filmora 9 e criação de peças no Canva.",
      en: "Editing with Filmora 9 and design in Canva.",
    },
    type: "freela",
  },
];
