import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from '../../shared/ui/Toast';

describe('Toast', () => {
    it('renders nothing when notification is null', () => {
        const { container } = render(<Toast notification={null} onClose={vi.fn()} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders success message with "Sukces" title', () => {
        render(<Toast notification={{ type: 'success', message: 'Zapisano!' }} onClose={vi.fn()} />);
        expect(screen.getByText('Sukces')).toBeInTheDocument();
        expect(screen.getByText('Zapisano!')).toBeInTheDocument();
    });

    it('renders error message with "Błąd" title', () => {
        render(<Toast notification={{ type: 'error', message: 'Coś poszło nie tak' }} onClose={vi.fn()} />);
        expect(screen.getByText('Błąd')).toBeInTheDocument();
        expect(screen.getByText('Coś poszło nie tak')).toBeInTheDocument();
    });

    it('renders info message with "Informacja" title', () => {
        render(<Toast notification={{ type: 'info', message: 'Informacja zwrotna' }} onClose={vi.fn()} />);
        expect(screen.getByText('Informacja')).toBeInTheDocument();
    });

    it('calls onClose when X button is clicked', () => {
        const onClose = vi.fn();
        render(<Toast notification={{ type: 'success', message: 'OK' }} onClose={onClose} />);
        // Close button is the last button in the component
        const buttons = screen.getAllByRole('button');
        fireEvent.click(buttons[buttons.length - 1]);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('applies success border color class', () => {
        render(<Toast notification={{ type: 'success', message: 'OK' }} onClose={vi.fn()} />);
        const toast = document.querySelector('.fixed.bottom-6') as HTMLElement;
        expect(toast.className).toContain('border-emerald-500');
    });

    it('applies error border color class', () => {
        render(<Toast notification={{ type: 'error', message: 'ERR' }} onClose={vi.fn()} />);
        const toast = document.querySelector('.fixed.bottom-6') as HTMLElement;
        expect(toast.className).toContain('border-rose-500');
    });
});
