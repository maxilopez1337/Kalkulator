
import { describe, it, expect } from 'vitest';
import { parseExcelData } from './excelParser';
import { DEFAULT_CONFIG } from '../../features/tax-engine/constants';

describe('Excel Parser v2.6.1 Logic', () => {
    
    // Helper: Create a row array based on columns A-J (index 0-9)
    const createRow = (data: Partial<Record<number, any>>) => {
        const row = [];
        row[0] = data[0] || 'Jan Kowalski'; // A: Name
        row[1] = data[1] || '1990-01-01'; // B: Date
        row[2] = data[2] || 'M';          // C: Sex
        row[3] = data[3] || 'Umowa o pracę'; // D: Type
        row[4] = data[4] || 'Pełne składki'; // E: ZUS Type
        row[5] = data[5] || 5000;         // F: Netto
        row[6] = data[6] || '250';        // G: KUP
        row[7] = data[7] || '300';        // H: PIT-2
        row[8] = data[8] || 'NIE';        // I: Ulga
        row[9] = data[9] || '12%';        // J: PIT Mode
        return row;
    };

    it('Should correctly parse Standard UOP', () => {
        const rows = [
            [], // Header
            [], // Example
            createRow({ 3: 'Umowa o pracę', 5: 5000 })
        ];

        const result = parseExcelData(rows, DEFAULT_CONFIG);
        
        expect(result).toHaveLength(1);
        const p = result[0].data;
        
        expect(p?.typUmowy).toBe('UOP');
        expect(p?.nettoDocelowe).toBe(5000);
        expect(p?.kupTyp).toBe('STANDARD'); // Default for UOP
        expect(p?.trybSkladek).toBe('PELNE');
    });

    it('Should detect UZ and auto-set KUP to PROC_20', () => {
        const rows = [
            [], [],
            createRow({ 
                3: 'Umowa zlecenie', 
                6: '20%' // Excel visual value
            })
        ];

        const result = parseExcelData(rows, DEFAULT_CONFIG);
        const p = result[0].data;

        expect(p?.typUmowy).toBe('UZ');
        expect(p?.kupTyp).toBe('PROC_20');
        // Should default to minimum UZ base if not provided in logic, but parser uses config
        expect(p?.nettoZasadnicza).toBe(DEFAULT_CONFIG.minimalnaKwotaUZ.zasadniczaNetto);
    });

    it('Should detect Student status and disable Social ZUS', () => {
        const rows = [
            [], [],
            createRow({ 
                3: 'Umowa zlecenie', 
                4: 'Student/uczeń do 26 (bez ZUS)' 
            })
        ];

        const result = parseExcelData(rows, DEFAULT_CONFIG);
        const p = result[0].data;

        expect(p?.typUmowy).toBe('UZ');
        expect(p?.trybSkladek).toBe('STUDENT_UZ');
        expect(p?.choroboweAktywne).toBe(false);
        // Students don't pay FP/FGSP
        expect(p?.skladkaFP).toBe(false); 
    });

    it('Should handle "Autorskie koszty" (50%) correctly', () => {
        const rows = [
            [], [],
            createRow({ 
                3: 'Umowa zlecenie', 
                6: '50% (autorskie)' 
            })
        ];

        const result = parseExcelData(rows, DEFAULT_CONFIG);
        const p = result[0].data;

        expect(p?.kupTyp).toBe('PROC_50');
    });

    it('Should detect "Ulga dla młodych" based on Age or Column I', () => {
        // Case 1: Explicit YES overrides age
        const rows1 = [ [], [], createRow({ 8: 'TAK', 1: '1980-01-01' }) ]; 
        const p1 = parseExcelData(rows1, DEFAULT_CONFIG)[0].data;
        expect(p1?.ulgaMlodych).toBe(true);
        expect(p1?.pitMode).toBe('FLAT_0');

        // Case 2: Inferred from Date (< 26 y.o)
        const currentYear = new Date().getFullYear();
        const youngBirthYear = currentYear - 20;
        const rows2 = [ [], [], createRow({ 8: 'NIE', 1: `${youngBirthYear}-01-01` }) ]; 
        // Note: Parser logic prioritizes explicit 'NIE' over age if column is present and valid
        const p2 = parseExcelData(rows2, DEFAULT_CONFIG)[0].data;
        expect(p2?.ulgaMlodych).toBe(false);
    });

    it('Should validate Netto > 0', () => {
        const rows = [ [], [], createRow({ 5: -100 }) ];
        const result = parseExcelData(rows, DEFAULT_CONFIG);
        expect(result[0].isValid).toBe(false);
        expect(result[0].errors).toContain('Netto <= 0');
    });
});
