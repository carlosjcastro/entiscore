import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi2";

export default function TerminosDeUsoPage() {
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
            Términos de uso
          </h1>
        </div>

        <div className="flex flex-col gap-6 text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">
          <p>
            Al utilizar Entiscore, aceptas las siguientes condiciones de uso del servicio.
          </p>

          <section>
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
              Disponibilidad del servicio
            </h2>
            <p>
              Entiscore se ofrece en su estado actual, sin garantías de disponibilidad continua ni de funcionamiento ininterrumpido. El servicio puede modificarse, suspenderse o discontinuarse en cualquier momento sin aviso previo.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
              Naturaleza de los resultados
            </h2>
            <p>
              Los resultados del análisis son orientativos y no constituyen asesoramiento profesional de SEO, marketing digital ni legal. Las recomendaciones generadas, incluyendo las producidas por inteligencia artificial, deben considerarse como sugerencias generales que cada usuario evalúa bajo su propio criterio.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
              Responsabilidad del usuario
            </h2>
            <p>
              El usuario es responsable del uso que le da a la información proporcionada por Entiscore y al código generado por el asistente de inteligencia artificial. La implementación de cualquier sugerencia es decisión y responsabilidad exclusiva del usuario.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
              Uso apropiado
            </h2>
            <p>
              El servicio está pensado para que cada persona analice su propia presencia digital o la de proyectos bajo su responsabilidad. No se debe utilizar para analizar sitios de terceros sin autorización si eso implicara un uso indebido de la información obtenida.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
              Modificaciones
            </h2>
            <p>
              Estos términos pueden actualizarse en el futuro. El uso continuado del servicio después de una actualización implica la aceptación de los términos modificados.
            </p>
          </section>

          <p className="text-[13px] text-zinc-500 dark:text-zinc-500 border-t border-zinc-200 dark:border-zinc-700 pt-4">
            Este documento no reemplaza asesoramiento legal profesional. Su propósito es establecer las condiciones básicas de uso de una herramienta gratuita y experimental.
          </p>
        </div>
      </div>
    </main>
  );
}
