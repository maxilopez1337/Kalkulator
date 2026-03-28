import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionLabel } from '../../shared/ui/SectionLabel';

describe('SectionLabel', () => {
    it('renders children text', () => {
        render(<SectionLabel>Koszt pracodawcy</SectionLabel>);
        expect(screen.getByText('Koszt pracodawcy')).toBeInTheDocument();
    });

    it('uses default color text-[#a19f9d]', () => {
        const { container } = render(<SectionLabel>Etykieta</SectionLabel>);
        const el = container.firstChild as HTMLElement;
        expect(el.className).toContain('text-[#a19f9d]');
    });

    it('applies custom color class', () => {
        const { container } = render(
            <SectionLabel color="text-blue-700">Niebieska</SectionLabel>
        );
        const el = container.firstChild as HTMLElement;
        expect(el.className).toContain('text-blue-700');
    });

    it('applies extra className', () => {
        const { container } = render(
            <SectionLabel className="mb-3">Z marginesem</SectionLabel>
        );
        const el = container.firstChild as HTMLElement;
        expect(el.className).toContain('mb-3');
    });

    it('is uppercase and bold by default', () => {
        const { container } = render(<SectionLabel>Test</SectionLabel>);
        const el = container.firstChild as HTMLElement;
        expect(el.className).toContain('uppercase');
        expect(el.className).toContain('font-bold');
    });
});
