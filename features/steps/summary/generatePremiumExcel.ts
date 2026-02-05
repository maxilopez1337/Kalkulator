

import { Firma } from '../../../entities/company/model';
import { GlobalneWyniki } from '../../../entities/calculation/model';

declare global {
    interface Window {
        ExcelJS: any;
    }
}

interface GeneratorOptions {
    firma: Firma;
    wyniki: GlobalneWyniki;
    prowizjaProc: number;
}

// Helper do zaokrąglania
const round = (val: number) => Math.round(val * 100) / 100;

export const generatePremiumExcel = async ({ firma, wyniki, prowizjaProc }: GeneratorOptions) => {
    if (!window.ExcelJS) {
        alert('Biblioteka ExcelJS nie została załadowana. Odśwież stronę.');
        return;
    }

    const Workbook = window.ExcelJS.Workbook;
    const workbook = new Workbook();

    // --- PRZYGOTOWANIE DANYCH (OBLICZENIA STATYCZNE DLA NAGŁÓWKA) ---
    const totalStandardCost = wyniki.szczegoly.reduce((acc, w) => {
        return acc + round(w.standard.kosztPracodawcy);
    }, 0);

    // --- DEFINICJA STYLI ---
    const styles = {
        navyFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } },
        navyFont: { color: { argb: 'FFFFFFFF' }, bold: true, size: 12 },
        headerFont: { bold: true, size: 10, color: { argb: 'FF334155' } },
        headerFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } },
        currency: '#,##0.00 "zł"',
        inputFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF000' } } // Żółty dla inputów
    };

    // ==========================================================================================
    // ARKUSZ 1: PODSUMOWANIE (DASHBOARD)
    // ==========================================================================================
    const wsDash = workbook.addWorksheet('Podsumowanie', {
        views: [{ showGridLines: false }] // Białe tło (brak siatki)
    });
    
    // Nagłówek Raportu (B2)
    wsDash.mergeCells('B2:F2');
    wsDash.getCell('B2').value = `Ilustracja finansowa oszczędności po wdrożeniu modelu Eliton Prime PLUS dla firmy : ${firma.nazwa || 'FIRMA'}`;
    wsDash.getCell('B2').font = { size: 16, bold: true, color: { argb: 'FF0F172A' } };
    
    wsDash.getCell('B3').value = `Data symulacji: ${new Date().toLocaleDateString()}`;
    wsDash.getCell('B3').font = { color: { argb: 'FF64748B' } };

    // Kafelki KPI (Oparte na formułach odnoszących się do tabeli poniżej)
    const kpiRow = 5;
    
    // Ustawienie wysokości wiersza dla nagłówków KPI, aby pomieścić zawinięty tekst
    wsDash.getRow(kpiRow).height = 45;

    // Styl wyrównania dla zakresu B5:E9 (Wyśrodkowanie)
    const centerAlignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    // 1. Aktualny Koszt (B5)
    const cellB5 = wsDash.getCell(`B${kpiRow}`);
    cellB5.value = "Aktualny koszt miesięczny";
    cellB5.alignment = centerAlignment;
    cellB5.font = { size: 10, color: { argb: 'FF64748B' } }; // Styl etykiety

    const cellB6 = wsDash.getCell(`B${kpiRow+1}`);
    cellB6.value = totalStandardCost;
    cellB6.numFmt = styles.currency;
    cellB6.font = { size: 14, color: { argb: 'FF64748B' } };
    cellB6.alignment = centerAlignment;

    // 2. Nowy Koszt (C5)
    const cellC5 = wsDash.getCell(`C${kpiRow}`);
    cellC5.value = "Koszt po wdrożeniu modelu Eliton Prime PLUS (msc)";
    cellC5.alignment = centerAlignment;
    cellC5.font = { size: 10, color: { argb: 'FF64748B' } }; // Styl etykiety

    const newCostCell = wsDash.getCell(`C${kpiRow+1}`);
    newCostCell.numFmt = styles.currency;
    newCostCell.font = { size: 14, color: { argb: 'FF0F172A' }, bold: true };
    newCostCell.alignment = centerAlignment;

    // 3. Miesięczna Oszczędność (D5)
    const cellD5 = wsDash.getCell(`D${kpiRow}`);
    cellD5.value = "Miesięczna oszczędność po podwyżkach";
    cellD5.alignment = centerAlignment;
    cellD5.font = { size: 10, color: { argb: 'FF64748B' } };

    const cellD6 = wsDash.getCell(`D${kpiRow+1}`);
    cellD6.value = { formula: `B${kpiRow+1}-C${kpiRow+1}` };
    cellD6.numFmt = styles.currency;
    cellD6.font = { size: 14, color: { argb: 'FF059669' }, bold: true };
    cellD6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
    cellD6.alignment = centerAlignment;

    // 4. Roczna Oszczędność (E5)
    const cellE5 = wsDash.getCell(`E${kpiRow}`);
    cellE5.value = "Roczna Oszczędność";
    cellE5.alignment = centerAlignment;
    cellE5.font = { size: 10, color: { argb: 'FF64748B' } };

    const cellE6 = wsDash.getCell(`E${kpiRow+1}`);
    cellE6.value = { formula: `D${kpiRow+1}*12` };
    cellE6.numFmt = styles.currency;
    cellE6.font = { size: 14, color: { argb: 'FF059669' }, bold: true };
    cellE6.alignment = centerAlignment;

    // Tabela porównawcza (Wiersz 9) - ZMIANA NAGŁÓWKÓW C9 i D9
    const tableRow = 9;
    const headers = ['Kategoria', 'Aktualny system wynagradzania', 'Model Eliton Prime PLUS', 'Różnica'];
    headers.forEach((h, i) => {
        const cell = wsDash.getCell(tableRow, 2 + i);
        cell.value = h;
        cell.fill = styles.headerFill;
        cell.font = styles.headerFont;
        cell.alignment = centerAlignment;
        cell.border = { bottom: { style: 'thick', color: { argb: 'FF334155' } } };
    });

    // Helper do dodawania wierszy tabeli głównej
    const addDashboardRow = (label: string, stdValue: number | null, trgValueOrFormula: any, r: number, isTotal = false, customStyle: any = {}) => {
        wsDash.getCell(`B${r}`).value = label;
        wsDash.getCell(`C${r}`).value = stdValue ?? 0;
        wsDash.getCell(`D${r}`).value = trgValueOrFormula;
        wsDash.getCell(`E${r}`).value = { formula: `C${r}-D${r}` }; // Standard - Eliton

        ['C', 'D', 'E'].forEach(c => {
            wsDash.getCell(`${c}${r}`).numFmt = styles.currency;
            if (isTotal) wsDash.getCell(`${c}${r}`).font = { bold: true };
        });

        if (customStyle.font) wsDash.getCell(`B${r}`).font = customStyle.font;
        if (customStyle.fill) wsDash.getCell(`D${r}`).fill = customStyle.fill;
    };

    // Obliczanie statycznych sum dla wierszy tabeli
    const statsStandard = {
        brutto: wyniki.szczegoly.reduce((acc, w) => acc + round(w.standard.brutto), 0),
        zus: wyniki.szczegoly.reduce((acc, w) => acc + round(w.standard.zusPracodawca.suma), 0)
    };
    
    const statsStratton = {
        brutto: wyniki.szczegoly.reduce((acc, w) => {
            const isStudent = w.pracownik.trybSkladek === 'STUDENT_UZ';
            return acc + round(isStudent ? w.standard.brutto : w.podzial.pit.lacznyPrzychod);
        }, 0),
        zus: wyniki.szczegoly.reduce((acc, w) => {
            const isStudent = w.pracownik.trybSkladek === 'STUDENT_UZ';
            return acc + round(isStudent ? w.standard.zusPracodawca.suma : w.podzial.zasadnicza.zusPracodawca.suma);
        }, 0),
        prowizjaTotal: round(wyniki.szczegoly.reduce((acc, w) => {
            const isStudent = w.pracownik.trybSkladek === 'STUDENT_UZ';
            if (isStudent) return acc;
            return acc + round(w.podzial.swiadczenie.brutto);
        }, 0) * (prowizjaProc / 100))
    };

    // Wyliczenie samej opłaty serwisowej (Success Fee)
    const isPlus = prowizjaProc === 26;
    let feeCost = statsStratton.prowizjaTotal;
    if (isPlus) {
        // W modelu Plus 26%: 20% to Opłata, 4% to Podwyżka, 2% to Bonus Admin
        // Fee = Total * (20/26)
        feeCost = statsStratton.prowizjaTotal * (20 / 26);
    }

    let currentRow = tableRow + 1;

    // 1. Wynagrodzenia Brutto
    addDashboardRow("Wynagrodzenia Brutto", statsStandard.brutto, statsStratton.brutto, currentRow++);
    
    // 2. ZUS Pracodawcy
    addDashboardRow("ZUS Pracodawcy", statsStandard.zus, statsStratton.zus, currentRow++);
    
    // 3. Opłata Success Fee (B12) - ZMIANA ETYKIETY
    addDashboardRow("Opłata Success Fee za obsługę modelu", 0, feeCost, currentRow++);
    
    // 4. Elementy Modelu PLUS (Jeśli dotyczy)
    if (isPlus) {
        // Podwyżka Systemowa (B13) - ZMIANA ETYKIETY
        addDashboardRow("Podwyżka finansowana w (Stratton 4%)", 0, { formula: "'Kalkulator Podwyżek'!$O$6" }, currentRow++, false, {
            font: { color: { argb: 'FF059669' }, italic: true }, // Green Text
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } } // Green BG
        });

        // Bonus Administracyjny (B14) - ZMIANA ETYKIETY
        addDashboardRow("Bonus dla administracji w (Stratton 2%)", 0, { formula: "'Kalkulator Podwyżek'!$O$7" }, currentRow++, false, {
            font: { color: { argb: 'FF1E40AF' }, italic: true }, // Blue Text
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } } // Blue BG
        });

        // Wstaw do D14 wartość z O14 arkusza Kalkulator Podwyżek
        wsDash.getCell('D14').value = { formula: "'Kalkulator Podwyżek'!O11" };
    }

    // 5. Budżet na dodatkowe podwyżki (B15) - ZMIANA ETYKIETY
    // Suma z kolumny I (która jest teraz edytowalną podwyżką)
    addDashboardRow("Budżet na dodatkowe podwyżki od pracodawcy", 0, { formula: "'Kalkulator Podwyżek'!$O$8" }, currentRow++, false, {
        font: { color: { argb: 'FFD97706' }, italic: true }, // Amber Text
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } } // Amber BG
    });
    // Wstaw do D15 wartość z O7 arkusza Kalkulator Podwyżek
    wsDash.getCell('D15').value = { formula: "'Kalkulator Podwyżek'!O7" };

    // SUMA CAŁKOWITA
    const totalRowIdx = currentRow;
    wsDash.getCell(`B${totalRowIdx}`).value = "CAŁKOWITY KOSZT";
    wsDash.getCell(`B${totalRowIdx}`).font = { bold: true };
    
    wsDash.getCell(`C${totalRowIdx}`).value = { formula: `SUM(C${tableRow+1}:C${totalRowIdx-1})` };
    wsDash.getCell(`D${totalRowIdx}`).value = { formula: `SUM(D${tableRow+1}:D${totalRowIdx-1})` };
    wsDash.getCell(`E${totalRowIdx}`).value = { formula: `C${totalRowIdx}-D${totalRowIdx}` };

    ['C', 'D', 'E'].forEach(c => {
        wsDash.getCell(`${c}${totalRowIdx}`).numFmt = styles.currency;
        wsDash.getCell(`${c}${totalRowIdx}`).font = { bold: true, size: 12 };
        wsDash.getCell(`${c}${totalRowIdx}`).border = { top: { style: 'double' } };
    });
    wsDash.getCell(`E${totalRowIdx}`).font = { color: { argb: 'FF059669' }, bold: true, size: 12 };

    // Linkowanie KPI "Nowy Koszt" do obliczonej sumy
    wsDash.getCell(`C${kpiRow+1}`).value = { formula: `D${totalRowIdx}` };

    wsDash.getColumn('B').width = 45; // Zwiększona szerokość dla dłuższych etykiet
    wsDash.getColumn('C').width = 25;
    wsDash.getColumn('D').width = 25;
    wsDash.getColumn('E').width = 25;


    // ==========================================================================================
    // ARKUSZ 2: KALKULATOR PODWYŻEK (INTERAKTYWNY)
    // ==========================================================================================
    const wsSim = workbook.addWorksheet('Kalkulator Podwyżek');
    const isPlusVariant = prowizjaProc === 26;
    const dataStartRow = 5;
    const dataEndRow = dataStartRow + wyniki.szczegoly.length - 1;

    // Sterowanie
    wsSim.mergeCells('B2:F2');
    wsSim.getCell('B2').value = 'SYMULACJA PODZIAŁU NADWYŻKI I PODWYŻEK';
    wsSim.getCell('B2').font = { bold: true, size: 14, color: { argb: 'FF1E40AF' } };

    // Input użytkownika
    wsSim.getCell('G2').value = 'Dodatkowa podwyżka od pracodawcy dla wszystkich pracowników (% od Obence Netto):';
    wsSim.getCell('G2').font = { bold: true };
    wsSim.getCell('G2').alignment = { horizontal: 'left', wrapText: false };
    wsSim.getColumn('G').width = 60;

    const inputCell = wsSim.getCell('L2');
    inputCell.value = 0; // Domyślnie 0%
    inputCell.numFmt = '0.00%';
    inputCell.fill = styles.inputFill;
    inputCell.font = { bold: true, color: { argb: 'FF000000' } };
    inputCell.border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    inputCell.alignment = { horizontal: 'center' };
    
    wsSim.getCell('M2').value = '⬅ Wpisz % tutaj';
    wsSim.getCell('M2').font = { italic: true, color: { argb: 'FF64748B' } };

    // Tabela Pracowników
    const simHeaderRowIdx = 4;
    const simHeaders = [
        'LP', 'Imię i Nazwisko', 
        'Obecne\nNetto', 
        'Nowa Baza\n(ZUS)', 
        'Świadczenie\n(Benefit)', 
        isPlusVariant ? 'Podwyżka Finansowana\n(Stratton 4%)' : 'Podwyżka Finansowana\n(4%)',
        'Bonus dla działu Księgowo - Kadrowego\n(2% - wypłacane od Stratton)', 
        'Oszczędność Firmy\n(Na czysto)', // KOLUMNA H
        'Podwyżka Dodatkowa\n(Edytowalna)', // KOLUMNA I
        'NOWE ŁĄCZNE\nNETTO PRACOWNIKA', // KOLUMNA J
        'ZMIANA\n(ZYSK PRACOWNIKA)' // KOLUMNA K
    ];

    simHeaders.forEach((h, i) => {
        const colLetter = String.fromCharCode(65 + i);
        const cell = wsSim.getCell(`${colLetter}${simHeaderRowIdx}`);
        // Zmieniamy nagłówek D4 na 'Kwota oZUSowana'
        if (colLetter === 'D' && simHeaderRowIdx === 4) {
            cell.value = 'Kwota oZUSowana';
        } else {
            cell.value = h;
        }
        cell.style = {
            font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } },
            alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
            border: { bottom: { style: 'medium' } }
        };
    });
    wsSim.getRow(simHeaderRowIdx).height = 50;

    // Generowanie wierszy danych
    wyniki.szczegoly.forEach((w, i) => {
        const r = i + 5;
        const isStudent = w.pracownik.trybSkladek === 'STUDENT_UZ';
        
        wsSim.getCell(`A${r}`).value = i + 1;
        wsSim.getCell(`B${r}`).value = `${w.pracownik.imie} ${w.pracownik.nazwisko}${isStudent ? ' (Student)' : ''}`;
        
        // Obecne Netto
        wsSim.getCell(`C${r}`).value = w.standard.netto;
        
        if (isStudent) {
            // STUDENT: Pass-through (brak zmian, brak benefitu)
            wsSim.getCell(`D${r}`).value = w.standard.netto;
            wsSim.getCell(`E${r}`).value = 0;
            wsSim.getCell(`F${r}`).value = 0;
            wsSim.getCell(`G${r}`).value = 0;
            wsSim.getCell(`H${r}`).value = 0;
            wsSim.getCell(`I${r}`).value = 0;
            wsSim.getCell(`J${r}`).value = w.standard.netto;
            wsSim.getCell(`K${r}`).value = 0;
            wsSim.getCell(`L${r}`).value = 0; // Kolumna L dla studenta
            
            // Szare tło dla studentów
            for(let cCode = 65; cCode <= 76; cCode++) { // A-L
                wsSim.getCell(`${String.fromCharCode(cCode)}${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
            }
        } else {
            // STANDARDOWY PRACOWNIK
            wsSim.getCell(`D${r}`).value = w.podzial.zasadnicza.nettoGotowka;
            wsSim.getCell(`E${r}`).value = w.podzial.swiadczenie.netto;

            let systemRaise = 0;
            let adminBonus = 0;
            
            if (isPlusVariant) {
                const swiadczenieBrutto = w.podzial.swiadczenie.brutto;
                systemRaise = swiadczenieBrutto * 0.04;
                adminBonus = swiadczenieBrutto * 0.02;
            }

            wsSim.getCell(`F${r}`).value = systemRaise;
            wsSim.getCell(`F${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } }; 

            wsSim.getCell(`G${r}`).value = adminBonus;
            wsSim.getCell(`G${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } }; 

            // KOLUMNA H: Oszczędność wygenerowana (Na czysto dla przedsiębiorcy przed dodatkową podwyżką)
            const fullProvision = w.podzial.swiadczenie.brutto * (prowizjaProc / 100);
            const savings = w.standard.kosztPracodawcy - (w.podzial.kosztPracodawcy + fullProvision);
            
            // FORMULA DLA KOLUMNY H:
            // Jeśli w kolumnie I (Podwyżka) wpisano coś > 0, to odejmujemy to od oszczędności.
            // =IF(I5>0, calculated_savings - I5, calculated_savings)
            wsSim.getCell(`H${r}`).value = { formula: `IF(I${r}>0, ${savings}-I${r}, ${savings})` };
            wsSim.getCell(`H${r}`).font = { bold: true, color: { argb: 'FF059669' } }; // Green bold
            // Domyślny kolor tła (zielony) - zostanie nadpisany przez formatowanie warunkowe jeśli wartość < 0
            wsSim.getCell(`H${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };

            // Usunięto generowanie kolumny L

            // KOLUMNA I: Podwyżka Dodatkowa liczona od C (obecne netto)
            wsSim.getCell(`I${r}`).value = { formula: `(C${r}*$L$2)` };
            wsSim.getCell(`I${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
            wsSim.getCell(`I${r}`).font = { bold: true };
        }

        // KOLUMNA J: Nowe Łączne Netto (FORMUŁA)
        // = D + E + F + I
        wsSim.getCell(`J${r}`).value = { formula: `D${r}+E${r}+F${r}+I${r}` };
        wsSim.getCell(`J${r}`).font = { bold: true };
        if (!isStudent) wsSim.getCell(`J${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };

        // KOLUMNA K: Zmiana (FORMUŁA)
        // = J - C
        wsSim.getCell(`K${r}`).value = { formula: `J${r}-C${r}` };
        wsSim.getCell(`K${r}`).font = { bold: true, color: { argb: 'FF059669' } };

        // Formatowanie walutowe
        for (let c = 3; c <= 12; c++) { // C do L
            wsSim.getCell(r, c).numFmt = '#,##0.00';
            wsSim.getCell(r, c).border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
        }
    });

    // --- WIERSZ SUMY (Dodany na prośbę) ---
    const sumRow = dataEndRow + 1;
    wsSim.getCell(`B${sumRow}`).value = "SUMA";
    wsSim.getCell(`B${sumRow}`).font = { bold: true };
    wsSim.getCell(`B${sumRow}`).alignment = { horizontal: 'right' };

    for (let c = 3; c <= 12; c++) { // Kolumny C do L
        // Pomijamy kolumnę L w sumowaniu
        if (c <= 11) {
            const colLetter = String.fromCharCode(64 + c);
            wsSim.getCell(`${colLetter}${sumRow}`).value = { formula: `SUM(${colLetter}${dataStartRow}:${colLetter}${dataEndRow})` };
            wsSim.getCell(`${colLetter}${sumRow}`).font = { bold: true };
            wsSim.getCell(`${colLetter}${sumRow}`).numFmt = '#,##0.00';
            wsSim.getCell(`${colLetter}${sumRow}`).border = { top: { style: 'double' } };
            // Zachowanie koloru dla kolumny H (Oszczędność) - zielony tekst
            if (colLetter === 'H') {
                wsSim.getCell(`${colLetter}${sumRow}`).font = { bold: true, color: { argb: 'FF059669' } };
            }
            // Zachowanie koloru dla kolumny K (Zmiana) - zielony tekst
            if (colLetter === 'K') {
                wsSim.getCell(`${colLetter}${sumRow}`).font = { bold: true, color: { argb: 'FF059669' } };
            }
        }
    }

    // --- WARUNKOWE FORMATOWANIE DLA KOLUMNY H (OSZCZĘDNOŚĆ) ---
    // Jeśli wartość < 0 (Strata), kolorujemy na czerwono
    wsSim.addConditionalFormatting({
        ref: `H${dataStartRow}:H${dataEndRow}`,
        rules: [
            {
                priority: 1,
                type: 'cellIs',
                operator: 'lessThan',
                formulae: ['0'],
                style: {
                    font: { color: { argb: 'FFFF0000' }, bold: true }, // Czerwona czcionka
                    fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFFECEC' } } // Jasnoczerwone tło
                }
            }
        ]
    });

    wsSim.getColumn('A').width = 5;
    wsSim.getColumn('B').width = 25;
    wsSim.getColumn('C').width = 13;
    wsSim.getColumn('D').width = 13;
    wsSim.getColumn('E').width = 13;
    wsSim.getColumn('F').width = 15;
    wsSim.getColumn('G').width = 15;
    wsSim.getColumn('H').width = 18; // Savings
    wsSim.getColumn('I').width = 18; // Extra Calc
    wsSim.getColumn('J').width = 18; // Total
    wsSim.getColumn('K').width = 14; // Gain
    wsSim.getColumn('L').width = 18; // Individual Input

    // --- PODSUMOWANIE BUDŻETU (Po prawej stronie - PRZESUNIĘTE NA N/O) ---
    const summaryStartCol = 'N'; 
    const summaryValueCol = 'O';
    const sumStartRow = 5;

    // Tytuł Panelu
    wsSim.mergeCells(`${summaryStartCol}${sumStartRow}:${summaryValueCol}${sumStartRow}`);
    const sumTitle = wsSim.getCell(`${summaryStartCol}${sumStartRow}`);
    sumTitle.value = "PODSUMOWANIE BUDŻETU (MIESIĘCZNIE)";
    sumTitle.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    sumTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
    sumTitle.alignment = { horizontal: 'center', vertical: 'middle' };

    // Wiersz 1: Podwyżki Systemowe (Kolumna F) -> Adres O6
    wsSim.getCell(`${summaryStartCol}${sumStartRow+1}`).value = isPlusVariant ? "Podwyżki finansowana (Stratton 4%)" : "Podwyżki finasowana (4%)";
    wsSim.getCell(`${summaryStartCol}${sumStartRow+1}`).font = { size: 10, color: { argb: 'FF059669' }, bold: true };
    wsSim.getCell(`${summaryValueCol}${sumStartRow+1}`).value = { formula: `SUM(F${dataStartRow}:F${dataEndRow})` };
    wsSim.getCell(`${summaryValueCol}${sumStartRow+1}`).numFmt = styles.currency;

    // Wiersz 2: Bonus Administracyjny (Kolumna G) -> Adres O7
    // N7O7: Dodatkowa Podwyżka (od Pracodawca)
    wsSim.getCell(`${summaryStartCol}${sumStartRow+2}`).value = "Dodatkowa Podwyżka (od Pracodawca)";
    wsSim.getCell(`${summaryStartCol}${sumStartRow+2}`).font = { size: 10, bold: true, color: { argb: 'FFD97706' } };
    wsSim.getCell(`${summaryValueCol}${sumStartRow+2}`).value = { formula: `SUM(I${dataStartRow}:I${dataEndRow})` };
    wsSim.getCell(`${summaryValueCol}${sumStartRow+2}`).numFmt = styles.currency;
    wsSim.getCell(`${summaryValueCol}${sumStartRow+2}`).font = { bold: true };
    wsSim.getCell(`${summaryValueCol}${sumStartRow+2}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };

    // N8O8: ŁĄCZNA PULA NA PODWYŻKI
    wsSim.getCell(`${summaryStartCol}${sumStartRow+3}`).value = "ŁĄCZNA PULA NA PODWYŻKI";
    wsSim.getCell(`${summaryStartCol}${sumStartRow+3}`).font = { bold: true };
    wsSim.getCell(`${summaryStartCol}${sumStartRow+3}`).border = { top: { style: 'double' } };
    wsSim.getCell(`${summaryValueCol}${sumStartRow+3}`).value = { formula: `SUM(${summaryValueCol}${sumStartRow+1}:${summaryValueCol}${sumStartRow+2})` };
    wsSim.getCell(`${summaryValueCol}${sumStartRow+3}`).numFmt = styles.currency;
    wsSim.getCell(`${summaryValueCol}${sumStartRow+3}`).font = { bold: true, size: 12, color: { argb: 'FF059669' } };
    wsSim.getCell(`${summaryValueCol}${sumStartRow+3}`).border = { top: { style: 'double' } };


    // N11:O11 - Suma bonusu 2% z kolumny G (od G5 do ostatniego pracownika)
    wsSim.getCell('N11').value = 'Bonus dla działu kadrowo księgowego 2% ';
    wsSim.getCell('N11').font = { bold: true, color: { argb: 'FF1E40AF' }, size: 10 };
    wsSim.getCell('O11').value = { formula: `SUM(G${dataStartRow}:G${dataEndRow})` };
    wsSim.getCell('O11').numFmt = styles.currency;
    wsSim.getCell('O11').font = { bold: true, color: { argb: 'FF1E40AF' }, size: 11 };
    wsSim.getColumn('N').width = 35;
    wsSim.getColumn('O').width = 20;

    // --- ZAPIS PLIKU ---
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `Analiza Finansowa Podwyżek - ${firma.nazwa || 'Firma'}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
};
