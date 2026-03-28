import React from 'react';
import { ButtonPrimary, ButtonSecondary, ButtonDanger } from './Button';

interface ConfirmDialogProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'danger';
}

export const ConfirmDialog = ({
    message,
    onConfirm,
    onCancel,
    confirmLabel = 'Tak',
    cancelLabel = 'Anuluj',
    variant = 'default',
}: ConfirmDialogProps) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
        <div className="relative bg-white rounded-md shadow-[0_6.4px_14.4px_0_rgba(0,0,0,0.13),0_1.2px_3.6px_0_rgba(0,0,0,0.10)] max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <p className="text-sm text-[#323130] leading-relaxed mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
                <ButtonSecondary size="sm" onClick={onCancel}>{cancelLabel}</ButtonSecondary>
                {variant === 'danger'
                    ? <ButtonDanger size="sm" onClick={onConfirm}>{confirmLabel}</ButtonDanger>
                    : <ButtonPrimary size="sm" onClick={onConfirm}>{confirmLabel}</ButtonPrimary>
                }
            </div>
        </div>
    </div>
);
