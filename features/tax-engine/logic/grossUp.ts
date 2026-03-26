
import { Config } from '../../../entities/company/model';
import { Pracownik } from '../../../entities/employee/model';
import { obliczZusPracownik, obliczZdrowotna } from './zus';
import { obliczPit } from './pit';
import { BaseCalculationResult } from '../../../entities/calculation/model';
import { roundCurrency } from '../../../shared/utils/formatters';

const roundTotal = (val: number) => Math.round(val);

export type CalcParams = Pick<Pracownik, 'typUmowy' | 'trybSkladek' | 'choroboweAktywne' | 'pit2' | 'ulgaMlodych' | 'kupTyp' | 'pitMode'>;

export const obliczNettoZBrutto = (brutto: number, params: CalcParams, config: Config): BaseCalculationResult => {
  // 1. Brutto wejściowe zaokrąglone do 2 miejsc po przecinku
  const bruttoInput = roundCurrency(brutto);
  
  const { typUmowy, trybSkladek, choroboweAktywne, pit2, ulgaMlodych, kupTyp, pitMode } = params;
  
  // 2. ZUS Pracownika (Emerytalne, Rentowe, Chorobowe)
  const zusPracownik = obliczZusPracownik(bruttoInput, typUmowy, trybSkladek, choroboweAktywne, config);
  
  // 3. Podstawa składki zdrowotnej (Brutto - Suma składek społecznych)
  const podstawaZdrowotna = roundCurrency(bruttoInput - zusPracownik.suma);
  
  // 4. Składka zdrowotna (9% lub 0% dla studenta)
  const zdrowotna = obliczZdrowotna(podstawaZdrowotna, trybSkladek, config);
  
  // 5. Koszty Uzyskania Przychodu (KUP)
  let kup = config.pit.kupStandard;
  if (kupTyp === 'PODWYZSZONE') kup = config.pit.kupPodwyzszone;
  if (typUmowy === 'UZ') {
    const podstawaKup = roundCurrency(bruttoInput - zusPracownik.suma);
    if (kupTyp === 'PROC_50') {
      kup = roundCurrency(podstawaKup * (config.pit.uzKupAutorskie / 100));
    } else {
      kup = roundCurrency(podstawaKup * (config.pit.uzKupProc / 100));
    }
  }
  
  // 6. Podstawa Opodatkowania (PIT Basis)
  // Art. 26 ust. 1 ustawy PIT: Dochód = Przychód - Koszty - Składki ZUS
  // Art. 63 Ordynacji Podatkowej: Podstawę zaokrągla się do pełnych złotych
  const dochod = bruttoInput - zusPracownik.suma - kup;
  const podstawaPitWartosc = Math.max(0, dochod);
  const podstawaPitZaokr = roundTotal(podstawaPitWartosc);
  
  // 7. Ustalenie stawki podatku
  let stawkaPit = config.pit.prog1Stawka; // Domyślnie 12%

  if (pitMode === 'FLAT_12') {
      stawkaPit = config.pit.prog1Stawka;
  } else if (pitMode === 'FLAT_32') {
      stawkaPit = config.pit.prog2Stawka;
  } else if (pitMode === 'FLAT_0') {
      stawkaPit = 0;
  } else {
      // AUTO MODE (Standardowa skala)
      // FIX 2025: Standardowy kalkulator wynagrodzeń pokazuje wynik dla PIERWSZEGO miesiąca.
      // Nie sprawdzamy tutaj 'podstawa * 12', bo to sztucznie zawyża podatek dla wysokich zarobków w skali miesiąca.
      // 32% nalicza się dopiero po przekroczeniu 120 000 dochodu narastająco w roku.
      
      // Wyjątek: Jeśli miesięczna podstawa SAMA W SOBIE przekracza 120 000 zł (bardzo rzadkie),
      // to nadwyżka jest opodatkowana 32%. Tutaj dla uproszczenia (Single Month calc)
      // przyjmujemy 12% chyba że użytkownik wymusi FLAT_32.
      stawkaPit = config.pit.prog1Stawka;
  }

  // 8. Obliczenie zaliczki na podatek
  const pit = obliczPit(podstawaPitWartosc, pit2, ulgaMlodych, stawkaPit, config);
  
  // 9. Netto ("Na rękę")
  const netto = roundCurrency(bruttoInput - zusPracownik.suma - zdrowotna - pit);
  
  return { 
      netto, 
      brutto: bruttoInput, 
      zusPracownik, 
      zdrowotna, 
      pit, 
      kup, 
      podstawaPit: podstawaPitZaokr, 
      podstawaZdrowotna, 
      stawkaPit, 
      podstawaZus: bruttoInput 
  };
};

export const znajdzBruttoDlaNetto = (nettoDocelowe: number, params: CalcParams, config: Config): BaseCalculationResult => {
  const target = roundCurrency(nettoDocelowe);
  
  // 1. Zgrubne przybliżenie (Binary Search)
  let bruttoMin = target;
  let bruttoMax = target * 2.5; // Zwiększony margines bezpieczeństwa
  
  // Szybkie przybliżenie zgrubne (30 iteracji wystarczy dla dużej precyzji float)
  for (let i = 0; i < 30; i++) {
    const mid = (bruttoMin + bruttoMax) / 2;
    const res = obliczNettoZBrutto(mid, params, config);
    if (res.netto < target) bruttoMin = mid;
    else bruttoMax = mid;
  }
  
  // 2. Precyzyjne Skanowanie (Linear Scan)
  // Szukamy idealnego dopasowania co do grosza wokół znalezionego punktu.
  // Ze względu na schodkowy charakter podatku (zaokrąglenia do 1zł), 
  // wiele kwot brutto może dać to samo netto. Szukamy tej najkorzystniejszej (najniższej).
  
  const approx = (bruttoMin + bruttoMax) / 2;
  const scanRange = 5.0; // Skanujemy +/- 5 PLN wokół przybliżenia
  const start = Math.floor((approx - scanRange) * 100);
  const end = Math.ceil((approx + scanRange) * 100);
  
  let bestResult: BaseCalculationResult | null = null;
  let minDiff = Number.MAX_VALUE;

  // Iterujemy co 1 grosz
  for (let i = start; i <= end; i++) {
      const candidateBrutto = i / 100;
      if (candidateBrutto <= 0) continue;
      
      const res = obliczNettoZBrutto(candidateBrutto, params, config);
      const diff = Math.abs(res.netto - target);
      
      // Znaleziono idealne dopasowanie lub lepsze przybliżenie
      if (diff < minDiff) {
          minDiff = diff;
          bestResult = res;
      } 
      // Jeśli mamy już idealne dopasowanie (diff < 0.01), sprawdzamy czy obecne brutto
      // jest liczbą całkowitą (ładniejszy wynik) - opcjonalnie.
      // Tutaj: Zawsze bierzemy pierwsze trafienie od dołu (najniższe brutto dające to netto),
      // co jest najkorzystniejsze dla pracodawcy.
      else if (diff < 0.005 && minDiff < 0.005) {
          // Jeśli oba wyniki są "idealne" (różnica 0 groszy), zostawiamy ten, który znaleźliśmy wcześniej (niższy),
          // ponieważ pętla idzie od dołu (i++).
          continue;
      }
  }

  // Fallback: jeśli skanowanie nie znalazło nic (np. target ujemny lub błąd zakresu)
  if (!bestResult) {
      return obliczNettoZBrutto(roundCurrency(approx), params, config);
  }

  return bestResult;
};
