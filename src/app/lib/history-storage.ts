import type { AuditResponse, MaturityLevel } from "@/types";

const HISTORY_INDEX_KEY = "entiscore-history-index";
const REPORT_PREFIX = "entiscore-report-";
const COOKIE_CONSENT_KEY = "entiscore-cookie-consent";

export interface HistoryEntry {
  id: string;
  url: string;
  date: string;
  overallScore: number;
  maturityLevel: MaturityLevel;
}

function hasCookieConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
}

function generateEntryId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

export function getHistoryEntries(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(HISTORY_INDEX_KEY);
  if (!stored) return [];

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistoryIndex(entries: HistoryEntry[]) {
  localStorage.setItem(HISTORY_INDEX_KEY, JSON.stringify(entries));
}

export function saveAuditToHistory(report: AuditResponse) {
  if (!hasCookieConsent()) return;

  const entry: HistoryEntry = {
    id: generateEntryId(),
    url: report.url,
    date: report.timestamp,
    overallScore: report.overallScore,
    maturityLevel: report.maturityLevel,
  };

  const entries = getHistoryEntries();
  entries.unshift(entry);
  saveHistoryIndex(entries);

  localStorage.setItem(`${REPORT_PREFIX}${entry.id}`, JSON.stringify(report));
}

export function getFullReport(entryId: string): AuditResponse | null {
  const stored = localStorage.getItem(`${REPORT_PREFIX}${entryId}`);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as AuditResponse;
  } catch {
    return null;
  }
}

export function deleteHistoryEntry(entryId: string) {
  const entries = getHistoryEntries();
  const filtered = entries.filter((entry) => entry.id !== entryId);
  saveHistoryIndex(filtered);
  localStorage.removeItem(`${REPORT_PREFIX}${entryId}`);
}

export function clearAllHistory() {
  const entries = getHistoryEntries();
  for (const entry of entries) {
    localStorage.removeItem(`${REPORT_PREFIX}${entry.id}`);
  }
  localStorage.removeItem(HISTORY_INDEX_KEY);
}
