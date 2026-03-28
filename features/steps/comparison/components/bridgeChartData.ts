// --- COST BRIDGE CHART — shared types & data builder ---

export type BridgeSign = '+' | '-' | '=';

export interface BridgeRow {
    key: string;
    label: string;
    subLabel?: string;
    value: number;
    pct: number;
    barClass: string;
    sign: BridgeSign;
    bold?: boolean;
}

export const signStyles: Record<BridgeSign, string> = {
    '-': 'bg-emerald-500 text-white border-emerald-700',
    '+': 'bg-amber-500 text-white border-amber-700',
    '=': 'bg-[#464f60] text-white border-[#201f1e]',
};

export function buildBridgeRows(
    sumaKosztStandard: number,
    sumaKosztPodzial: number,
    prowizja: number,
    oszczednoscNetto: number,
    raiseAmount: number,
    adminAmount: number,
    isPrime: boolean,
): BridgeRow[] {
    const ref = sumaKosztStandard;
    const baseSavings = sumaKosztStandard - sumaKosztPodzial;
    const netFee = Math.max(0, prowizja - (isPrime ? raiseAmount + adminAmount : 0));

    return [
        {
            key: 'today',
            label: 'Twój Koszt Dziś',
            subLabel: 'Punkt wyjścia — model standardowy',
            value: sumaKosztStandard,
            pct: 100,
            barClass: 'bg-[#c8c6c4]',          // jasny na ciemnym tle
            sign: '=',
        },
        {
            key: 'savings',
            label: '↓ Oszczędność Brutto',
            subLabel: 'Redukcja kosztu pracodawcy po optymalizacji',
            value: baseSavings,
            pct: (baseSavings / ref) * 100,
            barClass: 'bg-emerald-400',         // żywa zieleń na jasnym tle
            sign: '-',
        },
        {
            key: 'fee',
            label: '↑ Opłata Serwisowa EBS',
            subLabel: isPrime
                ? `Prowizja (${prowizja > 0 ? ((prowizja / ref) * 100).toFixed(1) : 0}%) po potrąceniu podwyżek i bonusu kadr`
                : `Opłata serwisowa — ${((netFee / ref) * 100).toFixed(1)}% kosztu bazowego`,
            value: netFee,
            pct: (netFee / ref) * 100,
            barClass: 'bg-amber-500',           // złoto — kolor marki Stratton
            sign: '+',
        },
        ...(isPrime && raiseAmount > 0 ? [{
            key: 'raise',
            label: '↑ Podwyżki dla pracowników (+4%)',
            subLabel: 'Finansowane przez Stratton Prime',
            value: raiseAmount,
            pct: (raiseAmount / ref) * 100,
            barClass: 'bg-orange-400',          // ciepły pomarańcz — podwyżki
            sign: '+' as BridgeSign,
        }] : []),
        ...(isPrime && adminAmount > 0 ? [{
            key: 'admin',
            label: '↑ Bonus Operacyjny Kadr (2%)',
            subLabel: 'Dla działu Księgowo-Kadrowego',
            value: adminAmount,
            pct: (adminAmount / ref) * 100,
            barClass: 'bg-violet-500',          // wyróżniający fiolet — bonus kadr
            sign: '+' as BridgeSign,
        }] : []),
        {
            key: 'netto',
            label: '= Zysk Netto Firmy',
            subLabel: 'Miesięczna korzyść finansowa netto',
            value: oszczednoscNetto,
            pct: (oszczednoscNetto / ref) * 100,
            barClass: 'bg-emerald-200',         // jasna zieleń — kontrastuje z emerald-600 tłem
            sign: '=',
            bold: true,
        },
    ];
}
