
import React from 'react';
import { Check, X, Info } from '../icons/Icons';

interface ToastProps {
    notification: { type: 'success' | 'error' | 'info'; message: string } | null;
    onClose: () => void;
}

export const Toast = ({ notification, onClose }: ToastProps) => {
    if (!notification) return null;

    const isSuccess = notification.type === 'success';
    const isError = notification.type === 'error';

    return (
        <div className={`fixed bottom-6 right-6 z-[100] max-w-sm w-full bg-white rounded-lg shadow-2xl border-l-4 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 flex items-center p-4 gap-3 ${isSuccess ? 'border-emerald-500' : isError ? 'border-rose-500' : 'border-blue-500'}`}>
            <div className={`p-2 rounded-full flex-shrink-0 ${isSuccess ? 'bg-emerald-100 text-emerald-600' : isError ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                {isSuccess ? <Check className="w-5 h-5" /> : isError ? <X className="w-5 h-5" /> : <Info className="w-5 h-5" />}
            </div>
            <div className="flex-1">
                <h4 className={`text-sm font-bold ${isSuccess ? 'text-emerald-900' : isError ? 'text-rose-900' : 'text-blue-900'}`}>
                    {isSuccess ? 'Sukces' : isError ? 'Błąd' : 'Informacja'}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">{notification.message}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};
