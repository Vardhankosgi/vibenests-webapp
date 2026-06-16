import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { buildWhatsAppWaMeLink } from "@/lib/whatsapp";



type BotIntent = "live_chat" | "enquiry" | "menu" | "booking" | "payment";

type MenuAction = {
  id: string;
  label: string;
  intent: BotIntent;
  description?: string;
};

const DEFAULT_WHATSAPP_E164_DIGITS = "+919000201011";

function WhatsAppIcon(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.11 18.15c-.52-.25-1.54-.76-1.78-.84-.24-.08-.41-.25-.58.25-.17.5-.67.84-.83 1.01-.16.17-.33.19-.85-.02-.52-.21-2.2-.8-4.2-3.19-.35-.43-.68-.95-.45-1.36.22-.41.46-.67.66-.93.2-.26.27-.43.41-.72.14-.29.07-.56-.03-.78-.1-.22-.89-2.06-1.22-2.82-.32-.76-.65-.66-.89-.67-.24-.01-.5-.01-.76-.01-.26 0-.67.1-1.02.49-.35.39-1.34 1.31-1.34 3.2 0 1.89 1.37 3.71 1.56 3.98.19.27 2.69 4.1 6.52 5.59.91.36 1.62.58 2.17.74.91.26 1.74.22 2.4.13.73-.11 2.25-.92 2.57-1.81.32-.89.32-1.65.22-1.81-.1-.16-.35-.25-.87-.5z" />
      <path d="M16 3C8.82 3 3 8.82 3 16c0 2.77.86 5.32 2.33 7.44L4 29l5.67-1.33A12.93 12.93 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 24C9.93 27 5 22.07 5 16S9.93 5 16 5s11 4.93 11 11-4.93 11-11 11z" />
    </svg>
  );
}

import { useEffect, useRef } from "react";
import { chatAnswer } from "@/lib/llm";

type ChatRole = "user" | "assistant";

type ChatMsg = {
  id: string;
  role: ChatRole;
  text: string;
  actions?: {
    label: string;
    path: string;
    requiresAuth?: boolean;
  }[];
};


export default function FloatingWhatsAppBot() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);

  const welcome = useMemo(
    () => [
      t("whatsappbot.title", "Vibenests Support"),
      t(
        "whatsappbot.welcome",
        "Hi! I’m VibeNests assistant. Ask me about booking a suite, availability, packages, or payments."
      ),
    ],
    [t]
  );

  useEffect(() => {
    if (!open) return;
    setMessages((prev) => {
      if (prev.length) return prev;
      return [
        { id: crypto.randomUUID(), role: "assistant", text: welcome[1] },
      ];
    });
  }, [open, welcome]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  const handleActionClick = (path: string, requiresAuth?: boolean) => {
    const token = localStorage.getItem("token");

    if (requiresAuth && !token) {
      window.location.href = "/login";
      return;
    }

    window.location.href = path;
  };

  const getDefaultQuickActions = () =>
    [
      // Navigates to the page section where users can browse suites (matches app UX)
      { label: "View Suites", path: "/user/dashboard" },
      // Navigates to the special offers page
      { label: "Offers", path: "/user/dashboard" },
      // Navigates to booking flow (auth-protected)
      { label: "Book Now", path: "/user/dashboard", requiresAuth: true },
      { label: "Contact Us", path: "/contact" },
    ] as const;

  async function onSend() {

    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMsg = { id: crypto.randomUUID(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const replyText = await chatAnswer(text);
      const botMsg: ChatMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: replyText,
        actions: [...getDefaultQuickActions()],
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e: any) {
      const errText = e?.message || "Sorry—something went wrong. Please try again.";
      const botMsg: ChatMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: `${errText}\n\nIf this keeps happening, you can still contact support via WhatsApp.`,
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {open && (
        <div
          className="w-[360px] max-w-[90vw] rounded-3xl glass-card border border-white/10 shadow-2xl overflow-hidden"
          role="dialog"
          aria-label="VibeNests chat"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center">
                <WhatsAppIcon className="h-5 w-5 text-gold" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-foreground">{t("whatsappbot.title", "Vibenests Support")}</p>
                <p className="text-[11px] text-muted-foreground">{t("whatsappbot.subtitle", "Instant replies")}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 transition"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div
              ref={listRef}
              className="h-[320px] max-h-[50vh] overflow-y-auto space-y-2 pr-1"
            >
              {messages.length === 0 ? (
                <div className="rounded-2xl bg-black/30 border border-white/10 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("whatsappbot.prompt", "Ask me anything about booking & payments.")}
                  </p>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={
                      m.role === "user"
                        ? "flex justify-end"
                        : "flex justify-start"
                    }
                  >
                    <div className="max-w-[85%]">
                      <div
                        className={
                          m.role === "user"
                            ? "rounded-2xl bg-[var(--gold)]/15 border border-[var(--gold)]/30 px-3 py-2"
                            : "rounded-2xl bg-black/30 border border-white/10 px-3 py-2"
                        }
                      >
                        <p
                          className={
                            m.role === "user"
                              ? "text-xs text-foreground whitespace-pre-wrap"
                              : "text-xs text-muted-foreground whitespace-pre-wrap"
                          }
                        >
                          {m.text}
                        </p>
                      </div>

                      {m.role === "assistant" && m.actions?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {m.actions.map((action) => (
                            <button
                              key={action.path + action.label}
                              type="button"
                              onClick={() => handleActionClick(action.path, action.requiresAuth)}
                              className="rounded-full border border-yellow-500 px-4 py-2 text-sm hover:bg-yellow-500 hover:text-white"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-black/30 border border-white/10 px-3 py-2">
                    <p className="text-xs text-muted-foreground">Typing…</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 items-center">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("whatsappbot.inputPlaceholder", "Type your question…")}
                className="luxury-input flex-1 rounded-2xl px-3 py-2 text-sm bg-black/40"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSend();
                }}
              />
              <button
                type="button"
                onClick={onSend}
                disabled={loading || !input.trim()}
                className="h-10 w-10 rounded-2xl bg-gold text-black font-semibold disabled:opacity-60"
                aria-label="Send"
              >
                ➤
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground">
              {t("whatsappbot.disclaimer", "Replies are generated automatically. For urgent issues, contact support.")}
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-14 w-14 rounded-3xl bg-gold flex items-center justify-center shadow-[0_0_28px_rgba(212,160,60,0.35)] border border-gold/40 hover:opacity-95 transition"
        aria-label="Open support chat"
      >
        <WhatsAppIcon className="h-7 w-7 text-[oklch(0.12_0.02_260)]" />
      </button>
    </div>
  );
}


