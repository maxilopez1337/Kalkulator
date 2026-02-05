
import { groupStyles } from './excelStyles';

export const STANDARD_TABLE_CONFIG = {
    headerGroups: [
        { title: 'Dane podstawowe', span: 6, style: { ...groupStyles.base, ...groupStyles.gray } },
        { title: 'ZUS Pracownika', span: 5, style: { ...groupStyles.base, ...groupStyles.indigo } },
        { title: 'Zdrowotna', span: 2, style: { ...groupStyles.base, ...groupStyles.emerald } },
        { title: 'Suma', span: 1, style: { ...groupStyles.base, ...groupStyles.gray } },
        { title: 'PIT', span: 4, style: { ...groupStyles.base, ...groupStyles.amber } },
        { title: 'ZUS Pracodawcy', span: 6, style: { ...groupStyles.base, ...groupStyles.purple } },
        { title: 'Sumy', span: 1, style: { ...groupStyles.base, ...groupStyles.gray } }
    ],
    columns: [
        { header: 'LP', key: 'lp', width: 5 },
        // Dane podstawowe
        { header: 'Pracownik', key: 'name', width: 25 },
        { header: 'Umowa', key: 'type', width: 10 },
        { header: 'Netto', key: 'netto', width: 13, style: { numFmt: '#,##0.00' } },
        { header: 'Brutto', key: 'brutto', width: 13, style: { numFmt: '#,##0.00' } },
        { header: 'Koszt', key: 'koszt', width: 15, style: { numFmt: '#,##0.00', font: { bold: true } } },
        // ZUS Pracownika
        { header: 'Podstawa', key: 'podstZus', width: 13, style: { numFmt: '#,##0.00' } },
        { header: 'Emerytalna', key: 'emerytalnaPrac', width: 12, style: { numFmt: '#,##0.00' } },
        { header: 'Rentowa', key: 'rentowaPrac', width: 12, style: { numFmt: '#,##0.00' } },
        { header: 'Chorobowa', key: 'chorobowaPrac', width: 12, style: { numFmt: '#,##0.00' } },
        { header: 'Suma', key: 'zusPrac', width: 12, style: { numFmt: '#,##0.00' } },
        // Zdrowotna
        { header: 'Podstawa', key: 'podstZdrow', width: 13, style: { numFmt: '#,##0.00' } },
        { header: 'Składka', key: 'zdrowotna', width: 12, style: { numFmt: '#,##0.00' } },
        { header: 'Suma ZUS', key: 'sumaZusPrac', width: 13, style: { numFmt: '#,##0.00', font: { bold: true } } },
        // PIT
        { header: 'KUP', key: 'kup', width: 10, style: { numFmt: '#,##0.00' } },
        { header: 'Podstawa', key: 'podstPit', width: 13, style: { numFmt: '#,##0.00' } },
        { header: 'Stawka', key: 'stawkaPit', width: 8, style: { alignment: { horizontal: 'center' } } },
        { header: 'Zaliczka', key: 'pit', width: 12, style: { numFmt: '#,##0.00' } },
        // ZUS Pracodawcy
        { header: 'Emerytalna', key: 'emerytalnaFirma', width: 13, style: { numFmt: '#,##0.00' } },
        { header: 'Rentowa', key: 'rentowaFirma', width: 13, style: { numFmt: '#,##0.00' } },
        { header: 'Wypadkowa', key: 'wypadkowaFirma', width: 12, style: { numFmt: '#,##0.00' } },
        { header: 'FP+FS', key: 'fp', width: 10, style: { numFmt: '#,##0.00' } },
        { header: 'FGŚP', key: 'fgsp', width: 10, style: { numFmt: '#,##0.00' } },
        { header: 'ZUS Firmy', key: 'zusFirma', width: 13, style: { numFmt: '#,##0.00' } },
        // Sumy
        { header: 'SUMA SKŁADEK', key: 'sumaSkladek', width: 16, style: { numFmt: '#,##0.00', font: { bold: true } } }
    ]
};

