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

let refreshPromise: Promise<any> | null = null;

export async function validateSessionWithBackend(accessToken: string): Promise<{ role: string; newAccessToken?: string } | null> {
  const lang = i18n.language || localStorage.getItem("i18nextLng") || "en";
  const shortLang = lang.split("-")[0].toLowerCase();

  try {
    let res = await fetch(`${BASE}/users/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Accept-Language": shortLang,
        "X-Locale": shortLang,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        if (!refreshPromise) {
          refreshPromise = fetch(`${BASE}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          }).then(async r => {
            if (r.ok) return r.json();
            throw new Error("Refresh failed");
          }).finally(() => {
            refreshPromise = null;
          });
        }
        
        try {
          const refreshData = await refreshPromise;
          if (refreshData.accessToken) {
            // Retry the original request with the new access token
            res = await fetch(`${BASE}/users/me`, {
              method: "GET",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "Accept-Language": shortLang,
                "X-Locale": shortLang,
                Authorization: `Bearer ${refreshData.accessToken}`,
              },
            });
            
            if (res.ok) {
              const data = await res.json();
              if (data?.role) {
                if (refreshData.refreshToken) {
                  localStorage.setItem("refreshToken", refreshData.refreshToken);
                }
                return { role: data.role, newAccessToken: refreshData.accessToken };
              }
            }
          }
        } catch {
          // Refresh failed
        }
      }
    }

    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.role) return null;
    return { role: data.role };
  } catch {
    return null;
  }
}

