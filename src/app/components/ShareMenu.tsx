"use client";

import { useState, useRef, useEffect } from "react";
import {
  HiShare,
  HiLink,
  HiEnvelope,
  HiCheck,
  HiEllipsisHorizontal,
} from "react-icons/hi2";
import { FaWhatsapp, FaXTwitter, FaLinkedinIn } from "react-icons/fa6";

interface ShareMenuProps {
  code: string;
  siteName: string;
  score: number;
}

function buildShareUrl(code: string): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://entiscore.vercel.app";
  return `${baseUrl}/r/${code}`;
}

function buildShareText(siteName: string, score: number): string {
  return `Analicé ${siteName} con Entiscore y obtuvo ${score}/100 en madurez de entidad digital.`;
}

export function ShareMenu({ code, siteName, score }: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [supportsNativeShare, setSupportsNativeShare] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const shareUrl = buildShareUrl(code);
  const shareText = buildShareText(siteName, score);

  useEffect(() => {
    setSupportsNativeShare(typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl);
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 2000);
  }

  function handleShareWhatsApp() {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(whatsappUrl, "_blank");
    setIsOpen(false);
  }

  function handleShareX() {
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(xUrl, "_blank");
    setIsOpen(false);
  }

  function handleShareLinkedIn() {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, "_blank");
    setIsOpen(false);
  }

  function handleShareEmail() {
    const subject = encodeURIComponent(`Resultado de Entiscore para ${siteName}`);
    const body = encodeURIComponent(`${shareText}\n\nVer el reporte completo: ${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    setIsOpen(false);
  }

  async function handleNativeShare() {
    try {
      await navigator.share({
        title: `Entiscore: ${siteName}`,
        text: shareText,
        url: shareUrl,
      });
    } catch {
      return;
    }
    setIsOpen(false);
  }

  return (
    <div ref={menuRef} className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-[12px] font-medium text-zinc-600 dark:text-zinc-300 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:shadow-sm active:scale-[0.98]"
      >
        <HiShare className="h-3.5 w-3.5" />
        Compartir
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-52 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1.5 shadow-lg">
          <button
            onClick={handleCopyLink}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            {isLinkCopied ? (
              <HiCheck className="h-4 w-4 text-emerald-500" />
            ) : (
              <HiLink className="h-4 w-4 text-zinc-400" />
            )}
            {isLinkCopied ? "Enlace copiado" : "Copiar enlace"}
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            <FaWhatsapp className="h-4 w-4 text-green-500" />
            WhatsApp
          </button>

          <button
            onClick={handleShareX}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            <FaXTwitter className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
            X (Twitter)
          </button>

          <button
            onClick={handleShareLinkedIn}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            <FaLinkedinIn className="h-4 w-4 text-blue-600" />
            LinkedIn
          </button>

          <button
            onClick={handleShareEmail}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            <HiEnvelope className="h-4 w-4 text-zinc-400" />
            Correo electrónico
          </button>

          {supportsNativeShare && (
            <button
              onClick={handleNativeShare}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              <HiEllipsisHorizontal className="h-4 w-4 text-indigo-500" />
              Más opciones
            </button>
          )}
        </div>
      )}
    </div>
  );
}
