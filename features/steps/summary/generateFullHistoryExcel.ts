import { Firma } from '../../../entities/company/model';
import { GlobalneWyniki } from '../../../entities/calculation/model';
import { Pracownik } from '../../../entities/employee/model';
import { STANDARD_TABLE_CONFIG, SPLIT_TABLE_CONFIG } from '../results/excelTableConfigs';

declare global {
    interface Window {
        ExcelJS: any;
    }
}

interface GeneratorOptions {
    firma: Firma;
    pracownicy: Pracownik[];
    wyniki: GlobalneWyniki;
    prowizjaProc: number;
    activeModel: 'STANDARD' | 'PRIME';
}

const round = (val: number) => Math.round(val * 100) / 100;

export const generateFullHistoryExcel = async ({ firma, pracownicy, wyniki, prowizjaProc, activeModel }: GeneratorOptions) => {
    if (!window.ExcelJS) {
        alert('Biblioteka ExcelJS nie została załadowana.');
        return;
    }

    const Workbook = window.ExcelJS.Workbook;
    const workbook = new Workbook();

    const styles = {
        headerFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } },
        headerFont: { bold: true, size: 10, color: { argb: 'FF0F172A' } },
        strattonFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
        standardFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } },
        diffFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E1B4B' } },
        diffFont: { bold: true, color: { argb: 'FFFFFFFF' } },
        currency: '#,##0.00 "zł"',
        currencyPlain: '#,##0.00',
        center: { vertical: 'middle', horizontal: 'center' },
        sumsRowFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCBD5E1' } }, // szare tło dla sumy
        sumsRowFont: { bold: true, color: { argb: 'FF0F172A' } }
    };

    const catColors = {
        arkusz1: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }, font: { bold: true, size: 10, color: { argb: 'FFFFFFFF' } } },
        input: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }, font: { bold: true, size: 10, color: { argb: 'FF0F172A' } } },
        zusPrac: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } }, font: { bold: true, size: 10, color: { argb: 'FF0F172A' } } },
        pit: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF9C3' } }, font: { bold: true, size: 10, color: { argb: 'FF0F172A' } } },
        zusPracod: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } }, font: { bold: true, size: 10, color: { argb: 'FF0F172A' } } },
        podsumowanie: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }, font: { bold: true, size: 11, color: { argb: 'FFFFFFFF' } } }
    };

    const getCategoryForKey = (key: string): keyof typeof catColors => {
        const zusPracKeys = ['ePracownik', 'rPracownik', 'cPracownik', 'spolecznePrac', 'spolecznePracownik', 'podstZdrowotna', 'podstZdr', 'zdrowotna', 'zusPracSuma', 'zusPracownikSuma'];
        const pitKeys = ['podstPit', 'kup', 'stawkaPit', 'pit', 'kwotaPit', 'potracenieStratton', 'pitZaliczka'];
        const zusPracodKeys = ['ePracodawca', 'rPracodawca', 'wPracodawca', 'fpPracodawca', 'fp', 'fgspPracodawca', 'fgsp', 'zusPracodawcaSuma', 'zusRazem', 'zusSumaCalkowita'];
        if (zusPracKeys.includes(key)) return 'zusPrac';
        if (pitKeys.includes(key)) return 'pit';
        if (zusPracodKeys.includes(key)) return 'zusPracod';
        return 'input';
    };

    const applySegmentedHeaders = (ws: any, styleType: 'arkusz1' | 'podsumowanie' | 'segmented' = 'segmented') => {
        const headerRow = ws.getRow(1);
        headerRow.height = 50;
        headerRow.eachCell((cell: any, colNumber: number) => {
            cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
            cell.border = { bottom: { style: 'thin' } };
            
            if (styleType === 'arkusz1') {
                cell.fill = catColors.arkusz1.fill;
                cell.font = catColors.arkusz1.font;
            } else if (styleType === 'podsumowanie') {
                cell.fill = catColors.podsumowanie.fill;
                cell.font = catColors.podsumowanie.font;
            } else {
                const colKey = ws.columns[colNumber - 1]?.key || '';
                const cat = getCategoryForKey(colKey);
                cell.fill = catColors[cat].fill;
                cell.font = catColors[cat].font;
            }
        });
    };

    const calculateAge = (dateString: string) => {
        if (!dateString) return '';
        const birthDate = new Date(dateString);
        if (isNaN(birthDate.getTime())) return '';
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // ============================================================================
    // ARKUSZ 1: DANE WEJŚCIOWE PRACOWNIKÓW
    // ============================================================================
    const wsPracownicy = workbook.addWorksheet('1. Pracownicy (Krok 2)');
    wsPracownicy.columns = [
        { header: 'ID Pracownika', key: 'id', width: 25 },
        { header: 'Data urodzenia', key: 'dataUrodzenia', width: 15 },
        { header: 'Wiek', key: 'wiek', width: 10 },
        { header: 'Rodzaj umowy ETAT/ZLECENIE', key: 'typUmowy', width: 25 },
        { header: 'Płeć K/M', key: 'plec', width: 10 },
        { header: 'Koszty uzyskania przychodu', key: 'kup', width: 25 },
        { header: 'Kwota zmniejszająca podatek', key: 'pit2', width: 25 },
        { header: 'Składki ZUS zleceniobiorcy', key: 'trybZus', width: 25 },
        { header: 'Podatek zleceniobiorcy', key: 'podatek', width: 25 }
    ];

    applySegmentedHeaders(wsPracownicy, 'arkusz1');

    pracownicy.forEach(p => {
        wsPracownicy.addRow({
            id: p.imie ? `${p.imie} ${p.nazwisko}` : `Pracownik ${p.id}`,
            dataUrodzenia: p.dataUrodzenia || '',
            wiek: calculateAge(p.dataUrodzenia),
            typUmowy: p.typUmowy === 'UOP' ? 'ETAT' : 'ZLECENIE',
            plec: p.plec || '',
            kup: p.kupTyp,
            pit2: p.pit2,
            trybZus: p.trybSkladek,
            podatek: p.ulgaMlodych ? 'Ulga dla młodych' : p.pitMode
        });
    });

    // ============================================================================
    // ARKUSZ 2: STANDARD (Krok 3)
    // ============================================================================
    const wsStandard = workbook.addWorksheet('2. Wynik Standard (Krok 3)');
    const stdColumns = [
        { header: 'ID Pracownika', key: 'id', width: 25 },
        { header: 'Etat / Zlecenie', key: 'typUmowy', width: 15 },
        { header: 'Łączna wartość wynagrodzenia netto', key: 'netto', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Łączna wartość brutto na umowie', key: 'brutto', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Łączny koszt pracodawcy (BRUTTO BRUTTO)', key: 'kosztPracodawcy', width: 20, style: { numFmt: styles.currencyPlain } },
        { header: 'Podstawa do naliczenia składek ZUS', key: 'podstZus', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Składki Emerytalne', key: 'ePracownik', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Składki Rentowe', key: 'rPracownik', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Składki Chorobowe', key: 'cPracownik', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Składki społeczne pracownika', key: 'spolecznePrac', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Podstawa wymiaru składki zdrowotnej', key: 'podstZdrowotna', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Składka zdrowotna', key: 'zdrowotna', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Podstawa opodatkowania', key: 'podstPit', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'KUP', key: 'kup', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Stawka podatku', key: 'stawkaPit', width: 15 },
        { header: 'Kwota podatku', key: 'pit', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Netto', key: 'nettoWlasciwe', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Emerytalna [pracodawcy]', key: 'ePracodawca', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Rentowa [pracodawcy]', key: 'rPracodawca', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Wypadkowa [pracodawcy]', key: 'wPracodawca', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'FP', key: 'fpPracodawca', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'FGŚP', key: 'fgspPracodawca', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Suma składek ZUS pracodawcy', key: 'zusPracodawcaSuma', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Łączna SUMA składek pracownika i pracodawcy', key: 'zusRazem', width: 20, style: { numFmt: styles.currencyPlain } }
    ];
    wsStandard.columns = stdColumns;

    applySegmentedHeaders(wsStandard, 'segmented');

    const stdTotals = Array(stdColumns.length).fill(0); // 0-based

    wyniki.szczegoly.forEach((w) => {
        const s = w.standard;
        const isStudent = w.pracownik.trybSkladek === 'STUDENT_UZ';
        const spoleczne = isStudent ? 0 : s.zusPracownik.suma;
        const zdrowotna = isStudent ? 0 : s.zdrowotna;
        const zusRazem = spoleczne + zdrowotna + s.zusPracodawca.suma;

        const rowValues = [
            `${w.pracownik.imie} ${w.pracownik.nazwisko}`.trim() || `Pracownik ${w.pracownik.id}`,
            w.pracownik.typUmowy === 'UOP' ? 'Etat' : 'Zlecenie',
            s.netto,
            s.brutto,
            s.kosztPracodawcy,
            s.podstawaZus,
            s.zusPracownik.emerytalna,
            s.zusPracownik.rentowa,
            s.zusPracownik.chorobowa,
            spoleczne,
            isStudent ? 0 : s.podstawaZdrowotna,
            zdrowotna,
            s.podstawaPit,
            s.kup,
            s.stawkaPit + '%',
            s.pit,
            s.netto, // Netto z powrotem
            s.zusPracodawca.emerytalna,
            s.zusPracodawca.rentowa,
            s.zusPracodawca.wypadkowa,
            s.zusPracodawca.fp,
            s.zusPracodawca.fgsp,
            s.zusPracodawca.suma,
            zusRazem
        ];

        wsStandard.addRow(rowValues);

        // Add to totals for numeric columns (index 2 onwards, except stawkaPit at 14)
        for(let i=2; i<rowValues.length; i++) {
            if (i !== 14 && typeof rowValues[i] === 'number') {
                stdTotals[i] += rowValues[i];
            }
        }
    });

    // STANDARD SUM ROW
    const stdSumRowValues = ['SUMA', '', ...stdTotals.slice(2)];
    const stdSumRow = wsStandard.addRow(stdSumRowValues);
    stdSumRow.getCell(15).value = ''; // stawkaPit is text
    stdSumRow.eachCell((c: any) => {
        c.fill = styles.sumsRowFill;
        c.font = styles.sumsRowFont;
    });


    // ============================================================================
    // ARKUSZ 3: PODZIAŁ STRATTON (Krok 4)
    // ============================================================================
    const wsPodzial = workbook.addWorksheet('3. Wynik Podział (Krok 4)');
    const podzColumns = [
        { header: 'ID Pracownika', key: 'id', width: 25 },
        { header: 'Etat / Zlecenie', key: 'typUmowy', width: 15 },
        { header: 'Łączna wartość wynagrodzenia netto', key: 'nettoLaczne', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Wynagrodzenie w formie pieniężnej netto', key: 'pieniezneNetto', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Brutto od netto', key: 'zasadniczeBrutto', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Dodatek STRATTON netto', key: 'strattonNetto', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Dodatek STRATTON brutto', key: 'strattonBrutto', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Zaliczka od świadczenia netto', key: 'pomocnicza', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Łączna wartość brutto na umowie', key: 'bruttoLaczne', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Zaliczka na podatek (PIT) od kwoty brutto', key: 'pitZaliczka', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'DO WYPŁATY wynagrodzenie w formie pieniężnej', key: 'doWyplKasa', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'DO WYPŁATY przychód STRATTON', key: 'doWyplStratton', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'DO WYPŁATY suma świadczeń', key: 'doWyplSuma', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Łączny koszt pracodawcy (BRUTTO BRUTTO)', key: 'koszt', width: 20, style: { numFmt: styles.currencyPlain } },
        { header: 'Podstawa do naliczenia składek ZUS', key: 'podstZus', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Składki Emerytalne', key: 'ePracownik', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Składki Rentowe', key: 'rPracownik', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Składki Chorobowe', key: 'cPracownik', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Składki społeczne pracownika', key: 'spolecznePrac', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Podstawa wymiaru składki zdrowotnej', key: 'podstZdr', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Składka zdrowotna', key: 'zdrowotna', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Suma składek ZUS pracownika', key: 'zusPracSuma', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Podstawa opodatkowania', key: 'podstPit', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'KUP', key: 'kup', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Stawka podatku', key: 'stawkaPit', width: 15 },
        { header: 'Kwota podatku', key: 'kwotaPit', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Potrącenie STRATTON', key: 'potracenieStratton', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'NETTO', key: 'nettoKoncowe', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Emerytalna [pracodawcy]', key: 'ePracodawca', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Rentowa [pracodawcy]', key: 'rPracodawca', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Wypadkowa [pracodawcy]', key: 'wPracodawca', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'FP', key: 'fp', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'FGŚP', key: 'fgsp', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Suma składek ZUS pracodawcy', key: 'zusPracodawcaSuma', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Łączna SUMA składek pracownika i pracodawcy', key: 'zusRazem', width: 20, style: { numFmt: styles.currencyPlain } }
    ];
    wsPodzial.columns = podzColumns;

    applySegmentedHeaders(wsPodzial, 'segmented');

    const podzTotals = Array(podzColumns.length).fill(0);

    wyniki.szczegoly.forEach((w) => {
        const p = w.podzial;
        const s = w.standard;
        const isStudent = w.pracownik.trybSkladek === 'STUDENT_UZ';

        // Helper variables
        const zusPracownikSumaNum = isStudent ? s.zusPracownik.suma : p.zasadnicza.zusPracownik.suma;
        const zdrowotnaNum = isStudent ? 0 : p.zasadnicza.zdrowotna;
        const zusRazemPrac = zusPracownikSumaNum + zdrowotnaNum;
        const zusRazemPracodawca = isStudent ? s.zusPracodawca.suma : p.zasadnicza.zusPracodawca.suma;

        const rowValues = [
            `${w.pracownik.imie} ${w.pracownik.nazwisko}`.trim() || `Pracownik ${w.pracownik.id}`,
            w.pracownik.typUmowy === 'UOP' ? 'Etat' : 'Zlecenie',
            s.netto, // Łączna wartość wynagrodzenia netto
            isStudent ? s.netto : p.zasadnicza.netto, // Wynagrodzenie w formie pieniężnej netto
            isStudent ? s.brutto : p.zasadnicza.brutto, // Brutto od netto
            isStudent ? 0 : p.swiadczenie.netto, // Dodatek STRATTON netto
            isStudent ? 0 : p.swiadczenie.brutto, // Dodatek STRATTON brutto
            isStudent ? 0 : p.swiadczenie.zaliczka, // Zaliczka od świadczenia netto
            isStudent ? s.brutto : p.pit.lacznyPrzychod,
            isStudent ? s.pit : p.pit.kwota,
            isStudent ? s.netto : p.zasadnicza.netto, // DO WYPŁATY wynagrodzenie w formie pieniężnej
            isStudent ? 0 : p.swiadczenie.netto, // DO WYPŁATY przychód STRATTON
            s.netto, // DO WYPŁATY suma świadczeń
            isStudent ? s.kosztPracodawcy : p.kosztPracodawcy,
            isStudent ? s.podstawaZus : p.zasadnicza.podstawaZus,
            isStudent ? s.zusPracownik.emerytalna : p.zasadnicza.zusPracownik.emerytalna,
            isStudent ? s.zusPracownik.rentowa : p.zasadnicza.zusPracownik.rentowa,
            isStudent ? s.zusPracownik.chorobowa : p.zasadnicza.zusPracownik.chorobowa,
            zusPracownikSumaNum,
            isStudent ? 0 : p.zasadnicza.podstawaZdrowotna,
            zdrowotnaNum,
            zusRazemPrac, // Suma składek ZUS pracownika
            isStudent ? s.podstawaPit : p.pit.podstawa,
            isStudent ? s.kup : p.pit.kup,
            isStudent ? s.stawkaPit + '%' : p.pit.stawka + '%',
            isStudent ? s.pit : p.pit.kwota,
            isStudent ? 0 : 1.00, // Potrącenie STRATTON
            s.netto, // NETTO (ponownie)
            isStudent ? s.zusPracodawca.emerytalna : p.zasadnicza.zusPracodawca.emerytalna,
            isStudent ? s.zusPracodawca.rentowa : p.zasadnicza.zusPracodawca.rentowa,
            isStudent ? s.zusPracodawca.wypadkowa : p.zasadnicza.zusPracodawca.wypadkowa,
            isStudent ? s.zusPracodawca.fp : p.zasadnicza.zusPracodawca.fp,
            isStudent ? s.zusPracodawca.fgsp : p.zasadnicza.zusPracodawca.fgsp,
            zusRazemPracodawca,
            zusRazemPrac + zusRazemPracodawca
        ];

        wsPodzial.addRow(rowValues);

        for (let i=2; i<rowValues.length; i++) {
            if (i !== 24 && typeof rowValues[i] === 'number') { // 24 = stawkaPit (0-based)
                podzTotals[i] += rowValues[i];
            }
        }
    });

    const podzSumRowValues = ['SUMA', '', ...podzTotals.slice(2)];
    const podzSumRow = wsPodzial.addRow(podzSumRowValues);
    podzSumRow.getCell(25).value = ''; // stawkaPit is text
    podzSumRow.eachCell((c: any) => {
        c.fill = styles.sumsRowFill;
        c.font = styles.sumsRowFont;
    });

    // ============================================================================
    // ARKUSZ 4: PORÓWNANIE (STRATTON VS STANDARD VS RÓŻNICA) 
    // ============================================================================
    const wsCompare = workbook.addWorksheet('4. Porównanie Szczegółowe');
    const compColumns = [
        { header: 'Wariant', key: 'wariant', width: 15 },
        { header: 'ID Pracownika', key: 'id', width: 25 },
        { header: 'Etat / Zlecenie', key: 'etatZlecenie', width: 15 },
        { header: 'Łączna wartość wynagrodzenia netto', key: 'laczneNetto', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Wynagrodzenie w formie pieniężnej netto', key: 'pienieznaNetto', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Dodatek STRATTON netto', key: 'strattonNetto', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Dodatek STRATTON brutto', key: 'strattonBrutto', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Łączna wartość brutto na umowie', key: 'laczneBrutto', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Zaliczka na podatek dochodowy (PIT) od kwoty brutto', key: 'pitZaliczka', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'DO WYPŁATY wynagrodzenie w formie pieniężnej', key: 'doWyplatyGotowka', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'DO WYPŁATY przychód STRATTON', key: 'doWyplatyStratton', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'DO WYPŁATY suma świadczeń', key: 'doWyplatySuma', width: 15, style: { numFmt: styles.currencyPlain, font: { bold: true } } },
        { header: 'Łączny koszt pracodawcy (BRUTTO BRUTTO)', key: 'koszt', width: 15, style: { numFmt: styles.currencyPlain, font: { bold: true } } },
        { header: 'Podstawa do naliczenia składek ZUS', key: 'podstZus', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Składki Emerytalne (pracownika)', key: 'ePracownik', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Składki Rentowe (pracownika)', key: 'rPracownik', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Składki Chorobowe (pracownika)', key: 'cPracownik', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Składki społeczne pracownika (suma)', key: 'spolecznePracownik', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Składka Zdrowotna', key: 'zdrowotna', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Suma składek ZUS pracownika', key: 'zusPracownikSuma', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Podstawa opodatkowania', key: 'podstPit', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Stawka podatku', key: 'stawkaPit', width: 15 },
        { header: 'Kwota podatku', key: 'kwotaPit', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Potrącenie STRATTON', key: 'potracenieStratton', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Emerytalna (pracodawcy)', key: 'ePracodawca', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Rentowa (pracodawcy)', key: 'rPracodawca', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Wypadkowa (pracodawcy)', key: 'wPracodawca', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'FP', key: 'fpPracodawca', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'FGŚP', key: 'fgspPracodawca', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Suma składek ZUS pracodawcy', key: 'zusPracodawcaSuma', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Łączna SUMA składek pracownika i pracodawcy', key: 'zusSumaCalkowita', width: 15, style: { numFmt: styles.currencyPlain } }
    ];
    wsCompare.columns = compColumns;

    applySegmentedHeaders(wsCompare, 'segmented');

    const compareTotalsStratton = Array(compColumns.length).fill(0);
    const compareTotalsStandard = Array(compColumns.length).fill(0);
    const compareTotalsDiff = Array(compColumns.length).fill(0);

    wyniki.szczegoly.forEach(w => {
        const isStudent = w.pracownik.trybSkladek === 'STUDENT_UZ';
        const std = w.standard;
        const podz = w.podzial;

        const pracownikString = `${w.pracownik.imie} ${w.pracownik.nazwisko}`.trim() || `Pracownik ${w.pracownik.id}`;
        let etatZlecenie = w.pracownik.typUmowy === 'UOP' ? 'Etat' : 'Zlecenie';

        const strPienieznaNetto = isStudent ? std.netto : podz.zasadnicza.netto;
        const strStrattonNetto = isStudent ? 0 : podz.swiadczenie.netto;
        const strStrattonBrutto = isStudent ? 0 : podz.swiadczenie.brutto;
        const strLaczneBrutto = isStudent ? std.brutto : podz.zasadnicza.brutto;
        const strPitZaliczka = isStudent ? std.pit : podz.zasadnicza.pit; 
        const strDoWyplGotowka = isStudent ? std.netto : podz.zasadnicza.netto;
        const strDoWyplStratton = isStudent ? 0 : podz.swiadczenie.netto;
        const strDoWyplSuma = isStudent ? std.netto : podz.doWyplaty;
        const strKoszt = isStudent ? std.kosztPracodawcy : podz.kosztPracodawcy;
        const strPodstZus = isStudent ? std.podstawaZus : podz.zasadnicza.podstawaZus;
        const strEPracownik = isStudent ? std.zusPracownik.emerytalna : podz.zasadnicza.zusPracownik.emerytalna;
        const strRPracownik = isStudent ? std.zusPracownik.rentowa : podz.zasadnicza.zusPracownik.rentowa;
        const strCPracownik = isStudent ? std.zusPracownik.chorobowa : podz.zasadnicza.zusPracownik.chorobowa;
        const strSpolecznePrac = isStudent ? std.zusPracownik.suma : podz.zasadnicza.zusPracownik.suma;
        const strZdrowotna = isStudent ? 0 : podz.zasadnicza.zdrowotna;
        const strZusPracownikSuma = strSpolecznePrac + strZdrowotna;
        const strPodstPit = isStudent ? std.podstawaPit : podz.pit.podstawa;
        const strStawkaPit = isStudent ? std.stawkaPit + '%' : podz.pit.stawka + '%';
        const strKwotaPit = isStudent ? std.pit : podz.pit.kwota;
        const strPotracenieStratton = isStudent ? 0 : 1.00; // Potrącenie STRATTON stałe 1 zł
        const strEPracodawca = isStudent ? std.zusPracodawca.emerytalna : podz.zasadnicza.zusPracodawca.emerytalna;
        const strRPracodawca = isStudent ? std.zusPracodawca.rentowa : podz.zasadnicza.zusPracodawca.rentowa;
        const strWPracodawca = isStudent ? std.zusPracodawca.wypadkowa : podz.zasadnicza.zusPracodawca.wypadkowa;
        const strFPPracodawca = isStudent ? std.zusPracodawca.fp : podz.zasadnicza.zusPracodawca.fp;
        const strFGSPPracodawca = isStudent ? std.zusPracodawca.fgsp : podz.zasadnicza.zusPracodawca.fgsp;
        const strZusPracodawcaSuma = isStudent ? std.zusPracodawca.suma : podz.zasadnicza.zusPracodawca.suma;
        const strZusCalkowita = strZusPracownikSuma + strZusPracodawcaSuma;

        const stdPienieznaNetto = std.netto;
        const stdStrattonNetto = 0;
        const stdStrattonBrutto = 0;
        const stdLaczneBrutto = std.brutto;
        const stdPitZaliczka = std.pit;
        const stdDoWyplGotowka = std.netto;
        const stdDoWyplStratton = 0;
        const stdDoWyplSuma = std.netto;
        const stdKoszt = std.kosztPracodawcy;
        const stdPodstZus = std.podstawaZus;
        const stdEPracownik = std.zusPracownik.emerytalna;
        const stdRPracownik = std.zusPracownik.rentowa;
        const stdCPracownik = std.zusPracownik.chorobowa;
        const stdSpolecznePrac = std.zusPracownik.suma;
        const stdZdrowotna = isStudent ? 0 : std.zdrowotna;
        const stdZusPracownikSuma = stdSpolecznePrac + stdZdrowotna;
        const stdPodstPit = std.podstawaPit;
        const stdStawkaPit = std.stawkaPit + '%';
        const stdKwotaPit = std.pit;
        const stdPotracenieStratton = 0;
        const stdEPracodawca = std.zusPracodawca.emerytalna;
        const stdRPracodawca = std.zusPracodawca.rentowa;
        const stdWPracodawca = std.zusPracodawca.wypadkowa;
        const stdFPPracodawca = std.zusPracodawca.fp;
        const stdFGSPPracodawca = std.zusPracodawca.fgsp;
        const stdZusPracodawcaSuma = std.zusPracodawca.suma;
        const stdZusCalkowita = stdZusPracownikSuma + stdZusPracodawcaSuma;

        const rowStr = [
            'STRATTON', pracownikString, etatZlecenie, std.netto, strPienieznaNetto, strStrattonNetto, strStrattonBrutto,
            strLaczneBrutto, strPitZaliczka, strDoWyplGotowka, strDoWyplStratton, strDoWyplSuma, strKoszt, strPodstZus,
            strEPracownik, strRPracownik, strCPracownik, strSpolecznePrac, strZdrowotna, strZusPracownikSuma, strPodstPit,
            strStawkaPit, strKwotaPit, strPotracenieStratton, strEPracodawca, strRPracodawca, strWPracodawca, strFPPracodawca,
            strFGSPPracodawca, strZusPracodawcaSuma, strZusCalkowita
        ];

        const rowStd = [
            'STANDARD', '', '', std.netto, stdPienieznaNetto, stdStrattonNetto, stdStrattonBrutto,
            stdLaczneBrutto, stdPitZaliczka, stdDoWyplGotowka, stdDoWyplStratton, stdDoWyplSuma, stdKoszt, stdPodstZus,
            stdEPracownik, stdRPracownik, stdCPracownik, stdSpolecznePrac, stdZdrowotna, stdZusPracownikSuma, stdPodstPit,
            stdStawkaPit, stdKwotaPit, stdPotracenieStratton, stdEPracodawca, stdRPracodawca, stdWPracodawca, stdFPPracodawca,
            stdFGSPPracodawca, stdZusPracodawcaSuma, stdZusCalkowita
        ];

        const formatDiff = (strVal: number, stdVal: number) => strVal - stdVal;
        const rowDiff = [
            'RÓŻNICA', '', '', 0, formatDiff(strPienieznaNetto, stdPienieznaNetto), formatDiff(strStrattonNetto, stdStrattonNetto),
            formatDiff(strStrattonBrutto, stdStrattonBrutto), formatDiff(strLaczneBrutto, stdLaczneBrutto), formatDiff(strPitZaliczka, stdPitZaliczka),
            formatDiff(strDoWyplGotowka, stdDoWyplGotowka), formatDiff(strDoWyplStratton, stdDoWyplStratton), formatDiff(strDoWyplSuma, stdDoWyplSuma),
            formatDiff(strKoszt, stdKoszt), formatDiff(strPodstZus, stdPodstZus), formatDiff(strEPracownik, stdEPracownik),
            formatDiff(strRPracownik, stdRPracownik), formatDiff(strCPracownik, stdCPracownik), formatDiff(strSpolecznePrac, stdSpolecznePrac),
            formatDiff(strZdrowotna, stdZdrowotna), formatDiff(strZusPracownikSuma, stdZusPracownikSuma), formatDiff(strPodstPit, stdPodstPit),
            '', formatDiff(strKwotaPit, stdKwotaPit), formatDiff(strPotracenieStratton, stdPotracenieStratton), formatDiff(strEPracodawca, stdEPracodawca),
            formatDiff(strRPracodawca, stdRPracodawca), formatDiff(strWPracodawca, stdWPracodawca), formatDiff(strFPPracodawca, stdFPPracodawca),
            formatDiff(strFGSPPracodawca, stdFGSPPracodawca), formatDiff(strZusPracodawcaSuma, stdZusPracodawcaSuma), formatDiff(strZusCalkowita, stdZusCalkowita)
        ];

        for(let i=3; i<rowStr.length; i++) {
            if (i !== 21 && typeof rowStr[i] === 'number') { // 21 = stawkaPit
                compareTotalsStratton[i] += rowStr[i] as number;
                compareTotalsStandard[i] += rowStd[i] as number;
                compareTotalsDiff[i] += rowDiff[i] as number;
            }
        }

        const r1 = wsCompare.addRow(rowStr);
        r1.eachCell((c: any) => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } }; });
        
        const r2 = wsCompare.addRow(rowStd);
        r2.eachCell((c: any) => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }; });
        
        const r3 = wsCompare.addRow(rowDiff);
        r3.eachCell((c: any) => { c.fill = styles.diffFill; c.font = styles.diffFont; });
    });

    const sr1 = wsCompare.addRow(['SUMA STRATTON', '', '', ...compareTotalsStratton.slice(3)]);
    sr1.getCell(22).value = ''; // clear stawkaPit
    sr1.eachCell((c: any) => { c.fill = styles.sumsRowFill; c.font = styles.sumsRowFont; });

    const sr2 = wsCompare.addRow(['SUMA STANDARD', '', '', ...compareTotalsStandard.slice(3)]);
    sr2.getCell(22).value = '';
    sr2.eachCell((c: any) => { c.fill = styles.sumsRowFill; c.font = styles.sumsRowFont; });

    const sr3 = wsCompare.addRow(['SUMA RÓŻNICA', '', '', ...compareTotalsDiff.slice(3)]);
    sr3.getCell(22).value = '';
    sr3.eachCell((c: any) => { c.fill = styles.diffFill; c.font = styles.diffFont; });


    // ============================================================================
    // ARKUSZ 5: PODSUMOWANIE z Kroku 6 
    // ============================================================================
    const wsPodsumowanie = workbook.addWorksheet('5. Podsumowanie (Krok 6)');
    wsPodsumowanie.columns = [
        { header: 'KATEGORIA KOSZTOWA', key: 'kategoria', width: 50 },
        { header: 'OBECNIE (STANDARD)', key: 'standard', width: 25, style: { numFmt: styles.currencyPlain } },
        { header: activeModel === 'PRIME' ? 'MODEL ELITON PRIME PLUS' : 'MODEL ELITON STANDARD', key: 'eliton', width: 35, style: { numFmt: styles.currencyPlain } },
        { header: 'ZMIANA', key: 'roznica', width: 20, style: { numFmt: styles.currencyPlain } }
    ];

    applySegmentedHeaders(wsPodsumowanie, 'podsumowanie');

    const totalProvision = wyniki.podsumowanie.prowizja;
    const baseBenefitNetto = prowizjaProc > 0 ? totalProvision / (prowizjaProc / 100) : 0;
    const includeRaises = activeModel === 'PRIME';
    const raiseAmount = includeRaises ? baseBenefitNetto * 0.04 : 0;
    const adminAmount = baseBenefitNetto * 0.02;
    const feeAmount = includeRaises ? Math.max(0, totalProvision - raiseAmount - adminAmount) : Math.max(0, totalProvision - adminAmount);

    const stdBrutto = wyniki.szczegoly.reduce((acc, w) => acc + w.standard.brutto, 0);
    const strBrutto = wyniki.szczegoly.reduce((acc, w) => acc + (w.pracownik.trybSkladek === 'STUDENT_UZ' ? w.standard.brutto : w.podzial.pit.lacznyPrzychod), 0);

    const stdZusPracodawca = wyniki.szczegoly.reduce((acc, w) => acc + w.standard.zusPracodawca.suma, 0);
    const strZusPracodawca = wyniki.szczegoly.reduce((acc, w) => acc + (w.pracownik.trybSkladek === 'STUDENT_UZ' ? w.standard.zusPracodawca.suma : w.podzial.zasadnicza.zusPracodawca.suma), 0);

    const stdZusPracown = wyniki.szczegoly.reduce((acc, w) => acc + w.standard.zusPracownik.suma + w.standard.zdrowotna, 0);
    const strZusPracown = wyniki.szczegoly.reduce((acc, w) => acc + (w.pracownik.trybSkladek === 'STUDENT_UZ' ? w.standard.zusPracownik.suma : (w.podzial.zasadnicza.zusPracownik.suma + w.podzial.zasadnicza.zdrowotna)), 0);

    const stdNetto = wyniki.szczegoly.reduce((acc, w) => acc + w.standard.netto, 0);
    const strNetto = wyniki.szczegoly.reduce((acc, w) => acc + (w.pracownik.trybSkladek === 'STUDENT_UZ' ? w.standard.netto : w.podzial.doWyplaty), 0);

    const addSummaryRow = (kat: string, st: number | null, el: number, customDiff?: number) => {
        const diff = customDiff !== undefined ? customDiff : (st !== null ? el - st : el);
        const row = wsPodsumowanie.addRow({ 
            kategoria: kat, 
            standard: st !== null ? st : '-', 
            eliton: el, 
            roznica: diff 
        });
        
        // Zmiana color
        const diffCell = row.getCell(4); // ZMIANA
        if (diff > 0.01) {
            diffCell.font = { color: { argb: 'FFEF4444' }, bold: true }; // Czerwony na plusie dla kosztów (lub inny, wg reguł. Ale w excelu ujemne na zielono bo oszczędność, dodatnie na czerwono - chociaż to zależy. Przeważnie tak było w aplikacji)
        } else if (diff < -0.01) {
            diffCell.font = { color: { argb: 'FF22C55E' }, bold: true }; // Zielony
        }
        return row;
    };

    addSummaryRow('Wynagrodzenie Brutto\r\nZ UMOWY', stdBrutto, strBrutto);
    addSummaryRow('ZUS Pracodawcy\r\nEMERYTALNA, RENTOWA, WYP.', stdZusPracodawca, strZusPracodawca);
    addSummaryRow('ZUS Pracownika\r\nSPOŁECZNE + ZDROWOTNE', stdZusPracown, strZusPracown);
    
    const nettoRow = addSummaryRow('Netto Pracownika\r\nDO WYPŁATY (NA RĘKĘ)', stdNetto, strNetto);
    // Netto has diff: zielone dla >=0 w aplikacji, ale w arkuszu zostawmy formatDiff
    if (strNetto - stdNetto >= -0.01) {
        nettoRow.getCell(4).font = { color: { argb: 'FF22C55E' }, bold: true };
    }

    wsPodsumowanie.addRow({}); // spacer

    addSummaryRow('Opłata Success Fee\r\nZA OBSŁUGĘ MODELU ELITON PRIME (NALICZANA OD ŚWIADCZENIA NETTO)', null, feeAmount, feeAmount);

    if (adminAmount > 0) {
        addSummaryRow('Bonus dla Działu Księgowo-Kadrowego\r\nwyliczany od świadczenia netto\r\n2% WYPŁACANE PRZEZ STRATTON', null, adminAmount, adminAmount);
    }
    if (includeRaises && raiseAmount > 0) {
        addSummaryRow('Dodatkowa podwyżka wynagrodzenia dla pracowników\r\nwyliczana od świadczenia netto\r\n4% FINANSOWANE PRZEZ STRATTON', null, raiseAmount, raiseAmount);
    }

    wsPodsumowanie.addRow({}); // spacer

    // SUM ROW (CAŁKOWITY KOSZT)
    const stdKosztMiesiac = wyniki.podsumowanie.sumaKosztStandard;
    const strKosztMiesiac = wyniki.podsumowanie.sumaKosztPodzial + totalProvision;
    const oszczednosc = stdKosztMiesiac - strKosztMiesiac; // Zwykle Standard - Eliton (dodatnia oszczędność na zielono)

    const sumRow = wsPodsumowanie.addRow({
        kategoria: 'CAŁKOWITY KOSZT\r\nPracodawcy (Miesięcznie)',
        standard: stdKosztMiesiac,
        eliton: strKosztMiesiac,
        roznica: -oszczednosc // tak zeby pokazalo "-2000" tak jak na screenie
    });

    sumRow.height = 30;
    sumRow.eachCell((c: any) => {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
        c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });
    // Oszczędność kolumna zielona
    sumRow.getCell(4).font = { bold: true, color: { argb: 'FF22C55E' } };

    // ============================================================================
    // DOPASOWANIE SZEROKOŚCI KOLUMN I ZWIJANIA TEKSTU
    // ============================================================================
    workbook.worksheets.forEach(worksheet => {
        worksheet.columns.forEach((column: any) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell: any) => {
                const columnLength = cell.value ? cell.value.toString().split('\n').reduce((max: number, line: string) => Math.max(max, line.length), 0) : 10;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
                
                if (cell.alignment) {
                    cell.alignment = { ...cell.alignment, wrapText: true, vertical: 'middle' };
                } else {
                    cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
                }
            });
            column.width = Math.min(Math.max(maxLength + 2, 15), 50); 
        });
    });

    // ============================================================================
    // ZAPIS PLIKU
    // ============================================================================
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `Pelna_Historia_Kalkulacji_${firma.nazwa || 'Firma'}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
};
