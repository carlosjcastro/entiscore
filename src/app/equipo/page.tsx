import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi2";
import { FaGithub } from "react-icons/fa";

interface TeamMemberProps {
  name: string;
  role: string;
  githubUrl?: string;
}

function TeamMember({ name, role, githubUrl }: TeamMemberProps) {
  return (
    <div className="py-5 border-b border-zinc-200 dark:border-zinc-700 last:border-b-0">
      <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
        {name}
      </h3>
      <p className="mt-1 text-[14px] text-zinc-500 dark:text-zinc-400">
        {role}
      </p>
      {githubUrl && (
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-2 text-[13px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <FaGithub className="h-3.5 w-3.5" />
          GitHub
        </a>
      )}
    </div>
  );
}

export default function EquipoPage() {
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
            Equipo
          </h1>
        </div>

        <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mb-6">
          Entiscore fue construido por dos personas durante el hackathon Kiro powered by AWS de Código Facilito.
        </p>

        <div>
          <TeamMember
            name="Carlos José Castro Galante"
            role="Lógica del agente, integración con inteligencia artificial y arquitectura del proyecto."
            githubUrl="https://github.com/carlosjcastro"
          />
          <TeamMember
            name="Matías Edgardo Tula Sarquis"
            role="Diseño de interfaz y experiencia de usuario."
          />
        </div>
      </div>
    </main>
  );
}
