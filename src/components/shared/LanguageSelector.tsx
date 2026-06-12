import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, ChevronDown } from "lucide-react";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी" },
  { code: "te", name: "తెలుగు" },
  { code: "ta", name: "தமிழ்" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "ml", name: "മലയാളം" },
  { code: "mr", name: "मराठी" },
  { code: "bn", name: "বাংলা" },
  { code: "gu", name: "ગુજરાતી" },
  { code: "pa", name: "ਪੰਜਾਬੀ" }
];

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const currentLang = LANGUAGES.find(l => i18n.language && i18n.language.startsWith(l.code)) || LANGUAGES[0];

  const handleLangChange = (code: string) => {
    i18n.changeLanguage(code).then(() => {
      window.location.reload();
    });
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--gold)]/20 hover:border-[var(--gold)]/50 transition bg-black/40 text-foreground text-sm font-medium focus:outline-none"
      >
        <Globe className="h-4 w-4 text-gold" />
        <span className="hidden sm:inline">{currentLang.name}</span>
        <span className="sm:hidden uppercase">{currentLang.code}</span>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-40 glass-card rounded-xl border border-[var(--gold)]/15 py-1 z-50 max-h-64 overflow-y-auto scrollbar-none shadow-xl">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => handleLangChange(l.code)}
                className={`flex items-center w-full px-4 py-2 text-sm text-left transition ${
                  i18n.language && i18n.language.startsWith(l.code)
                    ? "bg-gold/15 text-gold font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