export const SPLIT_TABLE_CONFIG = {
    headerGroups: [
        { title: 'Dane Wejściowe', span: 7, style: { ...groupStyles.base, ...groupStyles.gray } },
        { title: 'Świadczenie', span: 4, style: { ...groupStyles.base, ...groupStyles.amber } },
        { title: 'DO WYPŁATY', span: 3, style: { ...groupStyles.base, ...groupStyles.emerald } },
        { title: 'KOSZT', span: 1, style: { ...groupStyles.base, ...groupStyles.gray } },
        { title: 'ZUS Pracownika', span: 5, style: { ...groupStyles.base, ...groupStyles.indigo } },
        { title: 'Zdrowotna', span: 2, style: { ...groupStyles.base, ...groupStyles.teal } },
        { title: 'PIT', span: 5, style: { ...groupStyles.base, ...groupStyles.rose } },
        { title: 'ZUS Pracodawcy', span: 6, style: { ...groupStyles.base, ...groupStyles.purple } },
        { title: 'Sumy', span: 1, style: { ...groupStyles.base, ...groupStyles.gray } }
    ],
    columns: [
        { header: 'LP', key: 'lp', width: 5 },
        { header: 'Pracownik', key: 'name', width: 25 },
        { header: 'Typ umowy', key: 'type', width: 10 },
        { header: 'Brutto Łączne', key: 'bruttoLaczne', width: 13, style: { numFmt: '#,##0.00' } },
        { header: 'Netto Zasad.', key: 'nettoZasadnicze', width: 13, style: { numFmt: '#,##0.00' } },
        { header: 'Brutto Zasad.', key: 'bruttoZasadnicze', width: 13, style: { numFmt: '#,##0.00' } },
        { header: 'Świadcz. Netto', key: 'swiadczenieNettoInput', width: 13, style: { numFmt: '#,##0.00', font: { color: { argb: 'FF059669' }, bold: true } } },
        { header: 'Dodatek', key: 'dodatek', width: 12, style: { numFmt: '#,##0.00' } },
        { header: 'Potrącenie', key: 'potracenie', width: 10, style: { numFmt: '#,##0.00' } },
        { header: 'Świadcz. Brutto', key: 'swiadczenieBrutto', width: 13, style: { numFmt: '#,##0.00' } },
        { header: 'Zaliczka (Św.)', key: 'swiadczenieZaliczka', width: 12, style: { numFmt: '#,##0.00' } },
        { header: 'Gotówka', key: 'doWyplatyGotowka', width: 13, style: { numFmt: '#,##0.00', fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } } } },
        { header: 'Świadczenie', key: 'doWyplatySwiadczenie', width: 13, style: { numFmt: '#,##0.00', fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } } } },
        { header: 'RAZEM', key: 'doWyplatyRazem', width: 15, style: { numFmt: '#,##0.00', font: { bold: true }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } } } },
        { header: 'KOSZT CAŁK.', key: 'koszt', width: 15, style: { numFmt: '#,##0.00', font: { bold: true }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } } } },
        { header: 'Podst. ZUS', key: 'podstZus', width: 13, style: { numFmt: '#,##0.00' } },
        { header: 'Emerytalna', key: 'zusE', width: 12, style: { numFmt: '#,##0.00' } },
        { header: 'Rentowa', key: 'zusR', width: 12, style: { numFmt: '#,##0.00' } },
        { header: 'Chorobowa', key: 'zusC', width: 12, style: { numFmt: '#,##0.00' } },
        { header: 'Suma ZUS', key: 'zusSuma', width: 12, style: { numFmt: '#,##0.00' } },
        { header: 'Podst. Zdr.', key: 'podstZdr', width: 13, style: { numFmt: '#,##0.00' } },
        { header: 'Skł. Zdr.', key: 'sklZdr', width: 12, style: { numFmt: '#,##0.00' } },
        { header: 'KUP', key: 'kup', width: 10, style: { numFmt: '#,##0.00' } },
        { header: 'Podst. PIT', key: 'podstPit', width: 13, style: { numFmt: '#,##0.00' } },
        { header: 'Stawka', key: 'stawkaPit', width: 8, style: { alignment: { horizontal: 'center' } } },
        { header: 'Zal. Baz.', key: 'pitZasadnicza', width: 12, style: { numFmt: '#,##0.00' } }, 
        { header: 'PIT Całk.', key: 'pitCalk', width: 12, style: { numFmt: '#,##0.00', font: { bold: true } } },
        { header: 'Emeryt. (F)', key: 'firmaE', width: 12, style: { numFmt: '#,##0.00' } },
        { header: 'Rentowa (F)', key: 'firmaR', width: 12, style: { numFmt: '#,##0.00' } },
        { header: 'Wypadk. (F)', key: 'firmaW', width: 12, style: { numFmt: '#,##0.00' } },
        { header: 'FP', key: 'firmaFP', width: 10, style: { numFmt: '#,##0.00' } },
        { header: 'FGŚP', key: 'firmaFGSP', width: 10, style: { numFmt: '#,##0.00' } },
        { header: 'ZUS Firmy', key: 'zusFirma', width: 13, style: { numFmt: '#,##0.00', fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } } } },
        { header: 'SUMA SKŁADEK', key: 'sumaSkladek', width: 16, style: { numFmt: '#,##0.00', font: { bold: true }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } } } }
    ]
};
