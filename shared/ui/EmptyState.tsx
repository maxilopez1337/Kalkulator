import React from 'react';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export const EmptyState = ({ icon, title, description, action, className = '' }: EmptyStateProps) => (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
        <div className="w-14 h-14 bg-white border border-[#edebe9] rounded-sm flex items-center justify-center mb-4 shadow-[0_1.6px_3.6px_0_rgba(0,0,0,0.13),0_0.3px_0.9px_0_rgba(0,0,0,0.11)]">
            <div className="text-[#a19f9d] w-6 h-6 flex items-center justify-center [&>svg]:w-6 [&>svg]:h-6">
                {icon}
            </div>
        </div>
        <p className="text-[14px] font-semibold text-[#201f1e]">{title}</p>
        {description && (
            <p className="text-sm text-[#605e5c] mt-1 max-w-xs">{description}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
    </div>
);
