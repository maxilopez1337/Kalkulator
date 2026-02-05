
import { Config } from '../../entities/company/model';

export const obliczWiek = (dataUrodzenia: string) => {
  const dzis = new Date();
  const urodziny = new Date(dataUrodzenia);
  let wiek = dzis.getFullYear() - urodziny.getFullYear();
  const miesiacRoznica = dzis.getMonth() - urodziny.getMonth();
  if (miesiacRoznica < 0 || (miesiacRoznica === 0 && dzis.getDate() < urodziny.getDate())) {
    wiek--;
  }
  return wiek;
};

export const czyZwolnionyZFpFgsp = (dataUrodzenia: string, plec: string, config: Config) => {
  const wiek = obliczWiek(dataUrodzenia);
  if (plec === 'K' && wiek >= config.pit.fpZwolnienieWiekKobieta) return true;
  if (plec === 'M' && wiek >= config.pit.fpZwolnienieWiekMezczyzna) return true;
  return false;
};
