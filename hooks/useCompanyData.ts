
import { useState, useEffect } from 'react';
import { useCompany } from '../store/CompanyContext';
import { validateNIP } from '../shared/utils/validators';
import { formatNIP } from '../shared/utils/formatters';

// Baza testowa dla demonstracji "Prawdziwych danych"
const MOCK_GUS_DB: Record<string, { nazwa: string, adres: string, kod: string, miasto: string }> = {
    '5272449205': { nazwa: 'GOOGLE POLAND SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ', adres: 'ul. Emilii Plater 53', kod: '00-113', miasto: 'Warszawa' },
    '7740001454': { nazwa: 'ORLEN SPÓŁKA AKCYJNA', adres: 'ul. Chemików 7', kod: '09-411', miasto: 'Płock' },
    '5252344078': { nazwa: 'JERONIMO MARTINS POLSKA S.A.', adres: 'ul. Żniwna 5', kod: '62-025', miasto: 'Kostrzyn' },
    '8971695920': { nazwa: 'INPOST SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ', adres: 'ul. Wielicka 28', kod: '30-552', miasto: 'Kraków' },
    '5270103604': { nazwa: 'CD PROJEKT S.A.', adres: 'ul. Jagiellońska 74', kod: '03-301', miasto: 'Warszawa' },
    '5260250995': { nazwa: 'MICROSOFT SP. Z O.O.', adres: 'Al. Jerozolimskie 195A', kod: '02-222', miasto: 'Warszawa' },
    '5220002529': { nazwa: 'POLSKIE LINIE LOTNICZE LOT S.A.', adres: 'ul. Komitetu Obrony Robotników 43', kod: '02-146', miasto: 'Warszawa' },
    '5261040828': { nazwa: 'SKANSKA S.A.', adres: 'al. "Solidarności" 173', kod: '00-877', miasto: 'Warszawa' }
};

export const useCompanyData = () => {
    const { firma, setFirma } = useCompany();
    const [nipValidation, setNipValidation] = useState<{valid: boolean | null, message: string}>({ valid: null, message: '' });
    const [isFetching, setIsFetching] = useState(false);
    const [fetchStatus, setFetchStatus] = useState<{type: 'success' | 'info' | 'error', text: string} | null>(null);

    useEffect(() => {
        if (!firma.nip) {
            setNipValidation({ valid: null, message: '' });
            setFetchStatus(null);
        } else {
            const digits = firma.nip.replace(/\D/g, '');
            if (digits.length === 10) {
                setNipValidation(validateNIP(firma.nip));
            }
        }
    }, [firma.nip]);

    const handleNipChange = (value: string) => {
        const formatted = formatNIP(value);
        setFirma({...firma, nip: formatted});
        setFetchStatus(null);
        
        const digits = formatted.replace(/\D/g, '');
        if (digits.length === 10) {
            setNipValidation(validateNIP(formatted));
        } else if (digits.length === 0) {
            setNipValidation({ valid: null, message: '' });
        } else {
            setNipValidation({ valid: false, message: `Wpisano ${digits.length}/10 cyfr` });
        }
    };

    const openGoogleSearch = () => {
        const cleanNip = firma.nip.replace(/\D/g, '');
        if (cleanNip) {
            window.open(`https://www.google.pl/search?q=NIP+${cleanNip}`, '_blank');
        }
    };

    const fetchGusData = () => {
        if (!nipValidation.valid) return;
        setIsFetching(true);
        setFetchStatus(null);
        
        const cleanNip = firma.nip.replace(/\D/g, '');

        setTimeout(() => {
            const realData = MOCK_GUS_DB[cleanNip];

            if (realData) {
                setFirma({
                    ...firma,
                    nazwa: realData.nazwa,
                    adres: realData.adres,
                    kodPocztowy: realData.kod,
                    miasto: realData.miasto,
                    email: firma.email || '',
                    telefon: firma.telefon || '',
                    osobaKontaktowa: firma.osobaKontaktowa || ''
                });
                setFetchStatus({ type: 'success', text: 'Pobrano dane z bazy GUS (Demo: Znana firma).' });
            } else {
                setFirma({
                    ...firma,
                    nazwa: `PRZEDSIĘBIORSTWO HANDLOWO-USŁUGOWE "NIP ${cleanNip}" SP. Z O.O.`,
                    adres: 'ul. Przykładowa 12/4',
                    kodPocztowy: '00-001',
                    miasto: 'Warszawa',
                    email: firma.email || '',
                    telefon: firma.telefon || '',
                    osobaKontaktowa: firma.osobaKontaktowa || ''
                });
                setFetchStatus({ 
                    type: 'info', 
                    text: 'Symulacja: Wygenerowano dane testowe (Użyj NIP znanej firmy np. Google, Orlen dla prawdziwych danych).' 
                });
            }
            setIsFetching(false);
        }, 600);
    };

    return {
        firma,
        setFirma,
        nipValidation,
        isFetching,
        fetchStatus,
        handleNipChange,
        openGoogleSearch,
        fetchGusData
    };
};
