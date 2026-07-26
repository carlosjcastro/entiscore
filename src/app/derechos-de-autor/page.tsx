import Link from "next/link";
import type { Metadata } from "next";
import { HiArrowLeft } from "react-icons/hi2";

export const metadata: Metadata = {
  title: "Derechos de autor",
  description: "Aviso de propiedad intelectual sobre el nombre, diseño, identidad de marca y código fuente de Entiscore.",
  alternates: { canonical: "https://entiscore.vercel.app/derechos-de-autor" },
};

export default function DerechosDeAutorPage() {
  const currentYear = new Date().getFullYear();

  return (
    <main className="flex-1 px-4 py-12 sm:py-16 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex items-center gap-3 mb-10">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            <HiArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
            Derechos de autor
          </h1>
        </div>

        <div className="flex flex-col gap-6 text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">
          <p>
            El nombre Entiscore, el diseño visual, la paleta de colores, la identidad de marca y el código fuente del proyecto son propiedad de Carlos José Castro Galante y Matías Edgardo Tula Sarquis. {currentYear}. Todos los derechos reservados.
          </p>

          <p>
            Queda prohibida su reproducción, distribución o uso comercial sin autorización expresa de sus autores. Cualquier uso no autorizado de los elementos protegidos de este proyecto puede dar lugar a las acciones legales correspondientes.
          </p>

          <p className="text-[13px] text-zinc-500 dark:text-zinc-500 border-t border-zinc-200 dark:border-zinc-700 pt-4">
            Este aviso tiene carácter informativo y no constituye asesoramiento legal formal. Su propósito es declarar la autoría del proyecto y los derechos asociados.
          </p>
        </div>
      </div>
    </main>
  );
}
