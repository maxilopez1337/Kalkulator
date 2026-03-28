import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionCard } from '../../shared/ui/ActionCard';

describe('ActionCard', () => {
    it('renders title', () => {
        render(
            <ActionCard
                onClick={vi.fn()}
                icon={<span />}
                iconClass="bg-blue-50 text-blue-600"
                title="Import Excel"
            />
        );
        expect(screen.getByText('Import Excel')).toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
        render(
            <ActionCard
                onClick={vi.fn()}
                icon={<span />}
                iconClass=""
                title="Import"
                subtitle="Wczytaj dane z pliku"
            />
        );
        expect(screen.getByText('Wczytaj dane z pliku')).toBeInTheDocument();
    });

    it('calls onClick when button is clicked', () => {
        const onClick = vi.fn();
        render(
            <ActionCard
                onClick={onClick}
                icon={<span />}
                iconClass=""
                title="Akcja"
            />
        );
        fireEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('renders the icon node', () => {
        render(
            <ActionCard
                onClick={vi.fn()}
                icon={<span data-testid="card-icon">📁</span>}
                iconClass=""
                title="Z ikoną"
            />
        );
        expect(screen.getByTestId('card-icon')).toBeInTheDocument();
    });

    it('applies hoverBorderClass to the button', () => {
        render(
            <ActionCard
                onClick={vi.fn()}
                icon={<span />}
                iconClass=""
                title="Test"
                hoverBorderClass="hover:border-purple-400"
            />
        );
        expect(screen.getByRole('button').className).toContain('hover:border-purple-400');
    });
});
