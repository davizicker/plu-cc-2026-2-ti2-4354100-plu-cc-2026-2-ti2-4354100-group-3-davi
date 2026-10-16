import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Davi Zicker — Portfólio",
  description: "Portfólio de Davi Zicker, estudante de Ciência da Computação na PUC Minas. Projetos, experiências e contato.",
  openGraph: { title: "Davi Zicker — Portfólio", description: "Estudante de Ciência da Computação · PUC Minas · Belo Horizonte", type: "website", locale: "pt_BR", images: ["/images/davi.jpg"] },
  icons: { icon: "/favicon.svg" },
};
export const viewport: Viewport = { themeColor: "#0B2A5B" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
