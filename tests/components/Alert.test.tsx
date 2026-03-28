import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert } from '../../shared/ui/Alert';

describe('Alert', () => {
    it('renders children text', () => {
        render(<Alert>To jest komunikat</Alert>);
        expect(screen.getByText('To jest komunikat')).toBeInTheDocument();
    });

    it('renders icon when provided', () => {
        render(
            <Alert icon={<span data-testid="alert-icon">!</span>}>
                Treść
            </Alert>
        );
        expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
    });

    it('applies info variant styles by default (bg-[#f3f2f1])', () => {
        const { container } = render(<Alert>Info</Alert>);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toContain('bg-[#f3f2f1]');
        expect(wrapper.className).toContain('border-[#edebe9]');
    });

    it('applies warning variant styles', () => {
        const { container } = render(<Alert variant="warning">Ostrzeżenie</Alert>);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toContain('bg-[#fff4ce]');
    });

    it('applies success variant styles', () => {
        const { container } = render(<Alert variant="success">Sukces</Alert>);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toContain('bg-[#dff6dd]');
    });

    it('applies warning-amber variant', () => {
        const { container } = render(<Alert variant="warning-amber">Amber</Alert>);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toContain('bg-amber-50');
    });

    it('applies custom padding prop', () => {
        const { container } = render(<Alert padding="p-2">Padded</Alert>);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toContain('p-2');
    });

    it('applies extra className', () => {
        const { container } = render(<Alert className="my-custom-class">Extra</Alert>);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toContain('my-custom-class');
    });
});
