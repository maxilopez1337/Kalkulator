/**
 * Sprawdza czy konfiguracja podatkowa jest aktualna.
 * Wywołaj przy starcie aplikacji żeby ostrzec o przeterminowanych stawkach.
 */
export function validateConfigFreshness(config: { _metadata?: { validUntil?: string } }): {
  isValid: boolean;
  daysUntilExpiry: number;
  warning: string | null;
} {
  const validUntil = config._metadata?.validUntil;

  if (!validUntil) {
    return {
      isValid: true,
      daysUntilExpiry: Infinity,
      warning: null,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiryDate = new Date(validUntil);
  expiryDate.setHours(0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / msPerDay);

  if (daysUntilExpiry < 0) {
    return {
      isValid: false,
      daysUntilExpiry,
      warning: `Konfiguracja podatkowa jest przeterminowana od ${Math.abs(daysUntilExpiry)} dni (validUntil: ${validUntil}). Zaktualizuj stawki.`,
    };
  }

  if (daysUntilExpiry < 30) {
    return {
      isValid: true,
      daysUntilExpiry,
      warning: `Konfiguracja podatkowa wygasa za ${daysUntilExpiry} dni (${validUntil}). Rozważ aktualizację stawek.`,
    };
  }

  return {
    isValid: true,
    daysUntilExpiry,
    warning: null,
  };
}
