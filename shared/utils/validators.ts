
export const validateNIP = (nip: string) => {
  const digits = nip.replace(/\D/g, '');
  if (digits.length !== 10) return { valid: false, message: 'NIP musi mieć 10 cyfr' };
  
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * weights[i];
  }
  const checkDigit = sum % 11;
  if (checkDigit === 10) return { valid: false, message: 'NIP nieprawidłowy (suma kontrolna = 10)' };
  if (checkDigit !== parseInt(digits[9])) return { valid: false, message: 'NIP nieprawidłowy (błędna suma kontrolna)' };
  
  return { valid: true, message: 'NIP prawidłowy' };
};
