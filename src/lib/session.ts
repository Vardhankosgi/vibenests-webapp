import i18n from "../i18n";

const BASE = "http://localhost:4000";

export function clearStoredAuth() {
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("authUser");
  } catch {
    // ignore
  }
}

export async function validateSessionWithBackend(accessToken: string): Promise<{ role: string } | null> {
  const lang = i18n.language || localStorage.getItem("i18nextLng") || "en";
  const shortLang = lang.split("-")[0].toLowerCase();

  try {
    const res = await fetch(`${BASE}/users/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Accept-Language": shortLang,
        "X-Locale": shortLang,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.role) return null;
    return { role: data.role };
  } catch {
    return null;
  }
}

