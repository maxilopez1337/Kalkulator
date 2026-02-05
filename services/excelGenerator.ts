
import { Firma } from '../entities/company/model';
import { GlobalneWyniki } from '../entities/calculation/model';

interface ReportData {
    firma: Firma;
    wyniki: GlobalneWyniki;
    prowizjaProc: number;
}

declare global {
    interface Window {
        ExcelJS: any;
    }
}

const checkExcelJS = () => {
    if (!window.ExcelJS) {
        alert('Biblioteka ExcelJS nie jest załadowana.');
        return false;
    }
    return true;
};

const saveWorkbook = async (workbook: any, fileName: string) => {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
};

export const excelGenerator = {
    // --- 1. RAPORT MENADŻERSKI (PODSUMOWANIE) ---
    generateManagementReport: async ({ firma, wyniki, prowizjaProc }: ReportData) => {
        if (!checkExcelJS()) return;

        const Workbook = window.ExcelJS.Workbook;
        const workbook = new Workbook();

        // SHEET 1: Podsumowanie
        const wsSummary = workbook.addWorksheet('Podsumowanie', { views: [{ showGridLines: false }] });

        wsSummary.columns = [
            { key: 'A', width: 5 }, { key: 'B', width: 35 }, 
            { key: 'C', width: 20 }, { key: 'D', width: 20 }, 
            { key: 'E', width: 20 }, { key: 'F', width: 20 }
        ];

        // Header
        wsSummary.mergeCells('B2:F2');
        const titleCell = wsSummary.getCell('B2');
        titleCell.value = `RAPORT OPTYMALIZACJI KOSZTÓW: ${firma.nazwa.toUpperCase()}`;
        titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF0F172A' } };

        wsSummary.mergeCells('B3:F3');
        const dateCell = wsSummary.getCell('B3');
        dateCell.value = `Data symulacji: ${new Date().toLocaleDateString('pl-PL')}`;
        dateCell.font = { name: 'Calibri', size: 10, color: { argb: 'FF64748B' } };

        // Data Logic
        const stats = wyniki.podsumowanie;
        const isPlus = prowizjaProc === 26;
        const prowizjaTotal = stats.prowizja;
        let feeCost = prowizjaTotal;
        let raiseCost = 0;

        if (isPlus) {
            feeCost = prowizjaTotal * (20 / 26);
            raiseCost = prowizjaTotal * (6 / 26);
        }

        const standardTotal = stats.sumaKosztStandard;
        const elitonTotal = stats.sumaKosztPodzial + prowizjaTotal;
        const savingsMonth = standardTotal - elitonTotal;
        const savingsYear = savingsMonth * 12;

        // KPI Rows
        const kpiLabelsRow = wsSummary.getRow(5);
        kpiLabelsRow.values = ['', 'Aktualny Koszt (Msc)', 'Nowy Koszt (Msc)', 'Miesięczna Oszczędność', 'Roczna Oszczędność'];
        kpiLabelsRow.font = { name: 'Calibri', size: 10, color: { argb: 'FF475569' } };
        
        const kpiValuesRow = wsSummary.getRow(6);
        kpiValuesRow.values = ['', standardTotal, elitonTotal, savingsMonth, savingsYear];
        kpiValuesRow.font = { name: 'Calibri', size: 12, bold: true };
        [2,3,4,5].forEach(c => kpiValuesRow.getCell(c).numFmt = '#,##0.00 zł');
        kpiValuesRow.getCell(4).font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF059669' } };
        kpiValuesRow.getCell(5).font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF059669' } };

        // Comparison Table
        const tableHeaderRow = wsSummary.getRow(9);
        tableHeaderRow.values = ['', 'Kategoria', 'Aktualny system rozliczeń', 'Model Eliton Prime PLUS', 'Różnica'];
        ['B9', 'C9', 'D9', 'E9'].forEach(key => {
            const cell = wsSummary.getCell(key);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF334155' } };
            cell.border = { bottom: { style: 'thin', color: { argb: 'FF94A3B8' } } };
        });

        const rows = [
            { name: 'Wynagrodzenia Brutto', std: wyniki.szczegoly.reduce((acc, w) => acc + w.standard.brutto, 0), new: wyniki.szczegoly.reduce((acc, w) => acc + w.podzial.pit.lacznyPrzychod, 0) },
            { name: 'ZUS Pracodawcy', std: wyniki.szczegoly.reduce((acc, w) => acc + w.standard.zusPracodawca.suma, 0), new: wyniki.szczegoly.reduce((acc, w) => acc + w.podzial.zasadnicza.zusPracodawca.suma, 0) },
            { name: 'Koszt Operacyjny (Prowizja)', std: 0, new: feeCost }
        ];
        if (isPlus) rows.push({ name: 'Budżet na dodatkowe podwyżki', std: 0, new: raiseCost });

        let currentRowIdx = 10;
        rows.forEach(r => {
            const row = wsSummary.getRow(currentRowIdx);
            const diffVal = r.std - r.new;
            row.getCell(2).value = r.name;
            row.getCell(3).value = r.std;
            row.getCell(4).value = r.new;
            row.getCell(5).value = diffVal;
            [3,4,5].forEach(c => row.getCell(c).numFmt = '#,##0.00 zł');
            if (r.name.includes('podwyżki')) {
                row.getCell(2).font = { italic: true, color: { argb: 'FFD97706' } };
                row.getCell(4).font = { bold: true };
            }
            currentRowIdx++;
        });

        const totalRow = wsSummary.getRow(currentRowIdx);
        totalRow.getCell(2).value = 'CAŁKOWITY KOSZT';
        totalRow.getCell(3).value = standardTotal;
        totalRow.getCell(4).value = elitonTotal;
        totalRow.getCell(5).value = savingsMonth;
        [2,3,4,5].forEach(c => {
            const cell = totalRow.getCell(c);
            cell.font = { bold: true, size: 11 };
            cell.border = { top: { style: 'double' } };
            if(c>2) cell.numFmt = '#,##0.00 zł';
        });
        totalRow.getCell(5).font = { bold: true, size: 11, color: { argb: 'FF059669' } };

        // SHEET 2: Kalkulator Podwyżek
        const wsDetails = workbook.addWorksheet('Kalkulator Podwyżek');
        wsDetails.columns = [
            { key: 'lp', width: 6 }, { key: 'name', width: 25 },
            { key: 'currentNetto', width: 15 }, { key: 'newBase', width: 15 },
            { key: 'benefit', width: 15 }, { key: 'sysRaise', width: 15 },
            { key: 'adminBonus', width: 15 }, { key: 'extraRaise', width: 18 },
            { key: 'totalNetto', width: 18 }, { key: 'gain', width: 15 }
        ];

        wsDetails.mergeCells('B2:J2');
        const dTitle = wsDetails.getCell('B2');
        dTitle.value = 'SYMULACJA PODZIAŁU NADWYŻKI I PODWYŻEK';
        dTitle.font = { bold: true, size: 12, color: { argb: 'FF1E40AF' } };

        const headers = ['LP', 'Imię i Nazwisko', 'Obecne\nNetto', 'Kwota NETTO\n(ZUS)', 'Świadczenie\n(Benefit bez ZUS)', 'Podwyżka\nSystemowa od STRATTON', 'Bonus\nAdministracyjny\n(2% - Budżet)', 'Podwyżka\nDodatkowa\n(Od Pracodawcy)', 'NOWE ŁĄCZNE\nNETTO PRACOWNIKA', 'ZMIANA\n(ZYSK PRACOWNIKA)'];
        const headerRow = wsDetails.getRow(4);
        headerRow.height = 45;
        headers.forEach((h, i) => {
            const cell = headerRow.getCell(i + 1);
            cell.value = h;
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9, name: 'Calibri' };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = { right: { style: 'thin', color: { argb: 'FF334155' } } };
        });

        let rowIdx = 5;
        wyniki.szczegoly.forEach((w, i) => {
            const row = wsDetails.getRow(rowIdx);
            const benefitBrutto = w.podzial.swiadczenie.brutto;
            let sysRaise = 0;
            let adminBonus = 0;
            if (isPlus) {
                sysRaise = benefitBrutto * (4 / 26);
                adminBonus = benefitBrutto * (2 / 26);
            }
            const currentNetto = w.standard.netto;
            const newBase = w.podzial.zasadnicza.nettoGotowka;
            const benefitNetto = w.podzial.swiadczenie.netto;

            row.getCell(1).value = i + 1;
            row.getCell(2).value = `${w.pracownik.imie} ${w.pracownik.nazwisko}`;
            row.getCell(3).value = currentNetto;
            row.getCell(4).value = newBase;
            row.getCell(5).value = benefitNetto;
            row.getCell(6).value = sysRaise;
            row.getCell(7).value = adminBonus;
            row.getCell(8).value = 0;
            row.getCell(9).value = { formula: `D${rowIdx}+E${rowIdx}+F${rowIdx}+H${rowIdx}` };
            row.getCell(10).value = { formula: `I${rowIdx}-C${rowIdx}` };

            for (let c = 1; c <= 10; c++) {
                const cell = row.getCell(c);
                cell.alignment = { vertical: 'middle', horizontal: c === 2 ? 'left' : 'center' };
                cell.border = { bottom: { style: 'dotted', color: { argb: 'FFCBD5E1' } } };
                if (c > 2) cell.numFmt = '#,##0.00';
            }
            row.getCell(10).font = { bold: true, color: { argb: 'FF059669' } };
            row.getCell(9).font = { bold: true };
            rowIdx++;
        });

        await saveWorkbook(workbook, `Raport_Menadzerski_${firma.nazwa || 'Firma'}`);
    },

    // --- 2. SZABLON IMPORTU (v2.6.1) ---
    generateImportTemplate: async (rowsToGenerate: number = 10) => {
        if (!checkExcelJS()) return;

        const Workbook = window.ExcelJS.Workbook;
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet('Szablon Import Pracowników');

        worksheet.columns = [
            { key: 'A', width: 25 }, { key: 'B', width: 15 }, { key: 'C', width: 15 },
            { key: 'D', width: 25 }, { key: 'E', width: 45 }, { key: 'F', width: 18 },
            { key: 'G', width: 20 }, { key: 'H', width: 25 }, { key: 'I', width: 30 },
            { key: 'J', width: 15 }, { key: 'K', width: 25 }
        ];

        // Headers
        const headerRow = worksheet.getRow(1);
        headerRow.height = 45; 
        headerRow.values = ['Imię i Nazwisko', 'Data urodzenia', 'Płeć K/M', 'Rodzaj umowy\nETAT/ZLECENIE', 'Składki ZUS\n(Wybierz z listy)', 'Wynagrodzenie\nNETTO', 'Koszty uzyskania\n[AUTO 250/20%]', 'Kwota zmniejszająca\npodatek', 'Ulga dla osób\nponiżej 26 roku życia', 'Zaliczka PIT\n[AUTO 12%/0%]', 'Wynagrodzenie "na rękę"'];
        headerRow.eachCell((cell: any) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10, name: 'Calibri' };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });

        // Examples
        const exampleRow = worksheet.getRow(2);
        exampleRow.height = 30;
        exampleRow.values = ['Jan Kowalski', 'DD.MM.RRRR', 'Wybierz z listy', 'Wybierz z listy', 'Wybierz z listy', 5000, 'AUTO (formuła)', '300 / 150 / 100 / 0', 'TAK / NIE', 'AUTO (formuła)', 'Info'];
        exampleRow.eachCell((cell: any) => {
            cell.font = { color: { argb: 'FF000000' }, size: 10, name: 'Calibri' };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });

        // Data & Validation
        const startRow = 3;
        const plecList = '"M,K"';
        const umowaList = '"Umowa o pracę,Umowa zlecenie"';
        const zusList = '"Pełne składki,Pełne składki z dobrowolną chorobową,Bez dobrowolnej chorobowej,Student/uczeń do 26 (bez ZUS),Inny tytuł do ubezpieczeń (tylko zdrowotna),Emeryt/rencista"';
        const ulgaList = '"TAK,NIE"';

        for (let i = 0; i < rowsToGenerate; i++) {
            const rowIndex = startRow + i;
            const row = worksheet.getRow(rowIndex);
            
            row.eachCell({ includeEmpty: true }, (cell: any, colNumber: number) => {
                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                if (colNumber === 1 || colNumber === 5) cell.alignment = { vertical: 'middle', horizontal: 'left' };
            });

            if (i === 0) {
                row.getCell(1).value = 'Jan Kowalski (Przykład)';
                row.getCell(2).value = '1990-01-15';
                row.getCell(3).value = 'M';
                row.getCell(4).value = 'Umowa o pracę';
                row.getCell(5).value = 'Pełne składki';
                row.getCell(6).value = 5000;
                row.getCell(8).value = 300;
                row.getCell(9).value = 'NIE';
            } else if (i === 1) {
                row.getCell(1).value = 'Anna Nowak (Student)';
                row.getCell(2).value = '2002-05-20';
                row.getCell(3).value = 'K';
                row.getCell(4).value = 'Umowa zlecenie';
                row.getCell(5).value = 'Student/uczeń do 26 (bez ZUS)';
                row.getCell(6).value = 4500;
                row.getCell(8).value = 0;
                row.getCell(9).value = 'TAK';
            }

            worksheet.getCell(`C${rowIndex}`).dataValidation = { type: 'list', allowBlank: true, formulae: [plecList] };
            worksheet.getCell(`D${rowIndex}`).dataValidation = { type: 'list', allowBlank: true, formulae: [umowaList] };
            worksheet.getCell(`E${rowIndex}`).dataValidation = { type: 'list', allowBlank: true, formulae: [zusList] };
            worksheet.getCell(`I${rowIndex}`).dataValidation = { type: 'list', allowBlank: true, formulae: [ulgaList] };

            // Formulas
            const colD = `D${rowIndex}`;
            const colI = `I${rowIndex}`;
            
            const cellG = worksheet.getCell(`G${rowIndex}`);
            cellG.value = { formula: `IF(${colD}="Umowa zlecenie","20%","250")` };
            cellG.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
            cellG.font = { color: { argb: 'FF0284C7' }, bold: true };

            const cellJ = worksheet.getCell(`J${rowIndex}`);
            cellJ.value = { formula: `IF(${colI}="TAK",0,0.12)` };
            cellJ.numFmt = '0%';
            cellJ.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
            cellJ.font = { color: { argb: 'FF0284C7' }, bold: true };
        }

        await saveWorkbook(workbook, `Szablon_Import_Pracownikow_v2.6.1`);
    }
};
