import { Pracownik } from '../../entities/employee/model';
import { Config } from '../../entities/company/model';
import { obliczWiek, czyZwolnionyZFpFgsp } from './dates';

export interface ImportRow {
  id: number;
  isValid: boolean;
  errors: string[];
  data: Pracownik | null;
  raw: unknown;
}

// --- HELPERY NORMALIZACJI ---

const normalizeDate = (val: unknown): string => {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString().split('T')[0];
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }
  const str = String(val).trim();
  if (str.includes('.')) {
    const parts = str.split('.');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  if (str.match(/^\d{2}-\d{2}-\d{4}/)) {
    // Format DD-MM-YYYY
    const parts = str.split('-');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  if (str.match(/^\d{4}-\d{2}-\d{2}/)) return str.substring(0, 10);
  return '';
};

const normalizeCurrency = (val: unknown): number => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;

  let str = String(val).trim();
  str = str.replace(/[^\d.,\s-]/g, '');
  str = str.replace(/\s/g, '').replace(/\u00A0/g, '');

  if (str.includes(',') && str.includes('.')) {
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      str = str.replace(/,/g, '');
    }
  } else if (str.includes(',')) {
    str = str.replace(',', '.');
  }

  const res = parseFloat(str);
  return isNaN(res) ? 0 : Math.round(res * 100) / 100;
};

// --- GŁÓWNA LOGIKA PARSOWANIA (OD WIERSZA 3) ---

