
import { Pracownik } from '../employee/model';

export interface ZusSkladkiPracownik {
  emerytalna: number;
  rentowa: number;
  chorobowa: number;
  suma: number;
}

export interface ZusSkladkiPracodawca {
  emerytalna: number;
  rentowa: number;
  wypadkowa: number;
  fp: number;
  fgsp: number;
  suma: number;
}

export interface BaseCalculationResult {
  netto: number;
  brutto: number;
  podstawaZus: number;
  zusPracownik: ZusSkladkiPracownik;
  zdrowotna: number;
  podstawaZdrowotna: number;
  pit: number;
  podstawaPit: number;
  kup: number;
  stawkaPit: number;
}

export interface WynikWariantuStandard extends BaseCalculationResult {
  zusPracodawca: ZusSkladkiPracodawca;
  kosztPracodawcy: number;
}

export interface WynikWariantuPodzial {
  zasadnicza: BaseCalculationResult & {
      zusPracodawca: ZusSkladkiPracodawca;
      nettoGotowka: number;
  };
  swiadczenie: {
    brutto: number;
    netto: number;
    zaliczka: number;
    kup: number;
  };
  pit: {
    lacznyPrzychod: number;
    podstawa: number;
    kup: number;
    kupOdZasadniczej: number;
    kupOdSwiadczenia: number;
    stawka: number;
    kwota: number;
    kwotaOdZasadniczej: number;
    kwotaOdSwiadczenia: number;
  };
  kosztPracodawcy: number;
  nettoCalkowite: number;
  doWyplatyGotowka: number;
  doWyplatySwiadczenie: number;
  doWyplaty: number;
}

export interface WynikPracownika {
  pracownik: Pracownik;
  standard: WynikWariantuStandard;
  podzial: WynikWariantuPodzial;
  oszczednosc: number;
}

export interface PodsumowanieWynikow {
  sumaKosztStandard: number;
  sumaKosztPodzial: number;
  sumaBruttoSwiadczen: number;
  oszczednoscBrutto: number;
  prowizja: number;
  oszczednoscNetto: number;
  oszczednoscRoczna: number;
  sredniaOszczednoscNaEtat: number;
}

export interface GlobalneWyniki {
  szczegoly: WynikPracownika[];
  podsumowanie: PodsumowanieWynikow;
}
