
import { Config } from '../../entities/company/model';

export const DEFAULT_CONFIG: Config = {
  zus: {
    uop: {
      pracownik: { emerytalna: 9.76, rentowa: 1.50, chorobowa: 2.45 },
      pracodawca: { emerytalna: 9.76, rentowa: 6.50, wypadkowa: 1.67, fp: 2.45, fgsp: 0.10 }
    },
    uz: {
      pracownik: { emerytalna: 9.76, rentowa: 1.50, chorobowa: 2.45 },
      pracodawca: { emerytalna: 9.76, rentowa: 6.50, wypadkowa: 1.67, fp: 2.45, fgsp: 0.10 }
    },
    zdrowotna: 9.00
  },
  pit: {
    prog1Limit: 120000,
    prog1Stawka: 12,
    prog2Stawka: 32,
    kwotaWolnaRoczna: 30000,
    kwotaZmniejszajacaMies: 300,
    kupStandard: 250,
    kupPodwyzszone: 300,
    uzKupProc: 20,
    uzKupAutorskie: 50,
    ulgaMlodziMaxWiek: 26,
    ulgaMlodziLimitRoczny: 85528,
    fpZwolnienieWiekKobieta: 55,
    fpZwolnienieWiekMezczyzna: 60
  },
  placaMinimalna: {
    brutto: 4806, // Nowa stawka na 2026
    netto: 3605.85 // Wyliczone netto dla 4806 brutto
  },
  minimalnaKwotaUZ: {
    zasadniczaNetto: 2028.80 // Waloryzacja proporcjonalna dla modelu Podział
  },
  swiadczenie: {
    stawkaPit: 12,
    odplatnosc: 1.00
  },
  prowizja: {
    standard: 28,
    plus: 26
  }
};
