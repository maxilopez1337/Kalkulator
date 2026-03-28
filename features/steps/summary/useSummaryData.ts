import { useMemo } from 'react';
import { WynikPracownika } from '../../../entities/calculation/model';

const round = (val: number) => Math.round(val * 100) / 100;

const calculateStats = (dataList: WynikPracownika[], prowizjaProc: number) => {
    // 1. FILTROWANIE: Wyklucz studentów ze wszystkich kalkulacji (zgodnie z życzeniem "nie uwzględniaj w ogóle w ofercie")
    const qualifiedList = dataList.filter(w => w.pracownik.trybSkladek !== 'STUDENT_UZ');
    const excludedCount = dataList.length - qualifiedList.length;

    const standard = {
        brutto: qualifiedList.reduce((acc, w) => acc + round(w.standard.brutto), 0),
        zusPracodawca: qualifiedList.reduce((acc, w) => acc + round(w.standard.zusPracodawca.suma), 0),
        zusSpoleczne: qualifiedList.reduce((acc, w) => acc + round(w.standard.zusPracownik.suma), 0),
        zdrowotna: qualifiedList.reduce((acc, w) => acc + round(w.standard.zdrowotna), 0),
        pit: qualifiedList.reduce((acc, w) => acc + round(w.standard.pit), 0),
        kosztPracodawcy: qualifiedList.reduce((acc, w) => acc + round(w.standard.kosztPracodawcy), 0),
        netto: qualifiedList.reduce((acc, w) => acc + round(w.standard.netto), 0)
    };

    const stratton = {
        brutto: qualifiedList.reduce((acc, w) => {
            // Tutaj już nie musimy sprawdzać STUDENT_UZ, bo lista jest przefiltrowana
            return acc + round(w.podzial.pit.lacznyPrzychod);
        }, 0),
        zusPracodawca: qualifiedList.reduce((acc, w) => {
            return acc + round(w.podzial.zasadnicza.zusPracodawca.suma);
        }, 0),
        zusSpoleczne: qualifiedList.reduce((acc, w) => {
            return acc + round(w.podzial.zasadnicza.zusPracownik.suma);
        }, 0),
        zdrowotna: qualifiedList.reduce((acc, w) => {
            return acc + round(w.podzial.zasadnicza.zdrowotna);
        }, 0),
        pit: qualifiedList.reduce((acc, w) => {
            return acc + round(w.podzial.pit.kwota);
        }, 0),
        kosztPracodawcy: qualifiedList.reduce((acc, w) => {
            return acc + round(w.podzial.kosztPracodawcy);
        }, 0),
        netto: qualifiedList.reduce((acc, w) => {
            return acc + round(w.podzial.doWyplaty);
        }, 0),

        prowizja: round(qualifiedList.reduce((acc, w) => {
            return acc + round(w.podzial.swiadczenie.netto);
        }, 0) * (prowizjaProc / 100))
    };

    return { standard, stratton, count: qualifiedList.length, excludedCount };
};

interface UseSummaryDataParams {
    szczegoly: WynikPracownika[] | undefined;
    prowizjaProc: number;
    activeModel: string;
    selectedPracownikId: number | 'ALL';
}

export const useSummaryData = ({ szczegoly, prowizjaProc, activeModel, selectedPracownikId }: UseSummaryDataParams) => {
    const list = szczegoly ?? [];
    const globalStats = calculateStats(list, prowizjaProc);

    const displayedStats = useMemo(() => {
        if (selectedPracownikId === 'ALL') return globalStats;
        const emp = list.find((w: WynikPracownika) => w.pracownik.id === selectedPracownikId);
        // Jeśli wybrany pracownik jest studentem, zwróci zera dla wszystkich pól finansowych (bo jest filtrowany w calculateStats)
        // Ale count = 0, excludedCount = 1
        return emp ? calculateStats([emp], prowizjaProc) : globalStats;
    }, [selectedPracownikId, list, globalStats]);

    // KPI Calculation
    const kpiStandardKoszt = displayedStats.standard.kosztPracodawcy;
    const kpiNowyKoszt = displayedStats.stratton.kosztPracodawcy + displayedStats.stratton.prowizja;
    const kpiOszczednoscMies = kpiStandardKoszt - kpiNowyKoszt;
    const kpiOszczednoscRok = kpiOszczednoscMies * 12;
    const costReductionPercent = kpiStandardKoszt > 0 ? (kpiOszczednoscMies / kpiStandardKoszt) * 100 : 0;

    // --- CHART DATA PREP (BUSINESS LOGIC) ---
    const capitalHuman = displayedStats.stratton.netto;
    const taxesState =
        displayedStats.stratton.zusPracodawca +
        displayedStats.stratton.zusSpoleczne +
        displayedStats.stratton.zdrowotna +
        displayedStats.stratton.pit;
    // Wylicz bonus admina 2% (zgodnie z SummaryComparisonTable)
    const totalProvision = displayedStats.stratton.prowizja;
    // Podstawa prowizji to suma świadczeń netto (nie brutto!)
    let raiseAmount = 0;
    let adminAmount = 0;
    let feeAmount = 0;
    if (activeModel === 'PRIME' && prowizjaProc === 26) {
        // Model PLUS: 20% Success Fee, 4% podwyżka, 2% admin (wszystko z prowizji)
        feeAmount = totalProvision * (20 / 26);
        raiseAmount = totalProvision * (4 / 26);
        adminAmount = totalProvision * (2 / 26);
    } else {
        // Model STANDARD: brak bonusu administracyjnego, całość to Success Fee
        feeAmount = totalProvision;
    }
    const serviceFee = feeAmount;

    // NOTE: Nie sumujemy tutaj, bo totalReference to Koszt Standardowy, a nie suma elementów.
    // Oszczędność jest luką między Sumą Elementów a Kosztem Standardowym.

    const chartData = [
        {
            label: 'Wynagrodzenie NETTO',
            subtext: 'Wynagrodzenia Netto + Benefity',
            value: capitalHuman,
            color: '#3b82f6' // Blue 500
        },
        {
            label: 'Obciążenia Fiskalne',
            subtext: 'ZUS, NFZ, PIT (Skarbówka)',
            value: taxesState,
            color: '#ef4444' // Red 500
        },
        // Podwyżka 4% tylko dla PRIME
        (activeModel === 'PRIME' && raiseAmount > 0) ? {
            label: 'Podwyżka dla Pracowników',
            subtext: '+4% świadczeń rzeczowych EBS finansowane przez Stratton Prime',
            value: raiseAmount,
            color: '#059669' // Emerald 600
        } : null,
        // Bonus admina 2% zawsze pokazuj
        adminAmount > 0 ? {
            label: 'Bonus dla Działu Księgowo-Kadrowego',
            subtext: '2% wypłacane przez STRATTON',
            value: adminAmount,
            color: '#f59e0b' // Amber 400
        } : null,
        {
            label: 'Opłata serwisowa EBS',
            subtext: `${prowizjaProc}% wartości nominalnej świadczeń`,
            value: serviceFee,
            color: '#6366f1' // Indigo 500
        }
    ].filter(Boolean) as { label: string; value: number; color: string; subtext?: string }[];

    return {
        globalStats,
        displayedStats,
        kpiStandardKoszt,
        kpiNowyKoszt,
        kpiOszczednoscMies,
        kpiOszczednoscRok,
        costReductionPercent,
        chartData,
    };
};
