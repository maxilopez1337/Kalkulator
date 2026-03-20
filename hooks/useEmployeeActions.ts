
import { useCallback } from 'react';
import { useEmployees } from '../store/EmployeeContext';
import { useCompany } from '../store/CompanyContext';
import { Pracownik } from '../entities/employee/model';
import { obliczWiek, czyZwolnionyZFpFgsp } from '../shared/utils/dates';

export const useEmployeeActions = () => {
    const { setPracownicy } = useEmployees();
    const { config } = useCompany();

    const addEmployee = useCallback(() => {
        const defaultDataUr = '1990-01-01';
        const isExempt = czyZwolnionyZFpFgsp(defaultDataUr, 'M', config);

        const newEmployee: Pracownik = {
            id: Date.now(),
            imie: '',
            nazwisko: '',
            dataUrodzenia: defaultDataUr,
            plec: 'M',
            typUmowy: 'UOP',
            trybSkladek: 'PELNE',
            choroboweAktywne: true,
            pit2: String(config.pit.kwotaZmniejszajacaMies),
            ulgaMlodych: false,
            kupTyp: 'STANDARD',
            nettoDocelowe: 5000,
            nettoZasadnicza: config.placaMinimalna.netto,
            pitMode: 'AUTO',
            skladkaFP: !isExempt,
            skladkaFGSP: !isExempt
        };

        setPracownicy(prev => [...prev, newEmployee]);
    }, [config, setPracownicy]);

    const removeEmployee = useCallback((id: number) => {
        setPracownicy(prev => prev.filter(p => p.id !== id));
    }, [setPracownicy]);

    // Funkcja: Usuń wszystkich OPRÓCZ pierwszego
    const removeAllEmployees = useCallback(() => {
        setPracownicy(prev => prev.slice(0, 1));
    }, [setPracownicy]);

    // Funkcja: Usuń ABSOLUTNIE wszystkich (czyści listę do zera)
    const clearAllEmployees = useCallback(() => {
        setPracownicy([]);
    }, [setPracownicy]);

    const duplicateEmployee = useCallback((id: number) => {
        setPracownicy(prev => {
            const p = prev.find(item => item.id === id);
            if (!p) return prev;
            return [...prev, { ...p, id: Date.now(), imie: `${p.imie} (kopia)` }];
        });
    }, [setPracownicy]);

    const updateEmployee = useCallback((id: number, field: keyof Pracownik, value: any) => {
        setPracownicy(prev => prev.map(p => {
            if (p.id !== id) return p;
            
            const updated = { ...p, [field]: value };

            // 1. Logika: Zmiana Data Urodzenia lub Płeć -> Przelicz zwolnienia
            if (field === 'dataUrodzenia' || field === 'plec') {
                const dataUr = field === 'dataUrodzenia' ? value : p.dataUrodzenia;
                const plec = field === 'plec' ? value : p.plec;
                
                // Ulga dla młodych (< 26 lat)
                if (field === 'dataUrodzenia') {
                    const wiek = obliczWiek(dataUr);
                    const isMlody = wiek < config.pit.ulgaMlodziMaxWiek;
                    
                    updated.ulgaMlodych = isMlody;
                    if (isMlody) {
                        updated.pit2 = '300';
                        updated.pitMode = 'FLAT_0';
                    } else {
                        if (updated.pitMode === 'FLAT_0') updated.pitMode = 'AUTO';
                        if (updated.pit2 === '0') updated.pit2 = '300';
                    }
                }

                // Zwolnienie z FP i FGŚP (wiek + płeć) - tylko jeśli tryb składek to przewiduje
                if (updated.trybSkladek === 'PELNE' || updated.trybSkladek === 'BEZ_CHOROBOWEJ') {
                    const isExempt = czyZwolnionyZFpFgsp(dataUr, plec, config);
                    updated.skladkaFP = !isExempt;
                    updated.skladkaFGSP = !isExempt;
                }
            }

            // 2. Logika: Zmiana Typu Umowy
            if (field === 'typUmowy') {
                if (value === 'UZ') {
                    updated.kupTyp = 'PROC_20';
                    updated.trybSkladek = 'BEZ_CHOROBOWEJ';
                    updated.nettoZasadnicza = config.minimalnaKwotaUZ.zasadniczaNetto;
                } else {
                    updated.kupTyp = 'STANDARD';
                    updated.trybSkladek = 'PELNE';
                    updated.nettoZasadnicza = config.placaMinimalna.netto;
                }
                // Reset flag przy zmianie umowy
                const isExempt = czyZwolnionyZFpFgsp(updated.dataUrodzenia, updated.plec, config);
                updated.skladkaFP = !isExempt;
                updated.skladkaFGSP = !isExempt;
                updated.choroboweAktywne = value !== 'UZ';
                // Przelicz ulgę dla młodych na podstawie aktualnej daty urodzenia
                if (updated.dataUrodzenia) {
                    const wiek = obliczWiek(updated.dataUrodzenia);
                    const isMlody = wiek < config.pit.ulgaMlodziMaxWiek;
                    updated.ulgaMlodych = isMlody;
                    updated.pitMode = isMlody ? 'FLAT_0' : (updated.pitMode === 'FLAT_0' ? 'AUTO' : updated.pitMode);
                }
            }

            // 2b. Logika: Ręczna zmiana checkboxa ulgaMlodych → sync pitMode
            if (field === 'ulgaMlodych') {
                if (value === true) {
                    updated.pitMode = 'FLAT_0';
                } else {
                    if (updated.pitMode === 'FLAT_0') updated.pitMode = 'AUTO';
                }
            }

            // 3. Logika: Zmiana Trybu Składek (MASTER SWITCH)
            if (field === 'trybSkladek') {
                const isExemptAge = czyZwolnionyZFpFgsp(updated.dataUrodzenia, updated.plec, config);

                switch (value) {
                    case 'PELNE': // Pełne oskładkowanie
                        updated.choroboweAktywne = true;
                        updated.skladkaFP = !isExemptAge;
                        updated.skladkaFGSP = !isExemptAge;
                        break;
                    
                    case 'BEZ_CHOROBOWEJ': // Pełne ale bez chorobowej (tylko UZ)
                        updated.choroboweAktywne = false;
                        updated.skladkaFP = !isExemptAge;
                        updated.skladkaFGSP = !isExemptAge;
                        break;

                    case 'STUDENT_UZ': // Student < 26 lat
                        updated.choroboweAktywne = false;
                        updated.skladkaFP = false;
                        updated.skladkaFGSP = false;
                        // Zazwyczaj też 0 PIT
                        updated.pitMode = 'FLAT_0'; 
                        break;

                    case 'INNY_TYTUL': // Zbieg tytułów (tylko zdrowotna)
                        updated.choroboweAktywne = false;
                        updated.skladkaFP = false;
                        updated.skladkaFGSP = false;
                        break;

                    case 'EMERYT_RENCISTA': // Emeryt
                        // Zazwyczaj płaci społeczne, ale bez FP/FGŚP
                        updated.choroboweAktywne = true; 
                        updated.skladkaFP = false;
                        updated.skladkaFGSP = false;
                        break;

                    default:
                        break;
                }
            }

            return updated;
        }));
    }, [config, setPracownicy]);

    return {
        addEmployee,
        removeEmployee,
        removeAllEmployees, // Usuwa oprócz 1
        clearAllEmployees,  // Usuwa wszystkich
        duplicateEmployee,
        updateEmployee
    };
};
