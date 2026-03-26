
import React from 'react';
import { formatPLN } from '../../../../shared/utils/formatters';

export interface CollapsedGroup {
    key: string;
    label: string;
    value: number;
}

interface CollapsedGroupBarProps {
    groups: CollapsedGroup[];
    onExpand: (key: string) => void;
}

export const CollapsedGroupBar = ({ groups, onExpand }: CollapsedGroupBarProps) => {
    if (groups.length === 0) return null;
    return (
        <div className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 bg-white border-b border-[#edebe9] flex-shrink-0">
            <span className="text-[11px] text-[#a19f9d] font-medium select-none mr-1">Zwinięte:</span>
            {groups.map(g => (
                <button
                    key={g.key}
                    onClick={() => onExpand(g.key)}
                    className="inline-flex items-center gap-1.5 h-[22px] px-2.5 bg-[#deecf9] text-[#0078d4] border border-[#c7e0f4] text-[11px] font-medium hover:bg-[#c7e0f4] active:bg-[#b3d6f0] transition-colors whitespace-nowrap"
                    title="Kliknij aby rozwinąć"
                >
                    {g.label}
                    <span className="opacity-60 tabular-nums">{formatPLN(g.value)}</span>
                    <span className="opacity-40 text-[9px] ml-0.5">▸</span>
                </button>
            ))}
        </div>
    );
};
