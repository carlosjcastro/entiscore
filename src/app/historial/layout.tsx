import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Historial de análisis",
  description: "Revisa tus análisis anteriores, compara la evolución de tu presencia digital a lo largo del tiempo, y exporta reportes en JSON o PDF.",
  alternates: { canonical: "https://entiscore.vercel.app/historial" },
};

export default function HistorialLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
