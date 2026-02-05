
import { useState, useMemo } from 'react';
import { WynikPracownika } from '../entities/calculation/model';

export const useResultsFilter = (data: WynikPracownika[] | undefined) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = useMemo(() => {
        if (!data) return [];
        if (!searchQuery) return data;
        
        const q = searchQuery.toLowerCase();
        return data.filter((w) => 
            w.pracownik.imie.toLowerCase().includes(q) ||
            w.pracownik.nazwisko.toLowerCase().includes(q) ||
            w.pracownik.typUmowy.toLowerCase().includes(q) ||
            (w.standard?.kosztPracodawcy?.toString() || '').includes(q) ||
            (w.podzial?.kosztPracodawcy?.toString() || '').includes(q)
        );
    }, [data, searchQuery]);

    return {
        searchQuery,
        setSearchQuery,
        filteredData
    };
};
