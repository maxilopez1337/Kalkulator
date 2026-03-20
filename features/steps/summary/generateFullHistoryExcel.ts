import { Firma } from '../../../entities/company/model';
import { GlobalneWyniki } from '../../../entities/calculation/model';
import { Pracownik } from '../../../entities/employee/model';
import { STANDARD_TABLE_CONFIG, SPLIT_TABLE_CONFIG } from '../results/excelTableConfigs';

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
        { header: 'Koszty uzyskania przychodu', key: 'kup', width: 25, style: { numFmt: styles.currencyPlain } },
        { header: 'Kwota zmniejszająca podatek', key: 'pit2', width: 25, style: { numFmt: styles.currencyPlain } },
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
            kup: p.kupTyp === 'PODWYZSZONE' ? 300 : (p.kupTyp === 'STANDARD' ? 250 : 0),
              pit2: parseFloat(p.pit2) || 0,
            trybZus: p.trybSkladek,
              podatek: p.ulgaMlodych ? 'Ulga dla młodych (0)' : ((p.pitMode === 'AUTO' || p.pitMode as string === 'ZASADY_OGOLNE') ? 'Zasady ogólne (12%)' : p.pitMode)
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
        { header: 'STRATTON', key: 'wariant', width: 15 },
        { header: 'ID Pracownika', key: 'id', width: 25 },
        { header: 'Etat / Zlecenie', key: 'etatZlecenie', width: 15 },
        { header: 'Łączna wartość wynagrodzenia netto', key: 'laczneNetto', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Wynagrodzenie w formie pieniężnej netto', key: 'pienieznaNetto', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Dodatek STRATTON brutto', key: 'strattonBrutto', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Dodatek STRATTON netto', key: 'strattonNetto', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Łączna wartość brutto na Ustawie', key: 'laczneBrutto', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Zaliczka na podatek dochodowy od kwoty brutto', key: 'pitZaliczka', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'DO WYPŁATY wynagrodzenie w formnie pieniężnej', key: 'doWyplGotowka', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'DO WYPŁATY przychód STRATTON', key: 'doWyplStratton', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'DO WYPŁATY suma świadczeń', key: 'doWyplSuma', width: 15, style: { numFmt: styles.currencyPlain, font: { bold: true } } },
        { header: 'Łączny koszt wynagrodzenia (BRUTTO BRUTTO)', key: 'koszt', width: 15, style: { numFmt: styles.currencyPlain, font: { bold: true } } },
        { header: 'Podstawa do naliczenia składek', key: 'podstZus', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Składki Emerytalne', key: 'ePracownik', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Składki Rentowe', key: 'rPracownik', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Składki Chorobowe', key: 'cPracownik', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Składki społeczne pracownika', key: 'spolecznePracownik', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Składka Zdrowotna', key: 'zdrowotna', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Suma składek pracownika', key: 'zusPracownikSuma', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Podstawa opodatkowania', key: 'podstPit', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Stawka podatku', key: 'stawkaPit', width: 15 },
        { header: 'Kwota podatku', key: 'kwotaPit', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Potrącenie STRATTON', key: 'potracenieStratton', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Emerytalna', key: 'ePracodawca', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Rentowa', key: 'rPracodawca', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Wypadkowa', key: 'wPracodawca', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'FP', key: 'fpPracodawca', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'FGŚP', key: 'fgspPracodawca', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Suma składek pracodawcy', key: 'zusPracodawcaSuma', width: 15, style: { numFmt: styles.currencyPlain } },
        { header: 'Łączna SUMA składek ZUS Pracownik i Pracodawca', key: 'zusSumaCalkowita', width: 15, style: { numFmt: styles.currencyPlain } }
    ];
    wsCompare.columns = compColumns;

    wsCompare.spliceRows(1, 0, []);
    wsCompare.getCell('A1').value = 'Dane wejsciowe';
    wsCompare.mergeCells('A1:C1');

    wsCompare.getRow(2).eachCell((c) => { 
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
        c.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        c.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
        c.border = { bottom: { style: 'thin' } };
    });

    const compareTotalsStratton = Array(compColumns.length).fill(0);
    const compareTotalsStandard = Array(compColumns.length).fill(0);
    const compareTotalsDiff = Array(compColumns.length).fill(0);

    wyniki.szczegoly.forEach(w => {
        const isStudent = w.pracownik.trybSkladek === 'STUDENT_UZ';
        const std = w.standard;
        const podz = w.podzial;

        const pracownikString = w.pracownik.imie ? w.pracownik.imie + ' ' + w.pracownik.nazwisko : 'Pracownik ' + w.pracownik.id;
        let etatZlecenie = w.pracownik.typUmowy === 'UOP' ? 'Etat' : 'Zlecenie';

        const sLaczneNetto = std.netto;
        const sPienieznaNetto = std.netto;
        const sStrattonNetto = 0;
        const sStrattonBrutto = 0;
        const sLaczneBrutto = std.brutto;
        const sPitZaliczka = std.pit;
        const sDoWyplGotowka = std.netto;
        const sDoWyplStratton = 0;
        const sDoWyplSuma = std.netto;
        const sKoszt = std.kosztPracodawcy;
        const sPodstZus = std.podstawaZus;
        const sEPrac = std.zusPracownik.emerytalna;
        const sRPrac = std.zusPracownik.rentowa;
        const sCPrac = std.zusPracownik.chorobowa;
        const sSpoleczne = isStudent ? 0 : std.zusPracownik.suma;
        const sZdrowotna = isStudent ? 0 : std.zdrowotna;
        const sZusPracownikSuma = sSpoleczne + sZdrowotna;
        const sPodstPit = std.podstawaPit;
        const sKwotaPit = std.pit;
        const sPotracenieStratton = 0;
        const sEPracodawca = std.zusPracodawca.emerytalna;
        const sRPracodawca = std.zusPracodawca.rentowa;
        const sWPracodawca = std.zusPracodawca.wypadkowa;
        const sFp = std.zusPracodawca.fp;
        const sFgsp = std.zusPracodawca.fgsp;
        const sZusPracodawcaSuma = std.zusPracodawca.suma;
        const sZusSumaCalkowita = sZusPracownikSuma + sZusPracodawcaSuma + sKwotaPit;

        wsCompare.addRow({
            wariant: '1 ETAT',
            id: pracownikString,
            etatZlecenie: etatZlecenie,
            laczneNetto: sLaczneNetto,
            pienieznaNetto: sPienieznaNetto,
            strattonBrutto: sStrattonBrutto,
            strattonNetto: sStrattonNetto,
            laczneBrutto: sLaczneBrutto,
            pitZaliczka: sPitZaliczka,
            doWyplGotowka: sDoWyplGotowka,
            doWyplStratton: sDoWyplStratton,
            doWyplSuma: sDoWyplSuma,
            koszt: sKoszt,
            podstZus: sPodstZus,
            ePracownik: sEPrac,
            rPracownik: sRPrac,
            cPracownik: sCPrac,
            spolecznePracownik: sSpoleczne,
            zdrowotna: sZdrowotna,
            zusPracownikSuma: sZusPracownikSuma,
            podstPit: sPodstPit,
            stawkaPit: std.stawkaPit + '%',
            kwotaPit: sKwotaPit,
            potracenieStratton: sPotracenieStratton,
            ePracodawca: sEPracodawca,
            rPracodawca: sRPracodawca,
            wPracodawca: sWPracodawca,
            fpPracodawca: sFp,
            fgspPracodawca: sFgsp,
            zusPracodawcaSuma: sZusPracodawcaSuma,
            zusSumaCalkowita: sZusSumaCalkowita
        });

        // ================= STRATTON ROW ==================
        const pPienieznaNetto = isStudent ? std.netto : podz.zasadnicza.netto;
        const pStrattonNetto = isStudent ? 0 : podz.swiadczenie.netto;
        const pLaczneNetto = pPienieznaNetto + pStrattonNetto;
        const pStrattonBrutto = isStudent ? 0 : podz.swiadczenie.brutto;
        const pLaczneBrutto = isStudent ? std.brutto : podz.pit.lacznyPrzychod;
        const pPitZaliczka = isStudent ? std.pit : podz.pit.kwota;
        const pPotracenieStratton = isStudent ? 0 : 1.00;
        const pDoWyplGotowka = podz.doWyplatyGotowka;
        const pDoWyplStratton = pStrattonNetto;
        const pDoWyplSuma = pDoWyplGotowka + pDoWyplStratton;
        const pKoszt = isStudent ? std.kosztPracodawcy : podz.kosztPracodawcy;
        const pPodstZus = isStudent ? std.podstawaZus : podz.zasadnicza.podstawaZus;
        const pEPrac = isStudent ? std.zusPracownik.emerytalna : podz.zasadnicza.zusPracownik.emerytalna;
        const pRPrac = isStudent ? std.zusPracownik.rentowa : podz.zasadnicza.zusPracownik.rentowa;
        const pCPrac = isStudent ? std.zusPracownik.chorobowa : podz.zasadnicza.zusPracownik.chorobowa;
        const pSpoleczne = isStudent ? std.zusPracownik.suma : podz.zasadnicza.zusPracownik.suma;
        const pZdrowotna = isStudent ? 0 : podz.zasadnicza.zdrowotna;
        const pZusPracownikSuma = pSpoleczne + pZdrowotna;
        const pPodstPit = isStudent ? std.podstawaPit : podz.pit.podstawa;
        const pKwotaPit = pPitZaliczka;
        const pEPracodawca = isStudent ? std.zusPracodawca.emerytalna : podz.zasadnicza.zusPracodawca.emerytalna;
        const pRPracodawca = isStudent ? std.zusPracodawca.rentowa : podz.zasadnicza.zusPracodawca.rentowa;
        const pWPracodawca = isStudent ? std.zusPracodawca.wypadkowa : podz.zasadnicza.zusPracodawca.wypadkowa;
        const pFp = isStudent ? std.zusPracodawca.fp : podz.zasadnicza.zusPracodawca.fp;
        const pFgsp = isStudent ? std.zusPracodawca.fgsp : podz.zasadnicza.zusPracodawca.fgsp;
        const pZusPracodawcaSuma = isStudent ? std.zusPracodawca.suma : podz.zasadnicza.zusPracodawca.suma;
        const pZusSumaCalkowita = pZusPracownikSuma + pZusPracodawcaSuma + pKwotaPit;

        wsCompare.addRow({
            wariant: 'STRATTON',
            id: pracownikString,
            etatZlecenie: etatZlecenie,
            laczneNetto: pLaczneNetto,
            pienieznaNetto: pPienieznaNetto,
            strattonBrutto: pStrattonBrutto,
            strattonNetto: pStrattonNetto,
            laczneBrutto: pLaczneBrutto,
            pitZaliczka: pPitZaliczka,
            doWyplGotowka: pDoWyplGotowka,
            doWyplStratton: pDoWyplStratton,
            doWyplSuma: pDoWyplSuma,
            koszt: pKoszt,
            podstZus: pPodstZus,
            ePracownik: pEPrac,
            rPracownik: pRPrac,
            cPracownik: pCPrac,
            spolecznePracownik: pSpoleczne,
            zdrowotna: pZdrowotna,
            zusPracownikSuma: pZusPracownikSuma,
            podstPit: pPodstPit,
            stawkaPit: (isStudent ? std.stawkaPit : podz.pit.stawka) + '%',
            kwotaPit: pKwotaPit,
            potracenieStratton: pPotracenieStratton,
            ePracodawca: pEPracodawca,
            rPracodawca: pRPracodawca,
            wPracodawca: pWPracodawca,
            fpPracodawca: pFp,
            fgspPracodawca: pFgsp,
            zusPracodawcaSuma: pZusPracodawcaSuma,
            zusSumaCalkowita: pZusSumaCalkowita
        });

        // ================= DIFF ROW ==================
        const dLaczneNetto = pLaczneNetto - sLaczneNetto;
        const dPienieznaNetto = pPienieznaNetto - sPienieznaNetto;
        const dStrattonBrutto = pStrattonBrutto - sStrattonBrutto;
        const dStrattonNetto = pStrattonNetto - sStrattonNetto;
        const dLaczneBrutto = pLaczneBrutto - sLaczneBrutto;
        const dPitZaliczka = pPitZaliczka - sPitZaliczka;
        const dDoWyplGotowka = pDoWyplGotowka - sDoWyplGotowka;
        const dDoWyplStratton = pDoWyplStratton - sDoWyplStratton;
        const dDoWyplSuma = pDoWyplSuma - sDoWyplSuma;
        const dKoszt = pKoszt - sKoszt;
        const dPodstZus = pPodstZus - sPodstZus;
        const dEPrac = pEPrac - sEPrac;
        const dRPrac = pRPrac - sRPrac;
        const dCPrac = pCPrac - sCPrac;
        const dSpoleczne = pSpoleczne - sSpoleczne;
        const dZdrowotna = pZdrowotna - sZdrowotna;
        const dZusPracownikSuma = pZusPracownikSuma - sZusPracownikSuma;
        const dPodstPit = pPodstPit - sPodstPit;
        const dKwotaPit = pKwotaPit - sKwotaPit;
        const dPotracenieStratton = pPotracenieStratton - sPotracenieStratton;
        const dEPracodawca = pEPracodawca - sEPracodawca;
        const dRPracodawca = pRPracodawca - sRPracodawca;
        const dWPracodawca = pWPracodawca - sWPracodawca;
        const dFp = pFp - sFp;
        const dFgsp = pFgsp - sFgsp;
        const dZusPracodawcaSuma = pZusPracodawcaSuma - sZusPracodawcaSuma;
        const dZusSumaCalkowita = pZusSumaCalkowita - sZusSumaCalkowita;

        const rowValuesStd = [sLaczneNetto, sPienieznaNetto, sStrattonBrutto, sStrattonNetto, sLaczneBrutto, sPitZaliczka, sDoWyplGotowka, sDoWyplStratton, sDoWyplSuma, sKoszt, sPodstZus, sEPrac, sRPrac, sCPrac, sSpoleczne, sZdrowotna, sZusPracownikSuma, sPodstPit, 0, sKwotaPit, sPotracenieStratton, sEPracodawca, sRPracodawca, sWPracodawca, sFp, sFgsp, sZusPracodawcaSuma, sZusSumaCalkowita];
        const rowValuesStr = [pLaczneNetto, pPienieznaNetto, pStrattonBrutto, pStrattonNetto, pLaczneBrutto, pPitZaliczka, pDoWyplGotowka, pDoWyplStratton, pDoWyplSuma, pKoszt, pPodstZus, pEPrac, pRPrac, pCPrac, pSpoleczne, pZdrowotna, pZusPracownikSuma, pPodstPit, 0, pKwotaPit, pPotracenieStratton, pEPracodawca, pRPracodawca, pWPracodawca, pFp, pFgsp, pZusPracodawcaSuma, pZusSumaCalkowita];
        const rowValuesDiff = [dLaczneNetto, dPienieznaNetto, dStrattonBrutto, dStrattonNetto, dLaczneBrutto, dPitZaliczka, dDoWyplGotowka, dDoWyplStratton, dDoWyplSuma, dKoszt, dPodstZus, dEPrac, dRPrac, dCPrac, dSpoleczne, dZdrowotna, dZusPracownikSuma, dPodstPit, 0, dKwotaPit, dPotracenieStratton, dEPracodawca, dRPracodawca, dWPracodawca, dFp, dFgsp, dZusPracodawcaSuma, dZusSumaCalkowita];

        for(let i=0; i<rowValuesStd.length; i++) {
            compareTotalsStandard[i+3] += rowValuesStd[i];
            compareTotalsStratton[i+3] += rowValuesStr[i];
            compareTotalsDiff[i+3] += rowValuesDiff[i];
        }

        const diffRow = wsCompare.addRow({
            wariant: 'RÓŻNICA',
            id: pracownikString,
            etatZlecenie: etatZlecenie,
            laczneNetto: dLaczneNetto,
            pienieznaNetto: dPienieznaNetto,
            strattonBrutto: dStrattonBrutto,
            strattonNetto: dStrattonNetto,
            laczneBrutto: dLaczneBrutto,
            pitZaliczka: dPitZaliczka,
            doWyplGotowka: dDoWyplGotowka,
            doWyplStratton: dDoWyplStratton,
            doWyplSuma: dDoWyplSuma,
            koszt: dKoszt,
            podstZus: dPodstZus,
            ePracownik: dEPrac,
            rPracownik: dRPrac,
            cPracownik: dCPrac,
            spolecznePracownik: dSpoleczne,
            zdrowotna: dZdrowotna,
            zusPracownikSuma: dZusPracownikSuma,
            podstPit: dPodstPit,
            stawkaPit: '',
            kwotaPit: dKwotaPit,
            potracenieStratton: dPotracenieStratton,
            ePracodawca: dEPracodawca,
            rPracodawca: dRPracodawca,
            wPracodawca: dWPracodawca,
            fpPracodawca: dFp,
            fgspPracodawca: dFgsp,
            zusPracodawcaSuma: dZusPracodawcaSuma,
            zusSumaCalkowita: dZusSumaCalkowita
        });

        diffRow.eachCell((c) => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00008B' } };
            c.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        });
    });

    const sum1 = wsCompare.addRow(['1 ETAT', 'SUMA', '', ...compareTotalsStandard.slice(3)]);
    sum1.getCell(22).value = '';
    const sum2 = wsCompare.addRow(['STRATTON', 'SUMA', '', ...compareTotalsStratton.slice(3)]);
    sum2.getCell(22).value = '';
    const sum3 = wsCompare.addRow(['RÓŻNICA', 'SUMA', '', ...compareTotalsDiff.slice(3)]);
    sum3.getCell(22).value = '';

    [sum1, sum2, sum3].forEach(r => {
        r.eachCell((c, colNumber) => {
            if(r === sum3) {
                 c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00008B' } };
                 c.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            } else {
                 c.fill = styles.sumsRowFill;
                 c.font = styles.sumsRowFont;
            }
        });
    });

    // ARKUSZ 5: PODSUMOWANIE z Kroku 6 
    // ============================================================================
    const wsPodsumowanie = workbook.addWorksheet('5. Podsumowanie (Krok 6)');
    wsPodsumowanie.columns = [
        { header: 'KATEGORIA KOSZTOWA', key: 'kategoria', width: 50 },
        { header: 'OBECNIE (STANDARD)', key: 'standard', width: 25, style: { numFmt: styles.currencyPlain } },
        { header: activeModel === 'PRIME' ? 'Eliton Prime™ PLUS' : 'Eliton Prime™', key: 'eliton', width: 35, style: { numFmt: styles.currencyPlain } },
        { header: 'ZMIANA', key: 'roznica', width: 20, style: { numFmt: styles.currencyPlain } }
    ];

    applySegmentedHeaders(wsPodsumowanie, 'podsumowanie');

    
      // Wstawiamy info z kroku podsumowanie
      const totalProvision = wyniki.podsumowanie.prowizja;
      wsPodsumowanie.addRow(['* Szczegółowe zestawienie i różnice dla poszczególnych pracowników znajdują się w arkuszu "4. Porównanie Szczegółowe".']);
      const wsPodLastRow = wsPodsumowanie.lastRow;
      if (wsPodLastRow) {
          const infoCell = wsPodLastRow.getCell(1);
          infoCell.font = { italic: true, color: { argb: 'FF64748B' } };
      }
      wsPodsumowanie.addRow([]);
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

    addSummaryRow('Wynagrodzenie pracowników Brutto\r\nZ UMOWY', stdBrutto, strBrutto);
    addSummaryRow('ZUS Pracodawcy\r\nEMERYTALNA, RENTOWA, WYP.', stdZusPracodawca, strZusPracodawca);
    addSummaryRow('ZUS Pracownika\r\nSPOŁECZNE + ZDROWOTNE', stdZusPracown, strZusPracown);
    
    const nettoRow = addSummaryRow('Netto Pracownika\r\nDO WYPŁATY (NA RĘKĘ)', stdNetto, strNetto);
    // Netto has diff: zielone dla >=0 w aplikacji, ale w arkuszu zostawmy formatDiff
    if (strNetto - stdNetto >= -0.01) {
        nettoRow.getCell(4).font = { color: { argb: 'FF22C55E' }, bold: true };
    }

    wsPodsumowanie.addRow({}); // spacer

    addSummaryRow(`Opłata serwisowa EBS\r\n${prowizjaProc}% wartości nominalnej świadczeń`, null, feeAmount, feeAmount);

    if (adminAmount > 0) {
        addSummaryRow('Bonus dla Działu Księgowo-Kadrowego\r\nwyliczany od świadczenia netto\r\n2% WYPŁACANE PRZEZ STRATTON', null, adminAmount, adminAmount);
    }
    if (includeRaises && raiseAmount > 0) {
        addSummaryRow('Dodatkowa podwyżka wynagrodzenia dla pracowników\r\nwyliczana od świadczenia netto\r\n+4% świadczeń rzeczowych EBS finansowane przez Stratton Prime', null, raiseAmount, raiseAmount);
    }

    wsPodsumowanie.addRow({}); // spacer

    // SUM ROW (CAŁKOWITY KOSZT)
    const stdKosztMiesiac = wyniki.podsumowanie.sumaKosztStandard;
    const strKosztMiesiac = wyniki.podsumowanie.sumaKosztPodzial + totalProvision;
    const oszczednosc = stdKosztMiesiac - strKosztMiesiac; // Zwykle Standard - Eliton (dodatnia oszczędność na zielono)

    const sumRow = wsPodsumowanie.addRow({
        kategoria: 'CAŁKOWITY KOSZT BRUTTO PRACODAWCY\r\n(Miesięcznie)',
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
