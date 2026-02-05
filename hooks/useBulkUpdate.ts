
import { useState } from 'react';
import { useEmployees } from '../store/EmployeeContext';
import { useCompany } from '../store/CompanyContext';
import { formatPLN } from '../shared/utils/formatters';
import { WynikPracownika } from '../entities/calculation/model';

export const useBulkUpdate = (filteredData: WynikPracownika[]) => {
    const { setPracownicy } = useEmployees();
    const { config } = useCompany();
    const [bulkAmount, setBulkAmount] = useState<string>('');

    const handleBulkUpdate = (amount: number) => {
        if (confirm(`Czy na pewno ustawić kwotę bazową (ZUS) na ${formatPLN(amount)} dla ${filteredData.length} wyświetlonych pracowników?`)) {
            const visibleIds = new Set(filteredData.map((w) => w.pracownik.id));
            setPracownicy(prev => prev.map(p => 
                visibleIds.has(p.id) ? { ...p, nettoZasadnicza: amount } : p
            ));
        }
    };

    const handleSetManual = () => {
        if(bulkAmount) handleBulkUpdate(parseFloat(bulkAmount));
    };

    const handleSetMinKrajowa = () => handleBulkUpdate(config.placaMinimalna.netto);
    const handleSetMinUZ = () => handleBulkUpdate(config.minimalnaKwotaUZ.zasadniczaNetto);

    return {
        bulkAmount,
        setBulkAmount,
        handleSetManual,
        handleSetMinKrajowa,
        handleSetMinUZ
    };
};
