import { usersApi } from './api';
import i18n from "../i18n";

export function clearStoredAuth() {
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("authUser");
  } catch {
    // ignore
  }
}

export async function validateSessionWithBackend(): Promise<{ user: any; newAccessToken?: string } | 'network_error' | null> {
  try {
    const data = await usersApi.me();
    // api.ts automatically refreshes and stores the new access token if needed.
    // It will be available in localStorage.
    const newAccessToken = localStorage.getItem('accessToken') || undefined;
    return { user: data, newAccessToken };
  } catch (err: any) {
    if (err.message === 'Session expired. Please log in again.' || err.message.includes('401')) {
      return null;
    }
    return 'network_error';
  }
}

