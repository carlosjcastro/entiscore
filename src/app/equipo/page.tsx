"use client";

import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi2";
import { FaGithub } from "react-icons/fa";
import { useI18n } from "@/i18n";

interface TeamMemberProps {
  name: string;
  initials: string;
  role: string;
  githubUrl?: string;
}

function TeamMember({ name, initials, role, githubUrl }: TeamMemberProps) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/30 border-2 border-indigo-200 dark:border-indigo-800">
        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{initials}</span>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">{name}</h3>
        <p className="text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400 max-w-xs">{role}</p>
      </div>
      {githubUrl && (
        <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          <FaGithub className="h-4 w-4" />
          GitHub
        </a>
      )}
    </div>
  );
}

export default function EquipoPage() {
  const t = useI18n();

  return (
    <main className="flex-1 px-4 py-12 sm:py-16 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center gap-3 mb-12">
          <Link href="/" className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700">
            <HiArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-800 dark:text-zinc-100">{t.pages.team.title}</h1>
        </div>

        <p className="text-[14px] text-zinc-500 dark:text-zinc-400 text-center max-w-md mx-auto mb-10">{t.pages.team.intro}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="border-b sm:border-b-0 sm:border-r border-zinc-200 dark:border-zinc-700">
            <TeamMember name="Carlos José Castro Galante" initials="CC" role={t.pages.team.roleCarlos} githubUrl="https://github.com/carlosjcastro" />
          </div>
          <div>
            <TeamMember name="Matías Edgardo Tula Sarquis" initials="MT" role={t.pages.team.roleMatias} />
          </div>
        </div>
      </div>
    </main>
  );
}
