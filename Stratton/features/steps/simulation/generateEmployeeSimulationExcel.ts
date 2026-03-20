declare global {
    interface Window {
        ExcelJS: any;
    }
}

export const generateEmployeeSimulationExcel = async (
    pracownikName: string,
    stanowisko: string,
    wynik: any,
    symulacja: any
) => {
    if (!window.ExcelJS) {
        alert('Biblioteka ExcelJS nie została załadowana.');
        return;
    }

    const Workbook = window.ExcelJS.Workbook;
    const workbook = new Workbook();
    workbook.creator = 'Kalkulator Stratton';
    workbook.created = new Date();

    const currencyFmt = '#,##0.00 "zł"';

    // Arkusz 1: Dane pracownika
    const wsDane = workbook.addWorksheet('1. Dane pracownika');
    wsDane.columns = [
        { header: 'Parametr', key: 'param', width: 30 },
        { header: 'Wartość', key: 'wartosc', width: 30 }
    ];
    wsDane.addRow({ param: 'Imię i nazwisko', wartosc: pracownikName });
    wsDane.addRow({ param: 'Stanowisko / Typ umowy', wartosc: stanowisko });
    wsDane.addRow({ param: 'Wynagrodzenie bazowe netto', wartosc: wynik.standard.netto });

    // Arkusz 2: Model obecny
    const wsObecny = workbook.addWorksheet('2. Model obecny');
    wsObecny.columns = [
        { header: 'Parametr', key: 'param', width: 30 },
        { header: 'Wartość', key: 'wartosc', width: 25, style: { numFmt: currencyFmt } }
    ];
    wsObecny.addRow({ param: 'Brutto', wartosc: wynik.standard.brutto });
    wsObecny.addRow({ param: 'Netto', wartosc: wynik.standard.netto });
    wsObecny.addRow({ param: 'PIT (Zaliczka)', wartosc: wynik.standard.pit });
    wsObecny.addRow({ param: 'ZUS Pracownika', wartosc: wynik.standard.zusPracownik?.suma || 0 });
    wsObecny.addRow({ param: 'Koszt pracodawcy', wartosc: wynik.standard.kosztPracodawcy });

    // Arkusz 3: Model Eliton Prime
    const wsEliton = workbook.addWorksheet('3. Model Eliton Prime');
    wsEliton.columns = [
        { header: 'Parametr', key: 'param', width: 30 },
        { header: 'Wartość', key: 'wartosc', width: 25, style: { numFmt: currencyFmt } }
    ];
    let swiadczenieWynik = wynik.podzial.swiadczenie?.netto || 0;
    wsEliton.addRow({ param: 'Brutto etat', wartosc: wynik.podzial.zasadnicza?.brutto || 0 });
    wsEliton.addRow({ param: 'Świadczenie netto', wartosc: swiadczenieWynik });
    wsEliton.addRow({ param: 'Świadczenie brutto', wartosc: wynik.podzial.swiadczenie?.brutto || 0 });
    wsEliton.addRow({ param: 'Łączny koszt brutto (z ZUS pracodawcy)', wartosc: wynik.podzial.zasadnicza?.kosztPracodawcy || 0 });
    wsEliton.addRow({ param: 'Wynagrodzenie netto łącznie', wartosc: wynik.podzial.zasadnicza.netto + swiadczenieWynik });

    // Arkusz 4: Symulacja roczna
    const wsSymulacja = workbook.addWorksheet('4. Symulacja roczna');
    wsSymulacja.columns = [
        { header: 'Miesiąc', key: 'miesiac', width: 15 },
        { header: 'Brutto łączne', key: 'brutto', width: 20, style: { numFmt: currencyFmt } },
        { header: 'Zaliczka PIT', key: 'pit', width: 20, style: { numFmt: currencyFmt } },
        { header: 'Netto do wypłaty', key: 'netto', width: 20, style: { numFmt: currencyFmt } },
        { header: 'Próg podatkowy', key: 'prog', width: 20 }
    ];
    
    let roczneBrutto = 0;
    let rocznyPit = 0;
    let roczneNetto = 0;

    for(let m = 1; m <= 12; m++) {
        const mcBrutto = symulacja.noweBruttolaczne;
        roczneBrutto += mcBrutto;
        const prog = roczneBrutto <= 120000 ? 'I próg (12%)' : 'II próg (32%)';
        
        wsSymulacja.addRow({
            miesiac: m,
            brutto: mcBrutto,
            pit: symulacja.zaliczkaPit,
            netto: symulacja.wynagrodzenieDoWyplaty,
            prog: prog
        });
        rocznyPit += symulacja.zaliczkaPit;
        roczneNetto += symulacja.wynagrodzenieDoWyplaty;
    }

    // Arkusz 5: Podsumowanie
    const wsPodsumowanie = workbook.addWorksheet('5. Podsumowanie');
    wsPodsumowanie.columns = [
        { header: 'Parametr', key: 'param', width: 30 },
        { header: 'Model obecny rocznie', key: 'obecny', width: 25, style: { numFmt: currencyFmt } },
        { header: 'Model symulowany rocznie', key: 'eliton', width: 25, style: { numFmt: currencyFmt } },
        { header: 'Różnica', key: 'roznica', width: 25, style: { numFmt: currencyFmt } }
    ];
    
    wsPodsumowanie.addRow({
        param: 'Roczne netto',
        obecny: wynik.standard.netto * 12,
        eliton: roczneNetto,
        roznica: roczneNetto - (wynik.standard.netto * 12)
    });
    wsPodsumowanie.addRow({
        param: 'Roczny PIT',
        obecny: wynik.standard.pit * 12,
        eliton: rocznyPit,
        roznica: rocznyPit - (wynik.standard.pit * 12)
    });
    wsPodsumowanie.addRow({
        param: 'Roczny koszt pracodawcy',
        obecny: wynik.standard.kosztPracodawcy * 12,
        eliton: symulacja.nowyKosztPracodawcy * 12,
        roznica: (symulacja.nowyKosztPracodawcy * 12) - (wynik.standard.kosztPracodawcy * 12)
    });

    [wsDane, wsObecny, wsEliton, wsSymulacja, wsPodsumowanie].forEach(ws => {
        const headerRow = ws.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF001433' } };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raport_pracownika_${pracownikName.replace(/ /g, '_')}_eliton_prime.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
};
