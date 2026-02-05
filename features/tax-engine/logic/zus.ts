
import { Config } from '../../../entities/company/model';
import { ZusSkladkiPracownik, ZusSkladkiPracodawca } from '../../../entities/calculation/model';

// Helper: Zaokrąglenie do groszy (Zasada matematyczna: 0.005 -> 0.01)
// Zgodne z algorytmem ZUS Płatnik dla poszczególnych składek.
const roundCurrency = (val: number) => Math.round(val * 100) / 100;

export const obliczZusPracownik = (brutto: number, typUmowy: string, trybSkladek: string, choroboweAktywne: boolean, config: Config): ZusSkladkiPracownik => {
  // Student (<26 lat) na UZ lub Zbieg tytułów -> Brak składek społecznych pracownika
  if (trybSkladek === 'STUDENT_UZ' || trybSkladek === 'INNY_TYTUL') {
    return { emerytalna: 0, rentowa: 0, chorobowa: 0, suma: 0 };
  }
  
  const stawki = typUmowy === 'UOP' ? config.zus.uop.pracownik : config.zus.uz.pracownik;
  
  // WAŻNE: Każdy składnik liczymy i zaokrąglamy osobno! Nie sumujemy stawek procentowych.
  const emerytalna = roundCurrency(brutto * (stawki.emerytalna / 100));
  const rentowa = roundCurrency(brutto * (stawki.rentowa / 100));
  
  let chorobowa = 0;
  if (typUmowy === 'UOP') {
    // Na UoP chorobowa jest obowiązkowa
    chorobowa = roundCurrency(brutto * (stawki.chorobowa / 100));
  } else if (typUmowy === 'UZ') {
    // Na UZ chorobowa jest dobrowolna
    if (choroboweAktywne && trybSkladek !== 'BEZ_CHOROBOWEJ') {
      chorobowa = roundCurrency(brutto * (stawki.chorobowa / 100));
    }
  }
  
  // Suma to wynik dodawania zaokrąglonych składników (a nie zaokrąglenie sumy iloczynów)
  return { emerytalna, rentowa, chorobowa, suma: roundCurrency(emerytalna + rentowa + chorobowa) };
};

export const obliczZusPracodawca = (
    brutto: number, 
    typUmowy: string, 
    trybSkladek: string, 
    stawkaWypadkowa: number, 
    naliczajFP: boolean, 
    naliczajFGSP: boolean, 
    config: Config
): ZusSkladkiPracodawca => {
  // Student (<26 lat) na UZ -> Brak składek ZUS pracodawcy
  // Zbieg tytułów -> Zazwyczaj brak społecznych (tylko zdrowotna z pensji pracownika), pracodawca 0
  if (trybSkladek === 'STUDENT_UZ' || trybSkladek === 'INNY_TYTUL') {
    return { emerytalna: 0, rentowa: 0, wypadkowa: 0, fp: 0, fgsp: 0, suma: 0 };
  }
  
  const stawki = typUmowy === 'UOP' ? config.zus.uop.pracodawca : config.zus.uz.pracodawca;
  
  // WAŻNE: Zaokrąglenia per składnik
  const emerytalna = roundCurrency(brutto * (stawki.emerytalna / 100));
  const rentowa = roundCurrency(brutto * (stawki.rentowa / 100));
  const wypadkowa = roundCurrency(brutto * (stawkaWypadkowa / 100));
  
  let fp = 0;
  let fgsp = 0;
  
  // FP i FGŚP są naliczane zależnie od wieku i płci (flagi z useEmployeeActions)
  if (naliczajFP) {
    fp = roundCurrency(brutto * (stawki.fp / 100));
  }
  
  if (naliczajFGSP) {
    fgsp = roundCurrency(brutto * (stawki.fgsp / 100));
  }
  
  const suma = roundCurrency(emerytalna + rentowa + wypadkowa + fp + fgsp);

  return { emerytalna, rentowa, wypadkowa, fp, fgsp, suma };
};

export const obliczZdrowotna = (podstawa: number, trybSkladek: string, config: Config): number => {
  // Student UZ -> 0 zł zdrowotnej
  if (trybSkladek === 'STUDENT_UZ') return 0;
  
  // Każdy inny przypadek (Pełne, Inny Tytuł, Emeryt) -> 9%
  // Zdrowotna jest liczona od podstawy wymiaru (Brutto - Składki Społeczne Pracownika)
  return roundCurrency(podstawa * (config.zus.zdrowotna / 100));
};
