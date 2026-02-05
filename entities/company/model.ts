
export interface Firma {
  nazwa: string;
  nip: string;
  adres?: string;
  kodPocztowy?: string;
  miasto?: string;
  email?: string;
  telefon?: string;
  osobaKontaktowa?: string;
  okres: string;
  stawkaWypadkowa: number;
}

export interface Config {
  zus: {
    uop: {
      pracownik: { emerytalna: number; rentowa: number; chorobowa: number };
      pracodawca: { emerytalna: number; rentowa: number; wypadkowa: number; fp: number; fgsp: number };
    };
    uz: {
      pracownik: { emerytalna: number; rentowa: number; chorobowa: number };
      pracodawca: { emerytalna: number; rentowa: number; wypadkowa: number; fp: number; fgsp: number };
    };
    zdrowotna: number;
  };
  pit: {
    prog1Limit: number;
    prog1Stawka: number;
    prog2Stawka: number;
    kwotaWolnaRoczna: number;
    kwotaZmniejszajacaMies: number;
    kupStandard: number;
    kupPodwyzszone: number;
    uzKupProc: number;
    uzKupAutorskie: number;
    ulgaMlodziMaxWiek: number;
    ulgaMlodziLimitRoczny: number;
    fpZwolnienieWiekKobieta: number;
    fpZwolnienieWiekMezczyzna: number;
  };
  placaMinimalna: {
    brutto: number;
    netto: number;
  };
  minimalnaKwotaUZ: {
    zasadniczaNetto: number;
  };
  swiadczenie: {
    stawkaPit: number;
    odplatnosc: number;
  };
  prowizja: {
    standard: number;
    plus: number;
  };
}
