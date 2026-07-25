export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-6">
      <p className="text-center text-[12px] text-zinc-500 dark:text-zinc-500">
        {currentYear} Carlos José Castro Galante y Matías Edgardo Tula Sarquis. Todos los derechos reservados.
      </p>
    </footer>
  );
}
