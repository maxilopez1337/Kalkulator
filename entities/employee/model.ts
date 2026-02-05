
export interface Pracownik {
  id: number;
  imie: string;
  nazwisko: string;
  dataUrodzenia: string;
  plec: 'K' | 'M';
  typUmowy: 'UOP' | 'UZ';
  trybSkladek: string;
  choroboweAktywne: boolean;
  pit2: string;
  ulgaMlodych: boolean;
  kupTyp: string;
  nettoDocelowe: number;
  nettoZasadnicza: number;
  pitMode: 'AUTO' | 'FLAT_0' | 'FLAT_12' | 'FLAT_32'; 
  skladkaFP: boolean;
  skladkaFGSP: boolean;
}
