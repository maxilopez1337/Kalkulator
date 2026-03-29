import { Config } from '../../../entities/company/model';

// Helper: Zaokrąglenie do pełnych złotych (Ordynacja Podatkowa Art. 63 § 1)
// "Końcówki kwot wynoszące mniej niż 50 groszy pomija się, a końcówki wynoszące 50 i więcej groszy podwyższa się do pełnych złotych."
const roundTotal = (val: number) => Math.round(val);

/**
 * Miesięczna zaliczka PIT z uwzględnieniem narastającego przekroczenia progu.
 * Używana w analizie rocznej (StepAnalizaPracownika).
 *
 * @param dochod           - dochód (podstawa PIT) w bieżącym miesiącu
 * @param narastajaceBefore - suma dochodów narastająco PRZED bieżącym miesiącem
 * @param p1Limit          - roczny limit I progu (np. 120 000)
 * @param p1Rate           - stawka I progu jako ułamek (np. 0.12)
 * @param p2Rate           - stawka II progu jako ułamek (np. 0.32)
 * @param kzp              - kwota zmniejszająca zaliczkę w zł/mies (np. 300)
 */
export const calcPitMiesiac = (
  dochod: number,
  narastajaceBefore: number,
  p1Limit: number,
  p1Rate: number,
  p2Rate: number,
  kzp: number
): number => {
  const b = Math.round(Math.max(0, dochod));
  let tax: number;
  if (narastajaceBefore < p1Limit) {
    const space = p1Limit - narastajaceBefore;
    tax = b <= space ? b * p1Rate : space * p1Rate + (b - space) * p2Rate;
  } else {
    tax = b * p2Rate;
  }
  return Math.max(0, Math.round(tax - kzp));
};

export const obliczPit = (
  podstawa: number,
  pit2Kwota: string,
  ulgaMlodych: boolean,
  stawkaProcentowa: number,
  _config: Config
): number => {
  // UWAGA: Ulga dla młodych (do 26 lat) — limit roczny 85 528 PLN (art. 21 ust. 1 pkt 148 UPDOF).
  // Kalkulator pracuje w trybie miesięcznym i nie śledzi narastającego przychodu rocznego.
  // Przy rocznych zarobkach > 85 528 PLN użytkownik musi ręcznie wyłączyć ulgę w miesiącu
  // przekroczenia limitu.
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
