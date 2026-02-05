
import { obliczWariantStandard, obliczWariantPodzial } from '../features/tax-engine';
import { Pracownik } from '../entities/employee/model';
import { Firma, Config } from '../entities/company/model';

// Definicja typów dla wiadomości
interface WorkerMessage {
    pracownicy: Pracownik[];
    firma: Firma;
    config: Config;
    prowizjaProc: number;
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
    const { pracownicy, firma, config, prowizjaProc } = e.data;

    if (!pracownicy || pracownicy.length === 0) {
        self.postMessage(null);
        return;
    }

    try {
        // 1. Obliczenia szczegółowe dla każdego pracownika
        const szczegoly = pracownicy.map(p => {
            const standard = obliczWariantStandard(p, firma.stawkaWypadkowa, config);
            // Dla wariantu podziału używamy p.nettoZasadnicza jako bazy
            const podzial = obliczWariantPodzial(p, firma.stawkaWypadkowa, p.nettoZasadnicza, config);
            
            return { 
                pracownik: p, 
                standard, 
                podzial, 
                oszczednosc: standard.kosztPracodawcy - podzial.kosztPracodawcy 
            };
        });

        // 2. Agregacja wyników (Podsumowanie)
        const sumaKosztStandard = szczegoly.reduce((acc, w) => acc + w.standard.kosztPracodawcy, 0);
        const sumaKosztPodzial = szczegoly.reduce((acc, w) => acc + w.podzial.kosztPracodawcy, 0);
        const sumaBruttoSwiadczen = szczegoly.reduce((acc, w) => acc + w.podzial.swiadczenie.brutto, 0);
        
        const oszczednoscBrutto = sumaKosztStandard - sumaKosztPodzial;
        const prowizja = sumaBruttoSwiadczen * (prowizjaProc / 100);
        const oszczednoscNetto = oszczednoscBrutto - prowizja;

        const podsumowanie = {
            sumaKosztStandard,
            sumaKosztPodzial,
            sumaBruttoSwiadczen,
            oszczednoscBrutto,
            prowizja,
            oszczednoscNetto,
            oszczednoscRoczna: oszczednoscNetto * 12,
            sredniaOszczednoscNaEtat: pracownicy.length > 0 ? oszczednoscNetto / pracownicy.length : 0
        };

        // 3. Odesłanie wyników do wątku głównego
        self.postMessage({ szczegoly, podsumowanie });

    } catch (error) {
        console.error("Worker Calculation Error:", error);
        self.postMessage(null);
    }
};