export const parseExcelData = (rows: unknown[][], config: Config): ImportRow[] => {
  // Układ pliku:
  // Row 0: Nagłówki (Niebieskie)
  // Row 1: Przykłady (Żółte)
  // Row 2: PIERWSZY WIERSZ DANYCH (Indeks 2 w tablicy)

  if (rows.length < 3) return [];

  const dataRows = rows.slice(2); // Pobieramy wszystko od wiersza 3

  return dataRows
    .map((row, idx) => {
      if (!row || row.length === 0) return null;

      // Mapowanie sztywne kolumn A-K (indeksy 0-10)
      // A - Imie/ID, B - Data, C - Płeć, D - Umowa, E - ZUS, F - Netto, G - KUP, H - PIT2, I - Ulga, J - PIT
      const colA_Name = row[0];
      const colB_Date = row[1];
      const colC_Sex = row[2];
      const colD_Type = row[3];
      const colE_Zus = row[4];
      const colF_Netto = row[5];
      const colG_Kup = row[6];
      const colH_Pit2 = row[7];
      const colI_Ulga = row[8];
      const colJ_Pit = row[9];

      // Jeśli brak Imienia i Netto, pomijamy wiersz
      if (!colA_Name && !colF_Netto) return null;

      const errors: string[] = [];

      // 1. Imię i Nazwisko
      let imie = 'Pracownik';
      let nazwisko = `${idx + 1}`;
      const rawName = String(colA_Name || '').trim();
      if (rawName) {
        const parts = rawName.split(' ');
        if (parts.length >= 2) {
          imie = parts[0];
          nazwisko = parts.slice(1).join(' ');
        } else {
          imie = rawName;
          nazwisko = '';
        }
      }

      // 2. Data urodzenia / Wiek
      let dataUrodzenia = '1990-01-01';
      let isAgeInferred = false;
      if (colB_Date) {
        dataUrodzenia = normalizeDate(colB_Date);
        if (!dataUrodzenia || dataUrodzenia.length < 10) {
          dataUrodzenia = '1990-01-01';
          isAgeInferred = true;
        }
      } else {
        isAgeInferred = true;
      }
      const wiek = obliczWiek(dataUrodzenia);

      // 3. Płeć
      let plec: 'K' | 'M' = 'M';
      const rawSex = String(colC_Sex || '').toUpperCase();
      if (rawSex.includes('K')) plec = 'K';

      // 4. Rodzaj Umowy (v2.6.1: "Umowa o pracę" / "Umowa zlecenie")
      let typUmowy: 'UOP' | 'UZ' = 'UOP';
      const rawType = String(colD_Type || '').toUpperCase();
      if (rawType.includes('ZLEC') || rawType.includes('UZ')) {
        typUmowy = 'UZ';
      }

      // 5. Tryb Składek ZUS (v2.6.1: Mapowanie pełnych nazw z dropdowna)
      let trybSkladek = 'PELNE';
      let choroboweAktywne = true;

      const rawZus = String(colE_Zus || '').toUpperCase();

      // Exact matches for v2.6.1 Dropdowns
      if (rawZus.includes('BEZ DOBROWOLNEJ CHOROBOWEJ') || rawZus === 'BEZ CHOROBOWEJ') {
        trybSkladek = 'BEZ_CHOROBOWEJ';
        choroboweAktywne = false;
      } else if (
        rawZus.includes('STUDENT') ||
        rawZus.includes('UCZEŃ') ||
        rawZus.includes('BEZ ZUS')
      ) {
        trybSkladek = 'STUDENT_UZ';
        choroboweAktywne = false;
      } else if (rawZus.includes('INNY TYTUŁ') || rawZus.includes('TYLKO ZDROWOTNA')) {
        trybSkladek = 'INNY_TYTUL';
        choroboweAktywne = false;
      } else if (rawZus.includes('EMERYT') || rawZus.includes('RENCISTA')) {
        trybSkladek = 'EMERYT_RENCISTA';
        choroboweAktywne = true; // Emeryt płaci społeczne, ale bez FP/FGŚP (handled in useEmployeeActions/Import logic)
      } else if (rawZus.includes('PEŁNE SKŁADKI') || rawZus.includes('PELNE SKLADKI')) {
        // "Pełne składki" lub "Pełne składki z dobrowolną chorobową"
        trybSkladek = 'PELNE';
        choroboweAktywne = true;
      }

      // Wymuszenia dla UOP
      if (typUmowy === 'UOP') {
        trybSkladek = 'PELNE';
        choroboweAktywne = true;
      }

      // 6. Netto
      const netto = normalizeCurrency(colF_Netto);
      if (netto <= 0) errors.push('Netto <= 0');

      // 7. KUP (v2.6.1: Obsługa wartości procentowych i kwotowych)
      let kupTyp = 'STANDARD';
      const rawKup = String(colG_Kup || '').toUpperCase();

      if (typUmowy === 'UOP') {
        // Formuła Excela może zwrócić "250" jako string lub liczbę
        if (rawKup.includes('300') || rawKup.includes('PODWYŻ')) kupTyp = 'PODWYZSZONE';
        else kupTyp = 'STANDARD'; // Default 250
      } else {
        // UZ
        // Jeśli Excel zwrócił "0.2" dla 20% lub "0.5" dla 50%
        const valKup = parseFloat(rawKup);
        // Check for explicit "50%" or "0.5"
        if (rawKup.includes('50') || rawKup.includes('AUTOR') || valKup === 0.5) {
          kupTyp = 'PROC_50';
        } else {
          // Default UZ is 20% (matches "20%" or "0.2" from Formula)
          kupTyp = 'PROC_20';
        }
      }

      // 8. PIT-2 (Kwota zmniejszająca) — domyślna z konfiguracji
      let pit2 = String(config.pit.kwotaZmniejszajacaMies);
      const valPit2 = parseFloat(String(colH_Pit2));
      if (!isNaN(valPit2)) pit2 = String(valPit2);

      // 9. Ulga < 26 (v2.6.1: "TAK" / "NIE" z dropdowna)
      let ulgaMlodych = wiek < 26;
      const rawUlga = String(colI_Ulga || '').toUpperCase();
      if (rawUlga === 'TAK' || rawUlga === 'YES') ulgaMlodych = true;
      if (rawUlga === 'NIE' || rawUlga === 'NO') ulgaMlodych = false;

      // 10. Zaliczka PIT (Stawka)
      let pitMode: 'AUTO' | 'FLAT_0' | 'FLAT_12' | 'FLAT_32' = 'AUTO';
      const rawPit = String(colJ_Pit || '')
        .toUpperCase()
        .trim();

      if (rawPit.includes('32')) {
        pitMode = 'FLAT_32';
      } else if (rawPit.includes('12')) {
        pitMode = 'FLAT_12';
      } else if (
        rawPit === '0' ||
        rawPit === '0%' ||
        rawPit.includes('ZWOL') ||
        rawPit.includes('NIE')
      ) {
        pitMode = 'FLAT_0';
      }

      if (ulgaMlodych) {
        pitMode = 'FLAT_0';
        pit2 = '0';
      }

      // FP / FGŚP z wieku/płci
      const isExemptByAge = czyZwolnionyZFpFgsp(dataUrodzenia, plec, config);
      let skladkaFP = !isExemptByAge;
      let skladkaFGSP = !isExemptByAge;

      // Student/Inny tytuł nie płaci FP/FGŚP
      if (trybSkladek === 'STUDENT_UZ' || trybSkladek === 'INNY_TYTUL') {
        skladkaFP = false;
        skladkaFGSP = false;
      }

      // Emeryt/Rencista na UZ zazwyczaj nie płaci FP/FGŚP
      if (trybSkladek === 'EMERYT_RENCISTA') {
        skladkaFP = false;
        skladkaFGSP = false;
      }

      const finalData: Pracownik = {
        id: Date.now() + idx,
        imie,
        nazwisko,
        dataUrodzenia,
        plec,
        typUmowy,
        trybSkladek,
        choroboweAktywne,
        pit2,
        ulgaMlodych,
        kupTyp,
        nettoDocelowe: netto,
        nettoZasadnicza:
          typUmowy === 'UZ' ? config.minimalnaKwotaUZ.zasadniczaNetto : config.placaMinimalna.netto,
        pitMode,
        skladkaFP,
        skladkaFGSP,
      };

      return {
        id: finalData.id,
        isValid: errors.length === 0,
        errors,
        data: finalData,
        raw: { ...finalData, wiek, isAgeInferred },
      };
    })
    .filter(Boolean) as ImportRow[];
};
