import { cookies } from "next/headers";
import type { Locale } from "./types";

const LOCALE_COOKIE_NAME = "entiscore-locale";

export async function getServerLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME);
    if (localeCookie?.value === "en") return "en";
    return "es";
  } catch {
    return "es";
  }
}
