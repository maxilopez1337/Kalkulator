
import { Firma, Config } from '../company/model';
import { Pracownik } from '../employee/model';

export interface ZapisanaKalkulacja {
  id: string;
  dataUtworzenia: string; // ISO String
  nazwaFirmy: string;
  liczbaPracownikow: number;
  oszczednoscRoczna: number;
  dane: {
    firma: Firma;
    pracownicy: Pracownik[];
    config: Config;
    prowizjaProc: number;
  };
}
