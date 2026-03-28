import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from '../../shared/ui/Avatar';

describe('Avatar', () => {
    it('renders initials from name and surname', () => {
        render(<Avatar name="Jan" surname="Kowalski" />);
        expect(screen.getByText('JK')).toBeInTheDocument();
    });

    it('renders uppercase initials', () => {
        render(<Avatar name="anna" surname="nowak" />);
        expect(screen.getByText('AN')).toBeInTheDocument();
    });

    it('renders "?" when name and surname are empty strings', () => {
        render(<Avatar name="" surname="" />);
        expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('applies custom colorClass when provided', () => {
        render(<Avatar name="Jan" surname="Kowalski" colorClass="bg-red-500 text-white" />);
        const el = screen.getByText('JK');
        expect(el.className).toContain('bg-red-500');
    });

    it('uses deterministic auto-color based on name length', () => {
        // Two renders with same name should produce same color class
        const { container: c1 } = render(<Avatar name="Jan" surname="Kowalski" />);
        const { container: c2 } = render(<Avatar name="Jan" surname="Kowalski" />);
        expect((c1.firstChild as HTMLElement)?.className).toBe((c2.firstChild as HTMLElement)?.className);
    });

    it('applies extra className', () => {
        render(<Avatar name="Jan" surname="X" className="w-20 h-20" />);
        const el = screen.getByText('JX');
        expect(el.className).toContain('w-20');
    });
});
