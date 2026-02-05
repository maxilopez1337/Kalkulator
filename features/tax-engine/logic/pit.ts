
import { Config } from '../../../entities/company/model';

// Helper: Zaokrąglenie do pełnych złotych (Ordynacja Podatkowa Art. 63 § 1)
// "Końcówki kwot wynoszące mniej niż 50 groszy pomija się, a końcówki wynoszące 50 i więcej groszy podwyższa się do pełnych złotych."
const roundTotal = (val: number) => Math.round(val);

export const obliczPit = (podstawa: number, pit2Kwota: string, ulgaMlodych: boolean, stawkaProcentowa: number, config: Config): number => {
  if (ulgaMlodych) return 0;
  
  // 1. Podstawa opodatkowania zaokrąglona do pełnych złotych
  // Podstawa wchodzi tutaj już jako (Przychód - KUP - ZUS), ale jeszcze niezaokrąglona
  const podstawaZaokraglona = roundTotal(podstawa);
  
  // 2. Obliczenie podatku (Stawka 12% lub 32%)
  let pit = podstawaZaokraglona * (stawkaProcentowa / 100);
  
  // 3. Odjęcie kwoty zmniejszającej (PIT-2)
  // Standardowo 300 zł miesięcznie (przy złożonym PIT-2 dla jednego etatu)
  const kwotaZmniejszajaca = parseFloat(pit2Kwota) || 0;
  if (kwotaZmniejszajaca > 0) {
    pit = pit - kwotaZmniejszajaca;
  }
  
  // 4. Wynik nie może być ujemny (Zaliczka nie może być mniejsza od 0)
  pit = Math.max(0, pit);

  // 5. Finalne zaokrąglenie zaliczki do pełnych złotych (zgodnie z Ordynacją)
  return roundTotal(pit);
};
