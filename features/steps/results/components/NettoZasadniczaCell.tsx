
import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../../../../store/AppContext';
import { formatPLN } from '../../../../shared/utils/formatters';
import { obliczWariantPodzial } from '../../../../features/tax-engine';
import { Pracownik } from '../../../../entities/employee/model';

interface NettoCellProps {
    pracownik: Pracownik;
    standardKoszt: number;
}

export const NettoZasadniczaCell = ({ pracownik, standardKoszt }: NettoCellProps) => {
    const { config, firma, setPracownicy } = useAppStore();
    const [localValue, setLocalValue] = useState<string>(pracownik.nettoZasadnicza.toString());
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (!isFocused) {
            setLocalValue(pracownik.nettoZasadnicza.toString());
        }
    }, [pracownik.nettoZasadnicza, isFocused]);

    const handleUpdate = (val: number) => {
        setPracownicy(prev => prev.map(p => p.id === pracownik.id ? { ...p, nettoZasadnicza: val } : p));
    };

    const handleBlur = () => {
        setIsFocused(false);
        const val = parseFloat(localValue);
        if (!isNaN(val) && val >= 0) {
            handleUpdate(val);
        } else {
            setLocalValue(pracownik.nettoZasadnicza.toString()); 
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    const currentVal = parseFloat(localValue) || 0;
    const liveSavings = useMemo(() => {
        const symulacja = obliczWariantPodzial(pracownik, firma.stawkaWypadkowa, currentVal, config);
        return standardKoszt - symulacja.kosztPracodawcy;
    }, [currentVal, pracownik, firma.stawkaWypadkowa, config, standardKoszt]);

    // Student logic - show disabled state
    const isStudent = pracownik.trybSkladek === 'STUDENT_UZ';

    if (isStudent) {
        return (
            <div className="flex items-center justify-end h-full">
                <span className="text-[10px] text-[#a19f9d] italic mr-2">Brak ZUS</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-end justify-center relative w-full">
            <div className="relative w-full">
                <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={localValue} 
                    onChange={(e) => setLocalValue(e.target.value)}
                    onFocus={(e) => { setIsFocused(true); e.target.select(); }}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className={`w-full px-2 py-1.5 text-[12px] text-right rounded font-bold outline-none transition-all
                        ${isFocused 
                            ? 'border border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.2)] bg-white text-blue-900 z-10' 
                            : 'border border-transparent bg-transparent hover:bg-white hover:border-blue-200 text-blue-700 cursor-text'}
                    `}
                />
                {!isFocused && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 text-blue-300 opacity-0 group-hover:opacity-100 pointer-events-none">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </div>
                )}
            </div>
            
            {liveSavings > 0 && (
                <div className={`absolute -bottom-3 right-0 text-[9px] font-bold px-1 rounded-sm bg-emerald-100 text-emerald-700 leading-tight transform scale-90 origin-right transition-opacity ${isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    Oszcz: +{formatPLN(liveSavings)}
                </div>
            )}
        </div>
    );
};
