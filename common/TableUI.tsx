
import React from 'react';

export const TableContainer = ({ children, className = '', ...props }: React.ComponentPropsWithoutRef<'div'>) => (
    // FIX: Added max-w restrictions to prevent body scroll
    <div className={`flex-1 overflow-auto overflow-x-auto w-full max-w-[calc(100vw-32px)] md:max-w-full border-t border-slate-200 relative custom-scrollbar ${className}`} {...props}>
        <table className="w-full text-left border-collapse min-w-max">
            {children}
        </table>
    </div>
);

export const Thead = ({ children, className = '', ...props }: React.ComponentPropsWithoutRef<'thead'>) => (
    <thead className={`bg-slate-50 sticky top-0 z-10 shadow-sm ${className}`} {...props}>
        {children}
    </thead>
);

export const Tbody = ({ children, className = '', ...props }: React.ComponentPropsWithoutRef<'tbody'>) => (
    <tbody className={`bg-white ${className}`} {...props}>
        {children}
    </tbody>
);

export const Tfoot = ({ children, className = '', ...props }: React.ComponentPropsWithoutRef<'tfoot'>) => (
    <tfoot className={`bg-slate-100 font-bold sticky bottom-0 z-10 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] ${className}`} {...props}>
        {children}
    </tfoot>
);

export const Tr = ({ children, className = '', ...props }: React.ComponentPropsWithoutRef<'tr'>) => (
    <tr className={`hover:bg-slate-50 transition-colors group ${className}`} {...props}>
        {children}
    </tr>
);

export const Th = ({ children, className = '', ...props }: React.ComponentPropsWithoutRef<'th'>) => (
    <th className={`px-2 md:px-3 py-2 md:py-3 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 whitespace-nowrap ${className}`} {...props}>
        {children}
    </th>
);

export const ThRight = ({ children, className = '', ...props }: React.ComponentPropsWithoutRef<'th'>) => (
    <Th className={`text-right ${className}`} {...props}>{children}</Th>
);

export const ThCenter = ({ children, className = '', ...props }: React.ComponentPropsWithoutRef<'th'>) => (
    <Th className={`text-center ${className}`} {...props}>{children}</Th>
);

export const Td = ({ children, className = '', ...props }: React.ComponentPropsWithoutRef<'td'>) => (
    <td className={`px-2 md:px-3 py-2 md:py-3 border-b border-slate-100 text-sm text-slate-700 whitespace-nowrap ${className}`} {...props}>
        {children}
    </td>
);

export const TdRight = ({ children, className = '', ...props }: React.ComponentPropsWithoutRef<'td'>) => (
    <Td className={`text-right font-variant-numeric tabular-nums ${className}`} {...props}>{children}</Td>
);

export const TdCenter = ({ children, className = '', ...props }: React.ComponentPropsWithoutRef<'td'>) => (
    <Td className={`text-center ${className}`} {...props}>{children}</Td>
);
