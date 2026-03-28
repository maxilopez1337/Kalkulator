import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KpiCard } from '../../shared/ui/KpiCard';

describe('KpiCard', () => {
    it('renders label and value', () => {
        render(<KpiCard label="Koszt łączny" value="12 500 zł" />);
        expect(screen.getByText('Koszt łączny')).toBeInTheDocument();
        expect(screen.getByText('12 500 zł')).toBeInTheDocument();
    });

    it('renders icon when provided', () => {
        render(
            <KpiCard
                label="Etykieta"
                value="0 zł"
                icon={<span data-testid="kpi-icon">💰</span>}
            />
        );
        expect(screen.getByTestId('kpi-icon')).toBeInTheDocument();
    });

    it('renders delta badge when delta is non-zero', () => {
        render(
            <KpiCard
                label="Oszczędność"
                value="5 000 zł"
                delta={-1200}
                deltaLabel="vs. Standard"
            />
        );
        expect(screen.getByText('vs. Standard')).toBeInTheDocument();
        // Arrow down for negative delta
        expect(screen.getByText('↓')).toBeInTheDocument();
    });

    it('shows up-arrow for positive delta', () => {
        render(<KpiCard label="Wzrost" value="+" delta={500} />);
        expect(screen.getByText('↑')).toBeInTheDocument();
    });

    it('does not render delta badge when delta is zero', () => {
        const { container } = render(<KpiCard label="Zerowy" value="0" delta={0} />);
        expect(container.querySelector('.inline-flex')).not.toBeInTheDocument();
    });

    it('does not render delta badge when delta is undefined', () => {
        const { container } = render(<KpiCard label="Brak" value="0" />);
        expect(container.querySelector('.inline-flex')).not.toBeInTheDocument();
    });

    it('applies dark variant bg class', () => {
        const { container } = render(
            <KpiCard label="Dark" value="99" variant="dark" />
        );
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toContain('bg-[#001433]');
    });

    it('applies light variant bg-white class (default)', () => {
        const { container } = render(<KpiCard label="Light" value="99" />);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toContain('bg-white');
    });

    it('renders accent bar when accent prop provided', () => {
        const { container } = render(
            <KpiCard label="Akcent" value="X" accent="bg-blue-500" />
        );
        const accentBar = container.querySelector('.absolute.left-0') as HTMLElement;
        expect(accentBar).toBeInTheDocument();
        expect(accentBar.className).toContain('bg-blue-500');
    });
});
