// Valida números de teléfono de EEUU: 10 dígitos, u 11 si empiezan con 1.
export function isValidUSPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
}

// Formatea progresivamente mientras se escribe: "(702) 468-9914".
export function formatUSPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  const len = digits.length;
  if (len === 0) return "";
  if (len < 4) return `(${digits}`;
  if (len < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// Link a WhatsApp para escribirle directamente al número (EEUU, código de país 1).
export function whatsappLink(value: string): string {
  const digits = value.replace(/\D/g, "");
  const withCountryCode = digits.length === 10 ? `1${digits}` : digits;
  return `https://wa.me/${withCountryCode}`;
}
