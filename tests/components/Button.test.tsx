import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ButtonPrimary, ButtonSecondary, ButtonDanger } from '../../shared/ui/Button';

describe('Button Components', () => {
    describe('ButtonPrimary', () => {
        it('renders children', () => {
            render(<ButtonPrimary>Zapisz</ButtonPrimary>);
            expect(screen.getByText('Zapisz')).toBeInTheDocument();
        });

        it('calls onClick when clicked', () => {
            const onClick = vi.fn();
            render(<ButtonPrimary onClick={onClick}>Kliknij</ButtonPrimary>);
            fireEvent.click(screen.getByText('Kliknij'));
            expect(onClick).toHaveBeenCalledTimes(1);
        });

        it('is disabled when disabled prop is set', () => {
            render(<ButtonPrimary disabled>Zablokowany</ButtonPrimary>);
            expect(screen.getByText('Zablokowany').closest('button')).toBeDisabled();
        });

        it('renders icon alongside children', () => {
            render(<ButtonPrimary icon={<span data-testid="icon">►</span>}>Z ikoną</ButtonPrimary>);
            expect(screen.getByTestId('icon')).toBeInTheDocument();
            expect(screen.getByText('Z ikoną')).toBeInTheDocument();
        });

        it('applies fullWidth class when prop is set', () => {
            render(<ButtonPrimary fullWidth>Pełna szerokość</ButtonPrimary>);
            expect(screen.getByRole('button')).toHaveClass('w-full');
        });

        it('supports size sm, md, lg without crash', () => {
            const { rerender } = render(<ButtonPrimary size="sm">SM</ButtonPrimary>);
            expect(screen.getByText('SM')).toBeInTheDocument();
            rerender(<ButtonPrimary size="lg">LG</ButtonPrimary>);
            expect(screen.getByText('LG')).toBeInTheDocument();
        });
    });

    describe('ButtonSecondary', () => {
        it('renders and responds to click', () => {
            const onClick = vi.fn();
            render(<ButtonSecondary onClick={onClick}>Anuluj</ButtonSecondary>);
            fireEvent.click(screen.getByText('Anuluj'));
            expect(onClick).toHaveBeenCalledTimes(1);
        });
    });

    describe('ButtonDanger', () => {
        it('renders with danger styling class', () => {
            render(<ButtonDanger>Usuń</ButtonDanger>);
            const btn = screen.getByRole('button');
            expect(btn).toHaveTextContent('Usuń');
            // danger has text-[#d83b01]
            expect(btn.className).toContain('text-[#d83b01]');
        });
    });
});
