import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comparar dos sitios",
  description: "Compara la madurez de entidad digital de dos URLs lado a lado y descubre cuál tiene mejor presencia ante buscadores e IA.",
  alternates: { canonical: "https://entiscore.vercel.app/comparar" },
};

export default function CompararLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
