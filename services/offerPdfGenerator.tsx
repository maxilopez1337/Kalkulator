import React from 'react';
// import { pdf } from '@react-pdf/renderer'; // DISABLING CLIENT-SIDE PDF
// import { OfferPdfDocument, getDefaultPdfContent } from './OfferPdfDocument'; 
import ReactDOMServer from 'react-dom/server';
import { OfferHtmlDocument } from './OfferHtmlDocument';
import { ZapisanaKalkulacja } from '../entities/history/model';
import { obliczWariantStandard, obliczWariantPodzial } from '../features/tax-engine';

type OfferStats = {
    standard: { kosztPracodawcy: number; zusPracodawca: number; brutto: number; netto: number; zusPracownik: number; pit: number };
    stratton: { kosztPracodawcy: number; zusPracodawca: number; brutto: number; netto: number; zusPracownik: number; pit: number; prowizja: number };
    plus: { kosztPracodawcy: number; zusPracodawca: number; brutto: number; netto: number; zusPracownik: number; pit: number; prowizja: number };
    oszczednoscRoczna: number;
    oszczednoscMiesieczna: number;
};

const DEFAULT_STATS: OfferStats = {
    standard: { kosztPracodawcy: 0, zusPracodawca: 0, brutto: 0, netto: 0, zusPracownik: 0, pit: 0 },
    stratton: { kosztPracodawcy: 0, zusPracodawca: 0, brutto: 0, netto: 0, zusPracownik: 0, pit: 0, prowizja: 0 },
    plus: { kosztPracodawcy: 0, zusPracodawca: 0, brutto: 0, netto: 0, zusPracownik: 0, pit: 0, prowizja: 0 },
    oszczednoscRoczna: 0,
    oszczednoscMiesieczna: 0
};

export const validateKalkulacjaInput = (kalkulacja: ZapisanaKalkulacja): { errors: string[] } => {
    const errors: string[] = [];

    if (!kalkulacja?.dane) {
        errors.push('Brak danych kalkulacji.');
        return { errors };
    }

    const { firma, pracownicy, config, prowizjaProc } = kalkulacja.dane;

    if (!firma || typeof firma.stawkaWypadkowa !== 'number' || Number.isNaN(firma.stawkaWypadkowa)) {
        errors.push('Brak lub nieprawidłowa stawka wypadkowa firmy.');
    }

    if (!config) {
        errors.push('Brak konfiguracji podatkowej (config).');
    }

    if (typeof prowizjaProc !== 'number' || Number.isNaN(prowizjaProc)) {
        errors.push('Brak lub nieprawidłowa wartość prowizji (prowizjaProc).');
    }

    if (!Array.isArray(pracownicy) || pracownicy.length === 0) {
        errors.push('Brak listy pracowników do przetworzenia.');
    } else {
        pracownicy.forEach((p, index) => {
            if (typeof p.nettoDocelowe !== 'number' || p.nettoDocelowe <= 0 || Number.isNaN(p.nettoDocelowe)) {
                errors.push(`Pracownik #${index + 1}: brak nettoDocelowe.`);
            }
            if (typeof p.nettoZasadnicza !== 'number' || p.nettoZasadnicza <= 0 || Number.isNaN(p.nettoZasadnicza)) {
                errors.push(`Pracownik #${index + 1}: brak nettoZasadnicza (podstawa do podziału).`);
            }
            if (!p.typUmowy) {
                errors.push(`Pracownik #${index + 1}: brak typu umowy.`);
            }
        });
    }

    return { errors };
};

