import { ZapisanaKalkulacja } from '../entities/history/model';
import { printHtmlAsPdf } from '../shared/utils/printPdf';
import { getOfferPdfV3Styles } from './offerPdfV3/styles';
import { obliczWariantStandard, obliczWariantPodzial, calculateCommission } from '../features/tax-engine';
import {
    generatePage01V3,
    generatePage02V3,
    generate4przesankiwyczeniaZUS2ust1pkt26RozpMPiPSV3, 
    generatePage04V3, 
    generatePage05V3, 
    generatePage06V3, 
    generatePage07V3, 
    generatePage08V3, 
    generatePage09V3, 
    generatePage10V3, 
    generateIlekosztujeCikadymiesiczwokiV3, 
    generateJakjestpodzielonawygenerowanawartoV3,
    generateHookPageV3
} from './offerPdfV3/pages';

export const offerPdfV3Generator = {
    generateOfferPDF: (item: ZapisanaKalkulacja, sector: string = 'MSP') => {
        const tempPracownicy = item.dane.pracownicy;
        const tempFirma = item.dane.firma;
        const tempConfig = item.dane.config;
        const tempProwizja = item.dane.prowizjaProc || 28;

        const date = new Date().toLocaleDateString('pl-PL');

        const deadlineDate = new Date();
        deadlineDate.setDate(deadlineDate.getDate() + 14);
        const offerDeadline = deadlineDate.toLocaleDateString('pl-PL');

        const details = tempPracownicy.map((p: any) => {
            const currentModel = obliczWariantStandard(p, tempFirma.stawkaWypadkowa, tempConfig);
            const nettoZasadnicza = p.nettoZasadnicza || (p.nettoDocelowe * 0.8);
            const elitonBase = obliczWariantPodzial(p, tempFirma.stawkaWypadkowa, nettoZasadnicza, tempConfig);
            
            const benefitNetto = elitonBase.swiadczenie.netto;
            const adminBonus = benefitNetto * 0.02;
            const raise = benefitNetto * 0.04;

            return { currentModel, elitonBase, benefitNetto, adminBonus, raise };
        });

        const sumaKosztCurrent = details.reduce((acc: number, w: any) => acc + w.currentModel.kosztPracodawcy, 0);
        const sumaKosztElitonBase = details.reduce((acc: number, w: any) => acc + w.elitonBase.kosztPracodawcy, 0);
        const sumaNettoSwiadczen = details.reduce((acc: number, w: any) => acc + w.benefitNetto, 0);
        const sumaAdminBonus = details.reduce((acc: number, w: any) => acc + w.adminBonus, 0);
        const sumaRaise = details.reduce((acc: number, w: any) => acc + w.raise, 0);

        const prowizja = calculateCommission(sumaNettoSwiadczen, tempProwizja);

        const elitonStandardCost = sumaKosztElitonBase;
        const elitonPlusCost = sumaKosztElitonBase + sumaAdminBonus + sumaRaise;

        const oszczednoscStandard = sumaKosztCurrent - elitonStandardCost - prowizja;
        // Correct: employer pays sumaKosztElitonBase + full prowizja (Stratton redistributes raise+adminBonus from within prowizja)
        const oszczednoscPlus = sumaKosztCurrent - sumaKosztElitonBase - prowizja;

        const sumaZusPracodawcy = details.reduce((acc: number, w: any) => acc + (w.currentModel.kosztPracodawcy - w.currentModel.brutto), 0);
        const sumaBrutto = details.reduce((acc: number, w: any) => acc + w.currentModel.brutto, 0);

        const sumaZasadnicza = details.reduce((acc: number, w: any) => acc + w.elitonBase.zasadnicza.brutto, 0);
        const sumaSwiadczenieBrutto = details.reduce((acc: number, w: any) => acc + w.elitonBase.swiadczenie.brutto, 0);
        // Correct: ZUS is only on zasadnicza.brutto, not on swiadczenie.brutto
        const sumaZusPracodawcyEliton = sumaKosztElitonBase - sumaZasadnicza - sumaSwiadczenieBrutto;

        const sumaZusPracownika = details.reduce((acc: number, w: any) => acc + w.currentModel.zusPracownik.suma + w.currentModel.zdrowotna, 0);
        const sumaZusPracownikaEliton = details.reduce((acc: number, w: any) => acc + w.elitonBase.zasadnicza.zusPracownik.suma + w.elitonBase.zasadnicza.zdrowotna, 0);
        const sumaNetto = details.reduce((acc: number, w: any) => acc + w.currentModel.netto, 0);
        const sumaNettoElitonPlus = sumaNetto + sumaRaise;

        const bruttoReduction = sumaBrutto - sumaZasadnicza;
        // Actual brutto reduction: old total brutto minus new total brutto (zasadnicza + swiadczenieBrutto)
        const efektStruktury = sumaBrutto - sumaZasadnicza - sumaSwiadczenieBrutto;
        const zusSaved = sumaZusPracodawcy - sumaZusPracodawcyEliton;

        const sumaNettoZasadnicze = details.reduce((acc: number, w: any) => acc + (w.elitonBase.zasadnicza.nettoGotowka || 0), 0);

        const totals = {
            count: tempPracownicy.length,
            sumaZusPracodawcy,
            sumaBrutto,
            sumaZusPracodawcyEliton,
            sumaZasadnicza,
            sumaRaise,
            sumaAdminBonus,
            bruttoReduction,
            efektStruktury,
            zusSaved,
            sumaZusPracownika,
            sumaZusPracownikaEliton,
            sumaNetto,
            sumaNettoElitonPlus,
            sumaNettoZasadnicze,
            currentCost: sumaKosztCurrent,
            elitonPlusCost: elitonPlusCost,
            plusCost: sumaKosztElitonBase + prowizja,
            savingsPlus: oszczednoscPlus,
            sumaSwiadczenieBrutto,
            savingsStandard: oszczednoscStandard,
            commission: prowizja,
            totalBenefit: sumaNettoSwiadczen,
            offerDeadline,
            prowizjaProc: tempProwizja
        };

        const pages = [
            generatePage01V3(tempFirma, totals, date, sector),                                      // cover — Strona tytułowa
            generatePage02V3(tempFirma, totals, date, sector),                                      // 1. Jak zrozumieliśmy Twoją sytuację
            generatePage06V3(tempFirma, totals, date, sector),                                      // 2. Obraz finansowy
            generateJakjestpodzielonawygenerowanawartoV3(tempFirma, totals, date, sector),          // 3. Skąd różnica
            generatePage04V3(tempFirma, totals, date, sector),                                      // 4. Czym jest i czym nie jest
            generatePage07V3(tempFirma, totals, date, sector),                                      // 5. Wybierz wariant dla Swojej firmy
            generatePage05V3(tempFirma, totals, date, sector),                                      // 6. Twarde dane finansowe
            generatePage10V3(tempFirma, date, sector),                                              // 7. Pytania i odpowiedzi
            generate4przesankiwyczeniaZUS2ust1pkt26RozpMPiPSV3(tempFirma, date, sector),           // 8. Mechanizm i bezpieczeństwo
            generatePage08V3(tempFirma, date, sector),                                              // 9. Proces i warunki
            generateIlekosztujeCikadymiesiczwokiV3(tempFirma, totals, date, sector),                // 10. Twoja droga do pierwszych oszczędności
            generatePage09V3(tempFirma, date, sector),                                              // 11. Dlaczego Stratton Prime
            generateHookPageV3(tempFirma, totals, date, sector),                                    // 12. Jak będzie wyglądać Twoja firma za rok?
        ];

        const html = `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${tempFirma?.nazwa || 'Oferta'} - Eliton Prime™</title>
    <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet">
    <style>${getOfferPdfV3Styles()}</style>
</head>
<body style="margin: 0; padding: 0; background: #CCC8C2; display: flex; flex-direction: column; align-items: center;">
    ${pages.join('\n')}
    <script>
        window.onload = () => {
            window.print();
        };
    </script>
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        printHtmlAsPdf(html, url);
    }
};