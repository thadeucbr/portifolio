import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Thadeu Ramos | Senior Software Engineer & AI Systems Architect",
  description: "Portfólio de engenharia de plataformas distribuídas de missão crítica, segurança Zero Trust e ecossistemas de Inteligência Artificial no edge.",
  keywords: [
    "Thadeu Ramos",
    "Senior Software Engineer",
    "AI Systems Architect",
    "Zero Trust",
    "Agnostic Messaging Broker",
    "Transformers.js",
    "Next.js 16",
    "React 19"
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen bg-[#07090E] text-[#F8FAFC] font-sans antialiased selection:bg-[#1856FF]/30 selection:text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
