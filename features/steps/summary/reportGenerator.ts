
import { Firma } from '../../../entities/company/model';
import { GlobalneWyniki } from '../../../entities/calculation/model';
import { formatPLN } from '../../../shared/utils/formatters';

interface ReportData {
    firma: Firma;
    wyniki: GlobalneWyniki;
    prowizjaProc: number;
}

export const generateManagementReport = async ({ firma, wyniki, prowizjaProc }: ReportData) => {
    if (!window.ExcelJS) {
        alert('Biblioteka ExcelJS nie jest załadowana.');
        return;
    }

    const Workbook = window.ExcelJS.Workbook;
    const workbook = new Workbook();

    // ==========================================================================================
    // SHEET 1: PODSUMOWANIE 
    // ==========================================================================================
    const wsSummary = workbook.addWorksheet('Podsumowanie Menadżerskie', {
        views: [{ showGridLines: false }]
    });

    // --- KOLUMNY ---
    wsSummary.columns = [
        { key: 'A', width: 5 },  // Margin
        { key: 'B', width: 35 }, // Kategoria
        { key: 'C', width: 20 }, // Model Standard
        { key: 'D', width: 20 }, // Model Eliton
        { key: 'E', width: 20 }, // Różnica
        { key: 'F', width: 20 }, // Roczna
    ];

    // --- HEADER ---
    wsSummary.mergeCells('B2:F2');
    const titleCell = wsSummary.getCell('B2');
    titleCell.value = `RAPORT OPTYMALIZACJI KOSZTÓW: ${firma.nazwa.toUpperCase()}`;
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF0F172A' } }; // Slate 900

    wsSummary.mergeCells('B3:F3');
    const dateCell = wsSummary.getCell('B3');
    dateCell.value = `Data symulacji: ${new Date().toLocaleDateString('pl-PL')}`;
    dateCell.font = { name: 'Calibri', size: 10, color: { argb: 'FF64748B' } };

    // --- LOGIKA DANYCH ---
    const stats = wyniki.podsumowanie;
    const isPlus = prowizjaProc === 26;

    // Rozbicie kosztów dla modelu Eliton
    // W modelu Standard: Prowizja = 0
    // W modelu Eliton (Standard 28%): Prowizja = Opłata
    // W modelu Eliton (Plus 26%): Prowizja = Opłata (20%) + Podwyżki (4%) + Admin (2%)
    
    const prowizjaTotal = stats.prowizja;
    let feeCost = prowizjaTotal;
    let raiseCost = 0;

    if (isPlus) {
        feeCost = prowizjaTotal * (20 / 26);
        raiseCost = prowizjaTotal * (6 / 26); // 4% workers + 2% admin
    }

    const standardTotal = stats.sumaKosztStandard;
    const elitonTotal = stats.sumaKosztPodzial + prowizjaTotal; // Koszt pracodawcy + cała prowizja (w tym podwyżki)
    const savingsMonth = standardTotal - elitonTotal;
    const savingsYear = savingsMonth * 12;

    // --- KPI SECTION (Row 5-6) ---
    const kpiLabelsRow = wsSummary.getRow(5);
    kpiLabelsRow.values = ['', 'Aktualny Koszt (Msc)', 'Nowy Koszt (Msc)', 'Miesięczna Oszczędność', 'Roczna Oszczędność'];
    kpiLabelsRow.font = { name: 'Calibri', size: 10, color: { argb: 'FF475569' } };
    
    const kpiValuesRow = wsSummary.getRow(6);
    kpiValuesRow.values = ['', standardTotal, elitonTotal, savingsMonth, savingsYear];
    kpiValuesRow.font = { name: 'Calibri', size: 12, bold: true };
    kpiValuesRow.getCell(2).numFmt = '#,##0.00 zł'; // Standard
    kpiValuesRow.getCell(3).numFmt = '#,##0.00 zł'; // Nowy
    kpiValuesRow.getCell(4).numFmt = '#,##0.00 zł'; // Oszczędność Msc
    kpiValuesRow.getCell(4).font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF059669' } }; // Green
    kpiValuesRow.getCell(5).numFmt = '#,##0.00 zł'; // Oszczędność Rok
    kpiValuesRow.getCell(5).font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF059669' } }; // Green

    // --- TABELA PORÓWNAWCZA (Row 9+) ---
    const tableHeaderRow = wsSummary.getRow(9);
    tableHeaderRow.values = ['', 'Kategoria', 'Aktualny Koszt Zatrudnienia', 'Eliton Prime™ (Model Docelowy)', 'Różnica'];
    
    // Styl nagłówka tabeli
    ['B9', 'C9', 'D9', 'E9'].forEach(key => {
        const cell = wsSummary.getCell(key);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }; // Slate 200
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF334155' } };
        cell.border = { bottom: { style: 'thin', color: { argb: 'FF94A3B8' } } };
    });

    // Dane wierszy
    const rows = [
        {
            name: 'Wynagrodzenia Brutto',
            std: wyniki.szczegoly.reduce((acc, w) => acc + w.standard.brutto, 0),
            new: wyniki.szczegoly.reduce((acc, w) => acc + w.podzial.pit.lacznyPrzychod, 0) 
        },
        {
            name: 'ZUS Pracodawcy',
            std: wyniki.szczegoly.reduce((acc, w) => acc + w.standard.zusPracodawca.suma, 0),
            new: wyniki.szczegoly.reduce((acc, w) => acc + w.podzial.zasadnicza.zusPracodawca.suma, 0)
        },
        {
            name: `Opłata serwisowa EBS\n${prowizjaProc}% wartości nominalnej świadczeń`,
            std: 0,
            new: feeCost
        }
    ];

    if (isPlus) {
        rows.push({
            name: 'Budżet na dodatkowe podwyżki',
            std: 0,
            new: raiseCost
        });
    }

    let currentRowIdx = 10;
    rows.forEach(r => {
        const row = wsSummary.getRow(currentRowIdx);
        const diff = r.std - r.new; // For cost items, reduction is positive difference usually, but here table asks for Difference (New - Old or Old - New). Screenshot implies Cost Reduction is positive.
        // Let's do simple subtraction: Standard - Eliton
        const diffVal = r.std - r.new;

        row.getCell(2).value = r.name;
        row.getCell(3).value = r.std;
        row.getCell(4).value = r.new;
        row.getCell(5).value = diffVal;

        // Formats
        row.getCell(3).numFmt = '#,##0.00 zł';
        row.getCell(4).numFmt = '#,##0.00 zł';
        row.getCell(5).numFmt = '#,##0.00 zł';
        
        // Special style for raises
        if (r.name.includes('podwyżki')) {
            row.getCell(2).font = { italic: true, color: { argb: 'FFD97706' } }; // Amber
            row.getCell(4).font = { bold: true };
        }

        currentRowIdx++;
    });

    // TOTAL ROW
    const totalRow = wsSummary.getRow(currentRowIdx);
    totalRow.getCell(2).value = 'CAŁKOWITY KOSZT BRUTTO PRACODAWCY';
    totalRow.getCell(3).value = standardTotal;
    totalRow.getCell(4).value = elitonTotal;
    totalRow.getCell(5).value = savingsMonth;

    const totalStyle = (cell: any) => {
        cell.font = { bold: true, size: 11 };
        cell.border = { top: { style: 'double' } };
        cell.numFmt = '#,##0.00 zł';
    };
    
    totalStyle(totalRow.getCell(2));
    totalStyle(totalRow.getCell(3));
    totalStyle(totalRow.getCell(4));
    
    const diffCell = totalRow.getCell(5);
    totalStyle(diffCell);
    diffCell.font = { bold: true, size: 11, color: { argb: 'FF059669' } }; // Green

    // ==========================================================================================
    // SHEET 2: KALKULATOR PODWYŻEK (DETALE)
    // ==========================================================================================
    const wsDetails = workbook.addWorksheet('Kalkulator Podwyżek');

    // --- KOLUMNY ---
    wsDetails.columns = [
        { key: 'lp', width: 6 },
        { key: 'name', width: 25 },
        { key: 'currentNetto', width: 15 },
        { key: 'newBase', width: 15 },
        { key: 'benefit', width: 15 },
        { key: 'sysRaise', width: 15 },
        { key: 'adminBonus', width: 15 },
        { key: 'extraRaise', width: 18 }, // Podwyżka od pracodawcy (input)
        { key: 'totalNetto', width: 18 },
        { key: 'gain', width: 15 }
    ];

    // --- HEADER (Dark Style from Screenshot) ---
    wsDetails.mergeCells('B2:J2');
    const dTitle = wsDetails.getCell('B2');
    dTitle.value = 'SYMULACJA PODZIAŁU NADWYŻKI I PODWYŻEK';
    dTitle.font = { bold: true, size: 12, color: { argb: 'FF1E40AF' } };

    // --- TABLE HEADER (Row 4) ---
    const headers = [
        'LP', 
        'Imię i Nazwisko', 
        'Obecne\nNetto', 
        'Kwota NETTO\n(ZUS)', 
        'Świadczenie\n(Benefit bez ZUS)', 
        'Podwyżka\nSystemowa', 
        'Bonus\nAdministracyjny\n(2% od SRATTON)', 
        'Podwyżka\nDodatkowa\n(Od Pracodawcy)', 
        'NOWE ŁĄCZNE\nNETTO PRACOWNIKA', 
        'ZMIANA\n(ZYSK PRACOWNIKA)'
    ];

    const headerRow = wsDetails.getRow(4);
    headerRow.height = 45;
    
    headers.forEach((h, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value = h;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }; // Slate 900
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9, name: 'Calibri' };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = { right: { style: 'thin', color: { argb: 'FF334155' } } };
    });

    // --- DANE ---
    let rowIdx = 5;
    wyniki.szczegoly.forEach((w, i) => {
        const row = wsDetails.getRow(rowIdx);
        
        // Logika podwyżek dla wiersza
        const benefitBrutto = w.podzial.swiadczenie.brutto;
        
        // Jeśli model Plus (26%), 4/26 idzie na podwyżkę pracownika, 2/26 na admin
        // UWAGA: Te wartości są brutto (część świadczenia). 
        // W uproszczeniu symulacji Excela, zakładamy że to netto benefitu
        // lub wyliczamy proporcjonalnie.
        
        let sysRaise = 0;
        let adminBonus = 0;

        if (isPlus) {
            sysRaise = benefitBrutto * (4 / 26);
            adminBonus = benefitBrutto * (2 / 26);
        }

        // Nowe łączne netto = Netto z Podziału + Podwyżka systemowa (Netto)
        // W modelu obliczeniowym 'taxEngine', podział już zwraca 'doWyplaty', które jest sumą.
        // Jednak w modelu Plus, 'doWyplaty' w silniku nie uwzględnia "Podwyżki Systemowej" jeśli nie została dodana do nettoDocelowego.
        // Tutaj na raporcie pokazujemy to jako dodatkowy element.
        
        // Zakładamy, że 'Podwyżka Systemowa' jest wypłacana "obok" (np. jako premia) lub wliczona w benefit.
        // Dla celów raportu przyjmijmy:
        const currentNetto = w.standard.netto;
        const newBase = w.podzial.zasadnicza.nettoGotowka;
        const benefitNetto = w.podzial.swiadczenie.netto; // To jest to co user wpisał, aby uzyskać nettoDocelowe
        
        // W modelu Plus, realne netto pracownika jest WIĘKSZE o sysRaise (minus ew. podatek, ale benefit jest opodatkowany ryczałtowo w modelu, tu upraszczamy dla raportu menadżerskiego)
        // Przyjmijmy że sysRaise jest kwotą "na rękę" (lub brutto benefitowym)
        
        // Aby raport się zgadzał:
        const totalNewNetto = newBase + benefitNetto + sysRaise; 
        const change = totalNewNetto - currentNetto;

        row.getCell(1).value = i + 1;
        row.getCell(2).value = `${w.pracownik.imie} ${w.pracownik.nazwisko}`;
        row.getCell(3).value = currentNetto;
        row.getCell(4).value = newBase;
        row.getCell(5).value = benefitNetto;
        row.getCell(6).value = sysRaise;
        row.getCell(7).value = adminBonus; // To idzie do firmy, nie pracownika (ale jest w tabeli)
        row.getCell(8).value = 0; // Placeholder na ręczne wpisanie
        
        // Formuła Excela dla sumy: D + E + F + H
        // =D5+E5+F5+H5
        row.getCell(9).value = { formula: `D${rowIdx}+E${rowIdx}+F${rowIdx}+H${rowIdx}` };
        
        // Formuła zmiany: I - C
        row.getCell(10).value = { formula: `I${rowIdx}-C${rowIdx}` };

        // Style wiersza
        for (let c = 1; c <= 10; c++) {
            const cell = row.getCell(c);
            cell.alignment = { vertical: 'middle', horizontal: c === 2 ? 'left' : 'center' };
            cell.border = { bottom: { style: 'dotted', color: { argb: 'FFCBD5E1' } } };
            if (c > 2) cell.numFmt = '#,##0.00';
        }
        
        // Wyróżnienie zysku
        row.getCell(10).font = { bold: true, color: { argb: 'FF059669' } };
        row.getCell(9).font = { bold: true };

        rowIdx++;
    });

    // --- GENERATE ---
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `Raport_Menadzerski_${firma.nazwa || 'Firma'}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
};
