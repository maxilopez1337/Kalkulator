import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ConfirmDialog } from '../shared/ui/ConfirmDialog';

export interface ConfirmOptions {
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'danger';
}

interface ConfirmState {
    message: string;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
}

interface ConfirmContextType {
    confirmDialog: (message: string, options?: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider = ({ children }: { children?: ReactNode }) => {
    const [state, setState] = useState<ConfirmState | null>(null);

    const confirmDialog = (message: string, options: ConfirmOptions = {}): Promise<boolean> =>
        new Promise(resolve => setState({ message, options, resolve }));

    const handleChoice = (result: boolean) => {
        state?.resolve(result);
        setState(null);
    };

    return (
        <ConfirmContext.Provider value={{ confirmDialog }}>
            {children}
            {state && (
                <ConfirmDialog
                    message={state.message}
                    onConfirm={() => handleChoice(true)}
                    onCancel={() => handleChoice(false)}
                    {...state.options}
                />
            )}
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
    return ctx;
};
