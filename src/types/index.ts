export type Lang = "pt" | "en";
export type Bi = Record<Lang, string>;

export interface Project {
  id: string;
  year: number;
  name: string;
  description: Bi;
  technologies: string[];
  repoUrl: string;
  liveUrl?: string;
  media: string;
}

export type ExperienceType = "academico" | "estagio" | "freela" | "opensource" | "evento";

export interface Experience {
  id: string;
  institution: string;
  role: Bi;
  period: Bi;
  description: Bi;
  type: ExperienceType;
}
