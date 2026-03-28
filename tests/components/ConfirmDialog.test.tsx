import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';

describe('ConfirmDialog', () => {
    it('renders the message text', () => {
        render(
            <ConfirmDialog
                message="Czy na pewno chcesz usunąć?"
                onConfirm={vi.fn()}
                onCancel={vi.fn()}
            />
        );
        expect(screen.getByText('Czy na pewno chcesz usunąć?')).toBeInTheDocument();
    });

    it('renders default labels Tak / Anuluj', () => {
        render(<ConfirmDialog message="Pytanie?" onConfirm={vi.fn()} onCancel={vi.fn()} />);
        expect(screen.getByText('Tak')).toBeInTheDocument();
        expect(screen.getByText('Anuluj')).toBeInTheDocument();
    });

    it('renders custom confirmLabel and cancelLabel', () => {
        render(
            <ConfirmDialog
                message="Pytanie?"
                onConfirm={vi.fn()}
                onCancel={vi.fn()}
                confirmLabel="Usuń"
                cancelLabel="Wróć"
            />
        );
        expect(screen.getByText('Usuń')).toBeInTheDocument();
        expect(screen.getByText('Wróć')).toBeInTheDocument();
    });

    it('calls onConfirm when confirm button clicked', () => {
        const onConfirm = vi.fn();
        render(<ConfirmDialog message="?" onConfirm={onConfirm} onCancel={vi.fn()} />);
        fireEvent.click(screen.getByText('Tak'));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button clicked', () => {
        const onCancel = vi.fn();
        render(<ConfirmDialog message="?" onConfirm={vi.fn()} onCancel={onCancel} />);
        fireEvent.click(screen.getByText('Anuluj'));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when backdrop is clicked', () => {
        const onCancel = vi.fn();
        render(<ConfirmDialog message="?" onConfirm={vi.fn()} onCancel={onCancel} />);
        const backdrop = document.querySelector('.absolute.inset-0') as HTMLElement;
        fireEvent.click(backdrop);
        expect(onCancel).toHaveBeenCalledTimes(1);
    });
});