export const buildStatsFromKalkulacja = (dane: ZapisanaKalkulacja['dane']): OfferStats => {
    const { firma, pracownicy = [], config, prowizjaProc } = dane;
    const activePracownicy = pracownicy || [];

    if (activePracownicy.length === 0) {
        return { ...DEFAULT_STATS };
    }

    const details = activePracownicy.map((p: any) => {
        const standard = obliczWariantStandard(p, firma.stawkaWypadkowa, config);
        const podzial = obliczWariantPodzial(p, firma.stawkaWypadkowa, p.nettoZasadnicza, config);
        return { standard, podzial };
    });

    const sumaKosztStandard = details.reduce((acc: number, w: any) => acc + w.standard.kosztPracodawcy, 0);
    const sumaKosztPodzial = details.reduce((acc: number, w: any) => acc + w.podzial.kosztPracodawcy, 0);
    const sumaBruttoSwiadczen = details.reduce((acc: number, w: any) => acc + w.podzial.swiadczenie.brutto, 0);
    const oszczednoscBrutto = sumaKosztStandard - sumaKosztPodzial;
    const kwotaProwizji = sumaBruttoSwiadczen * (prowizjaProc / 100);
    const oszczednoscNetto = oszczednoscBrutto - kwotaProwizji;

    const retentionShare = 0.30; 
    const retentionAmount = oszczednoscNetto * retentionShare; 
    
    const nettoStandardTotal = details.reduce((acc: number, w: any) => acc + w.standard.netto, 0);
    const nettoStrattonTotal = details.reduce((acc: number, w: any) => acc + w.podzial.doWyplaty, 0);

    return {
        standard: {
            kosztPracodawcy: sumaKosztStandard,
            zusPracodawca: details.reduce((acc: number, w: any) => acc + w.standard.zusPracodawca.suma, 0),
            brutto: details.reduce((acc: number, w: any) => acc + w.standard.brutto, 0),
            netto: nettoStandardTotal,
            zusPracownik: details.reduce((acc: number, w: any) => acc + w.standard.zusPracownik.suma + w.standard.zdrowotna, 0),
            pit: details.reduce((acc: number, w: any) => acc + w.standard.pit, 0)
        },
        stratton: {
            kosztPracodawcy: sumaKosztPodzial + kwotaProwizji,
            zusPracodawca: details.reduce((acc: number, w: any) => acc + w.podzial.zasadnicza.zusPracodawca.suma, 0),
            brutto: details.reduce((acc: number, w: any) => acc + w.podzial.pit.lacznyPrzychod, 0),
            netto: nettoStrattonTotal,
            zusPracownik: details.reduce((acc: number, w: any) => acc + w.podzial.zasadnicza.zusPracownik.suma + w.podzial.zasadnicza.zdrowotna, 0),
            pit: details.reduce((acc: number, w: any) => acc + w.podzial.pit.kwota, 0),
            prowizja: kwotaProwizji
        },
        plus: {
            kosztPracodawcy: sumaKosztPodzial + kwotaProwizji + retentionAmount,
            zusPracodawca: details.reduce((acc: number, w: any) => acc + w.podzial.zasadnicza.zusPracodawca.suma, 0),
            brutto: details.reduce((acc: number, w: any) => acc + w.podzial.pit.lacznyPrzychod, 0) + retentionAmount,
            netto: nettoStrattonTotal + retentionAmount,
            zusPracownik: details.reduce((acc: number, w: any) => acc + w.podzial.zasadnicza.zusPracownik.suma + w.podzial.zasadnicza.zdrowotna, 0),
            pit: details.reduce((acc: number, w: any) => acc + w.podzial.pit.kwota, 0),
            prowizja: kwotaProwizji 
        },
        oszczednoscRoczna: oszczednoscNetto * 12,
        oszczednoscMiesieczna: oszczednoscNetto
    };
};

export const renderOfferHtml = (firma: ZapisanaKalkulacja['dane']['firma'], stats: OfferStats): string => {
    const htmlContent = ReactDOMServer.renderToStaticMarkup(
        <OfferHtmlDocument firma={firma} stats={stats} />
    );
    return `<!DOCTYPE html>${htmlContent}`;
};

export const offerPdfGenerator = {
    generateOfferPDF: async (kalkulacja: ZapisanaKalkulacja) => {
        try {
            const validation = validateKalkulacjaInput(kalkulacja);
            if (validation.errors.length) {
                const message = `Dane wejściowe są niekompletne:\n- ${validation.errors.join('\n- ')}`;
                console.error(message);
                alert(message);
                return false;
            }

            const { dane } = kalkulacja;
            const { firma } = dane;

            const stats = buildStatsFromKalkulacja(dane);

            const fullHtml = renderOfferHtml(firma, stats);

            try {
                const response = await fetch('http://localhost:3002/generate-pdf', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ html: fullHtml })
                });

                if (!response.ok) {
                    throw new Error(`Server error: ${response.statusText}`);
                }

                const blob = await response.blob();
                
                 // Download
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Oferta_${firma.nazwa || 'Firmy'}_HTML_${new Date().toISOString().slice(0,10)}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                return true;

            } catch (serverError) {
                console.error("Puppeteer server failed or not reachable.", serverError);
                alert("Błąd generatora PDF (Server 3002). Upewnij się, że backend jest uruchomiony poleceniem 'node server/index.js'.\n\nFallback do starego generatora (opcjonalne, nie zaimplementowane w tym kroku).");
                return false;
            }

        } catch (error) {
            console.error('Błąd generowania PDF:', error);
            throw error;
        }
    }
};
