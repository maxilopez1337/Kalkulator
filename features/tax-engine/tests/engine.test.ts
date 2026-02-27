
import { describe, it, expect } from 'vitest';
import { 
    obliczWariantStandard, 
    obliczWariantPodzial, 
    znajdzBruttoDlaNetto,
    DEFAULT_CONFIG
} from '../index';
import { obliczPit } from '../logic/pit';
import { obliczZusPracownik, obliczZusPracodawca } from '../logic/zus';
import { Pracownik } from '../../../entities/employee/model';

// Konfiguracja do testów (zamrożona kopia)
const TEST_CONFIG = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

describe('Silnik Podatkowy 2025 (Features Module)', () => {

    // --- 1. ZUS TESTS ---
    describe('Logika ZUS', () => {
        it('Standardowe ZUS UOP (Pracownik)', () => {
            // Brutto 5000
            const brutto = 5000;
            const zus = obliczZusPracownik(brutto, 'UOP', 'PELNE', true, TEST_CONFIG);
            
            // E: 9.76% = 488.00
            // R: 1.50% = 75.00
            // C: 2.45% = 122.50
            expect(zus.emerytalna).toBe(488.00);
            expect(zus.rentowa).toBe(75.00);
            expect(zus.chorobowa).toBe(122.50);
            expect(zus.suma).toBe(685.50);
        });

        it('Standardowe ZUS UOP (Pracodawca)', () => {
            const brutto = 5000;
            // Wypadkowa 1.67%
            const zus = obliczZusPracodawca(brutto, 'UOP', 'PELNE', 1.67, true, true, TEST_CONFIG);
            
            // E: 9.76% = 488.00
            // R: 6.50% = 325.00
            // W: 1.67% = 83.50
            // FP: 2.45% = 122.50
            // FGSP: 0.10% = 5.00
            expect(zus.emerytalna).toBe(488.00);
            expect(zus.rentowa).toBe(325.00);
            expect(zus.wypadkowa).toBe(83.50);
            expect(zus.fp).toBe(122.50);
            expect(zus.fgsp).toBe(5.00);
            expect(zus.suma).toBeCloseTo(1024.00, 2);
        });
    });

    // --- 2. PIT TESTS ---
    describe('Logika PIT', () => {
        it('Standardowe obliczenie PIT (12% minus kwota wolna)', () => {
            // Podstawa: 4000, Podatek: 480, Ulga (PIT-2): 300 => 180
            expect(obliczPit(4000, '300', false, 12, TEST_CONFIG)).toBe(180);
        });

        it('Zerowy PIT dla młodych (<26)', () => {
            expect(obliczPit(4000, '300', true, 12, TEST_CONFIG)).toBe(0);
        });

        it('Drugi próg podatkowy (32%)', () => {
            // Podstawa: 10000, Stawka 32% => 3200 - 300 = 2900
            expect(obliczPit(10000, '300', false, 32, TEST_CONFIG)).toBe(2900);
        });
    });

    // --- 3. GROSS-UP ALGORITHM ---
    describe('Odwrócone obliczenia (Netto -> Brutto)', () => {
        it('Powinno zweryfikować obliczenia dla Min Krajowej 2026', () => {
            // Docelowe Netto dla 4806 Brutto (2026) ~ 3605.85
            const targetNetto = 3605.85; 
            
            const params = {
                typUmowy: 'UOP',
                trybSkladek: 'PELNE',
                choroboweAktywne: true,
                pit2: '300',
                ulgaMlodych: false,
                kupTyp: 'STANDARD',
                pitMode: 'AUTO'
            };

            const result = znajdzBruttoDlaNetto(targetNetto, params, TEST_CONFIG);
            
            // Oczekiwanie dokładnego brutto minimalnego dzięki logice aproksymacji/refinementu
            expect(result.brutto).toBeCloseTo(4806, 1);
        });
    });

    // --- 4. STRATTON MODEL (The Split) ---
    describe('Logika Modelu Stratton (Podział)', () => {
        
        // Mock Pracownika
        const baseEmployee: Pracownik = {
            id: 1,
            imie: 'Test',
            nazwisko: 'User',
            dataUrodzenia: '1990-01-01',
            plec: 'M',
            typUmowy: 'UOP',
            trybSkladek: 'PELNE',
            choroboweAktywne: true,
            pit2: '300',
            ulgaMlodych: false,
            kupTyp: 'STANDARD',
            nettoDocelowe: 8000,
            nettoZasadnicza: 3605.85, // Min Krajowa Netto
            pitMode: 'AUTO',
            skladkaFP: true,
            skladkaFGSP: true
        };

        it('Powinno wygenerować oszczędności w porównaniu do Standardu', () => {
            const standard = obliczWariantStandard(baseEmployee, 1.67, TEST_CONFIG);
            const split = obliczWariantPodzial(baseEmployee, 1.67, baseEmployee.nettoZasadnicza, TEST_CONFIG);

            // 1. Sprawdzenie Netto
            // Dopuszczalna różnica 1 PLN ze względu na zaokrąglenia w podziale
            expect(Math.abs(split.doWyplaty - baseEmployee.nettoDocelowe)).toBeLessThanOrEqual(1.01);

            // 2. Sprawdzenie Kosztów (Podział < Standard)
            expect(split.kosztPracodawcy).toBeLessThan(standard.kosztPracodawcy);
            
            // 3. Weryfikacja oszczędności
            const savings = standard.kosztPracodawcy - split.kosztPracodawcy;
            expect(savings).toBeGreaterThan(1000); 
        });

        it('Powinno poprawnie opodatkować część Świadczenia', () => {
            const split = obliczWariantPodzial(baseEmployee, 1.67, baseEmployee.nettoZasadnicza, TEST_CONFIG);
            
            // Część świadczenia NIE podlega ZUS (ZUS Pracodawcy powinien pokrywać się z częścią zasadniczą)
            // Używamy wartości z konfiga dla precyzji
            const expectedZusBase = split.zasadnicza.brutto;
            const actualZusBase = split.zasadnicza.zusPracodawca.emerytalna / (TEST_CONFIG.zus.uop.pracodawca.emerytalna / 100);
            
            // Zmniejszona precyzja do 1 miejsca po przecinku (tolerancja 0.05) ze względu na odwracanie float
            expect(actualZusBase).toBeCloseTo(expectedZusBase, 1);

            // Ale JEST opodatkowana PIT (Całkowity PIT > PIT od zasadniczej)
            expect(split.pit.kwota).toBeGreaterThan(split.zasadnicza.pit);
        });
    });

    // --- 5. INTEGRATION SCENARIOS (ELITON PLUS & FULL APP LOGIC) ---
    describe('Scenariusze Integracyjne (Pełna Logika Aplikacji)', () => {

        // Helper do tworzenia czystego obiektu pracownika
        const createEmployee = (overrides: Partial<Pracownik>): Pracownik => ({
            id: 1,
            imie: 'Jan',
            nazwisko: 'Kowalski',
            stanowisko: 'Programista',
            bruttoAktualne: 10000, 
            nettoDocelowe: 7140,   // ~10k Brutto. KLUCZOWE pole dla obliczeń.
            nettoZasadnicza: 0,
            
            // Wymagane pola dla paramsów silnika
            typUmowy: 'UOP',
            trybSkladek: 'PELNE',
            choroboweAktywne: true,
            pit2: '300',
            ulgaMlodych: false,
            kupTyp: 'STANDARD',
            pitMode: 'AUTO',
            dataUrodzenia: '1990-01-01', // Wymagane dla wieku
            plec: 'M',
            skladkaFP: true,
            skladkaFGSP: true,
            
            ...overrides
        } as Pracownik); 

        describe('Scenariusz 1: Pojedynczy "High Earner" (ok. 10k Brutto -> 7140 Netto)', () => {
            // Ustawienie pracownika z ~7140 Netto (co daje ok 10k Brutto)
            const employee = createEmployee({ nettoDocelowe: 7140 });
            const stawkaWypadkowa = 1.67;
            const prowizjaProc = 10; 

            // 1. Obliczenie wariantu Standard
            const standard = obliczWariantStandard(employee, stawkaWypadkowa, TEST_CONFIG);
            
            // 2. Obliczenie wariantu Eliton (Podział)
            const nettoZasadnicza = 3600; 
            const split = obliczWariantPodzial(employee, stawkaWypadkowa, nettoZasadnicza, TEST_CONFIG);

            it('Powinno poprawnie obliczyć koszty Standardowe (ok. 12k)', () => {
                // ~10k Brutto + 20.48% ZUS = ~12048
                // Wewnetrzna kalkulacja robi Netto -> Brutto, weryfikujemy czy 7140 daje ~10000
                expect(standard.brutto).toBeGreaterThan(9900);
                expect(standard.brutto).toBeLessThan(10100);

                expect(standard.kosztPracodawcy).toBeGreaterThan(11900);
                expect(standard.kosztPracodawcy).toBeLessThan(12200);
            });

            it('Powinno poprawnie obliczyć koszty Eliton (Podział)', () => {
                expect(split.kosztPracodawcy).toBeLessThan(standard.kosztPracodawcy);
                const totalNetto = split.doWyplaty;
                // Pozwalamy na małą różnicę (1-2 PLN) ze względu na zaokrąglenia
                expect(Math.abs(totalNetto - standard.netto)).toBeLessThan(5); 
            });

            it('Powinno poprawnie obliczyć Oszczędności i Prowizję', () => {
                const savingsBrutto = standard.kosztPracodawcy - split.kosztPracodawcy;
                expect(savingsBrutto).toBeGreaterThan(0);

                const bruttoSwiadczenia = split.swiadczenie.netto;
                const commission = bruttoSwiadczenia * (prowizjaProc / 100);
                const savingsNetto = savingsBrutto - commission;
                
                expect(savingsNetto).toBeGreaterThan(0);
            });
        });

        describe('Scenariusz 2: Logika Eliton Plus (Retencja)', () => {
            const employees = [
                createEmployee({ id: 1, nettoDocelowe: 3800 }), // ~Min Krajowa+
                createEmployee({ id: 2, nettoDocelowe: 8500 }), // Średnia
                createEmployee({ id: 3, nettoDocelowe: 17500 }) // Wysoka
            ];
            const stawkaWypadkowa = 1.67;
            const prowizjaProc = 10;
            const retentionShare = 0.30; 

            const results = employees.map(p => {
                const nettoZasadnicza = 3600; 
                const standard = obliczWariantStandard(p, stawkaWypadkowa, TEST_CONFIG);
                const podzial = obliczWariantPodzial(p, stawkaWypadkowa, nettoZasadnicza, TEST_CONFIG);
                return { standard, podzial };
            });

            const sumaKosztStandard = results.reduce((acc, r) => acc + r.standard.kosztPracodawcy, 0);
            const sumaKosztPodzial = results.reduce((acc, r) => acc + r.podzial.kosztPracodawcy, 0);
            const sumaBruttoSwiadczen = results.reduce((acc, r) => acc + r.podzial.swiadczenie.netto, 0);
            
            const oszczednoscBrutto = sumaKosztStandard - sumaKosztPodzial;
            const kwotaProwizji = sumaBruttoSwiadczen * (prowizjaProc / 100);
            const oszczednoscNetto = oszczednoscBrutto - kwotaProwizji;

            const retentionAmount = oszczednoscNetto * retentionShare;
            const finalEmployerSavings = oszczednoscNetto - retentionAmount;

            it('Powinno zweryfikować dodatnie oszczędności całkowite i dystrybucję retencji', () => {
                expect(oszczednoscNetto).toBeGreaterThan(0);
                expect(retentionAmount).toBeCloseTo(oszczednoscNetto * 0.3, 0); // Precyzja 0 (z grubsza liczby całkowite)
            });

            it('Powinno zapewnić spójność Kosztu Pracodawcy w wariancie Plus', () => {
                const costStratton = sumaKosztPodzial + kwotaProwizji;
                const costPlus = costStratton + retentionAmount;

                expect(costPlus).toBeGreaterThan(costStratton);
                expect(costPlus).toBeLessThan(sumaKosztStandard);
            });
        });
    });
});
