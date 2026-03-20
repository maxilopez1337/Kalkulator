export interface SimulationParams {
    empCount: number;
    avgSalary: number;
    salaryMode: 'NETTO' | 'BRUTTO';
    contractType: 'UOP' | 'UZ' | 'MIXED';
    mixRatio: number;
    uzGodziny?: number;
    uzKwotaZasadnicza?: number;
    firmaNazwa?: string;
    advisorName?: string;
    advisorPhone?: string;
    advisorEmail?: string;
    prowizjaStandard?: number;
    prowizjaPlus?: number;
    simulation: {
        totalStd: number;
        totalNew: number;
        totalProv: number;
        savings: number;
        monthlySavings: number;
        yearlySavings: number;
        perEmployeeSavings: number;
        countUOP: number;
        countUZ: number;
        // per-employee averages from tax engine (for tabela mechanizmu)
        avgBruttoStd: number;   // avg brutto pracownika — model obecny
        avgZusStd: number;      // avg ZUS pracodawcy — model obecny
        avgBruttoNowy: number;  // avg brutto pracownika — Eliton Prime (zasadnicza.brutto + swiadczenie.brutto)
        avgZusNowy: number;     // avg ZUS pracodawcy — Eliton Prime (tylko od zasadniczej)
        avgEbs: number;         // avg voucher EBS netto
    };
}
