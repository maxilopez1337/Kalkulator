import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchInput } from '../../shared/ui/SearchInput';

describe('SearchInput', () => {
    it('renders with placeholder text', () => {
        render(<SearchInput value="" onChange={vi.fn()} placeholder="Szukaj pracownika..." />);
        expect(screen.getByPlaceholderText('Szukaj pracownika...')).toBeInTheDocument();
    });

    it('displays current value', () => {
        render(<SearchInput value="Kowalski" onChange={vi.fn()} />);
        expect(screen.getByDisplayValue('Kowalski')).toBeInTheDocument();
    });

    it('calls onChange when user types', () => {
        const onChange = vi.fn();
        render(<SearchInput value="" onChange={onChange} />);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Jan' } });
        expect(onChange).toHaveBeenCalledWith('Jan');
    });

    it('shows clear button when value is non-empty', () => {
        render(<SearchInput value="cokolwiek" onChange={vi.fn()} />);
        expect(screen.getByLabelText('Wyczyść')).toBeInTheDocument();
    });

    it('hides clear button when value is empty', () => {
        render(<SearchInput value="" onChange={vi.fn()} />);
        expect(screen.queryByLabelText('Wyczyść')).not.toBeInTheDocument();
    });

    it('calls onChange with empty string when clear button clicked', () => {
        const onChange = vi.fn();
        render(<SearchInput value="test" onChange={onChange} />);
        fireEvent.click(screen.getByLabelText('Wyczyść'));
        expect(onChange).toHaveBeenCalledWith('');
    });

    it('uses default placeholder when none provided', () => {
        render(<SearchInput value="" onChange={vi.fn()} />);
        expect(screen.getByPlaceholderText('Szukaj...')).toBeInTheDocument();
    });
});
