export function normalizePhoneToWaMe(phone: string): string {
  // wa.me expects digits only, no +, spaces, dashes.
  return String(phone || "").replace(/\D/g, "");
}

export function buildWhatsAppWaMeLink(phoneE164Digits: string, text?: string): string {
  const phone = normalizePhoneToWaMe(phoneE164Digits);
  const base = `https://wa.me/${phone}`;
  if (!text) return base;
  const encoded = encodeURIComponent(text);
  return `${base}?text=${encoded}`;
}

