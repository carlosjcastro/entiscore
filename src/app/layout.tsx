import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { I18nProvider } from "@/i18n";
import { ToastProvider } from "./components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://entiscore.vercel.app";
const OG_IMAGE_PATH = "/docs/og-cover.png";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Entiscore: Auditor de Entidad Digital",
    template: "%s | Entiscore",
  },
  description:
    "Analiza tu presencia digital y descubre qué tan reconocible eres para buscadores e inteligencia artificial. Reporte con puntaje, hallazgos y plan de acción.",
  authors: [
    { name: "Carlos José Castro Galante" },
    { name: "Matías Edgardo Tula Sarquis" },
  ],
  openGraph: {
    type: "website",
    siteName: "Entiscore",
    locale: "es_AR",
    url: BASE_URL,
    title: "Entiscore: Auditor de Entidad Digital",
    description:
      "Analiza tu presencia digital y descubre qué tan reconocible eres para buscadores e inteligencia artificial.",
    images: [{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: "Entiscore, auditor de entidad digital" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Entiscore: Auditor de Entidad Digital",
    description:
      "Analiza tu presencia digital y descubre qué tan reconocible eres para buscadores e inteligencia artificial.",
    images: [{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: "Entiscore, auditor de entidad digital" }],
  },
  alternates: {
    canonical: BASE_URL,
  },
  other: {
    "author": "Carlos José Castro Galante, Matías Edgardo Tula Sarquis",
  },
};

const themeInitScript = `
(function(){
  var t=localStorage.getItem('entiscore-theme');
  if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){
    document.documentElement.classList.add('dark');
  }
})();
`;

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "Entiscore",
      url: BASE_URL,
      logo: `${BASE_URL}/logo/entiscore.png`,
      description:
        "Plataforma de auditoría de entidad digital que evalúa el reconocimiento de profesionales y proyectos ante buscadores e inteligencia artificial.",
      founder: [
        {
          "@type": "Person",
          name: "Carlos José Castro Galante",
          url: "https://github.com/carlosjcastro",
        },
        {
          "@type": "Person",
          name: "Matías Edgardo Tula Sarquis",
        },
      ],
      sameAs: [
        "https://github.com/carlosjcastro",
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${BASE_URL}/#application`,
      name: "Entiscore",
      url: BASE_URL,
      description:
        "Auditor de entidad digital que analiza la presencia online de profesionales y proyectos, evaluando su reconocimiento ante buscadores e inteligencia artificial.",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      datePublished: "2025-07-01",
      dateModified: new Date().toISOString().slice(0, 10),
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      creator: {
        "@id": `${BASE_URL}/#organization`,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <I18nProvider>
          <ToastProvider>
            <Navbar />
            <div className="flex-1 flex flex-col">{children}</div>
            <Footer />
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
