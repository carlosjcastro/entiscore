import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi2";

export default function AcercaDePage() {
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
            Acerca de Entiscore
          </h1>
        </div>

        <div className="flex flex-col gap-8 text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">
          <section>
            <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
              Qué es Entiscore
            </h2>
            <p>
              Entiscore es un agente que analiza la presencia digital de un sitio o portfolio y evalúa qué tan reconocible es esa persona o proyecto como entidad legítima para buscadores y sistemas de inteligencia artificial. Lo hace a través de cuatro ejes: datos estructurados, consistencia de identidad, señales de autoridad y accesibilidad técnica.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
              A quién está dirigido
            </h2>
            <p>
              A cualquier profesional con presencia online que quiera entender y mejorar cómo lo interpretan los buscadores y los sistemas de inteligencia artificial. No solo desarrolladores: cualquier persona con un portfolio, un perfil profesional o un sitio propio.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
              Qué problema resuelve
            </h2>
            <p>
              Hoy no existe una herramienta simple y gratuita para auditar esto. La información sobre schema markup y SEO técnico está dispersa, es técnica, y no está pensada para que alguien sin conocimiento profundo pueda entender qué le falta a su propia presencia digital ni por qué importa.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
              Propósito del proyecto
            </h2>
            <p>
              Entiscore nació como parte del hackathon Kiro powered by AWS organizado por Código Facilito, pero está pensado para seguir existiendo más allá de esa instancia, como una herramienta de uso real y continuo.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
