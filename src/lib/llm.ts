const BASE = 'https://api.vibenests.in';

function getContext(): any {
  // Keep it minimal; no tokens.
  try {
    const authUserRaw = localStorage.getItem('authUser');
    const authUser = authUserRaw ? JSON.parse(authUserRaw) : null;
    return {
      path: window.location.pathname,
      userRole: authUser?.role ?? null,
    };
  } catch {
    return { path: window.location.pathname, userRole: null };
  }
}

export async function chatAnswer(message: string): Promise<string> {
  const res = await fetch(`${BASE}/llm/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context: getContext() }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || 'Chat failed');
  }
  return data?.reply ?? '';
}

