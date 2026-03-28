import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../../shared/ui/EmptyState';

describe('EmptyState', () => {
    it('renders title', () => {
        render(<EmptyState icon={<span />} title="Brak wyników" />);
        expect(screen.getByText('Brak wyników')).toBeInTheDocument();
    });

    it('renders description when provided', () => {
        render(
            <EmptyState
                icon={<span />}
                title="Brak danych"
                description="Nie znaleziono żadnych rekordów."
            />
        );
        expect(screen.getByText('Nie znaleziono żadnych rekordów.')).toBeInTheDocument();
    });

    it('does not render description when not provided', () => {
        render(<EmptyState icon={<span />} title="Tytuł" />);
        // Only title, no extra <p>
        const paragraphs = document.querySelectorAll('p');
        expect(paragraphs).toHaveLength(1);
    });

    it('renders action node when provided', () => {
        render(
            <EmptyState
                icon={<span />}
                title="Puste"
                action={<button>Dodaj rekord</button>}
            />
        );
        expect(screen.getByText('Dodaj rekord')).toBeInTheDocument();
    });

    it('renders icon node', () => {
        render(
            <EmptyState
                icon={<span data-testid="empty-icon">🗂</span>}
                title="Puste"
            />
        );
        expect(screen.getByTestId('empty-icon')).toBeInTheDocument();
    });

    it('applies additional className', () => {
        const { container } = render(
            <EmptyState icon={<span />} title="Test" className="my-custom" />
        );
        expect(container.firstChild).toHaveClass('my-custom');
    });
});
