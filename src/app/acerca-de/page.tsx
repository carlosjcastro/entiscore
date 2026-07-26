import Link from "next/link";
import {
  HiArrowLeft,
  HiCodeBracketSquare,
  HiUser,
  HiShieldCheck,
  HiGlobeAlt,
  HiLightBulb,
  HiMagnifyingGlass,
} from "react-icons/hi2";

interface AxisFeatureProps {
  icon: typeof HiCodeBracketSquare;
  title: string;
  description: string;
}

function AxisFeature({ icon: Icon, title, description }: AxisFeatureProps) {
  return (
    <div className="flex gap-3 py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
      <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
      <div>
        <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{title}</h4>
        <p className="mt-0.5 text-[13px] text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
    </div>
  );
}

export default function AcercaDePage() {
  return (
    <main className="flex-1 px-4 py-12 sm:py-16 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex items-center gap-3 mb-12">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            <HiArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-800 dark:text-zinc-100">
            Acerca de Entiscore
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <HiMagnifyingGlass className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                Qué es Entiscore
              </h2>
            </div>
            <p className="text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">
              Un agente que analiza la presencia digital de un sitio o portfolio y evalúa qué tan reconocible es esa persona o proyecto como entidad legítima para buscadores y sistemas de inteligencia artificial, a través de cuatro ejes de evaluación.
            </p>

            <div className="mt-8">
              <AxisFeature
                icon={HiCodeBracketSquare}
                title="Datos estructurados"
                description="Schema markup que identifica quién eres ante buscadores e IA."
              />
              <AxisFeature
                icon={HiUser}
                title="Consistencia de identidad"
                description="Coherencia del nombre y perfiles entre múltiples fuentes."
              />
              <AxisFeature
                icon={HiShieldCheck}
                title="Señales de autoridad"
                description="Enlaces a plataformas profesionales, autoría y logros."
              />
              <AxisFeature
                icon={HiGlobeAlt}
                title="Accesibilidad técnica"
                description="Capacidad de crawlers e IA para acceder al contenido."
              />
            </div>
          </section>

          <div className="flex flex-col gap-10">
            <section>
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
                A quién está dirigido
              </h2>
              <p className="text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                A cualquier profesional con presencia online que quiera entender y mejorar cómo lo interpretan los buscadores y los sistemas de inteligencia artificial. No solo desarrolladores: cualquier persona con un portfolio, un perfil profesional o un sitio propio.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-3">
                <HiLightBulb className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                  Qué problema resuelve
                </h2>
              </div>
              <p className="text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                Hoy no existe una herramienta simple y gratuita para auditar esto. La información sobre schema markup y SEO técnico está dispersa, es técnica, y no está pensada para que alguien sin conocimiento profundo pueda entender qué le falta a su propia presencia digital ni por qué importa.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
                Propósito del proyecto
              </h2>
              <p className="text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                Entiscore nació como parte del hackathon Kiro powered by AWS organizado por Código Facilito, pero está pensado para seguir existiendo más allá de esa instancia, como una herramienta de uso real y continuo.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
