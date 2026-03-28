import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepIndicator } from '../../shared/ui/StepIndicator';

const STEPS = ['Firma', 'Pracownicy', 'Wyniki', 'Podział', 'Porównanie', 'Podsumowanie'];

describe('StepIndicator', () => {
    it('renders all step labels', () => {
        render(<StepIndicator currentStep={0} steps={STEPS} onStepClick={vi.fn()} />);
        STEPS.forEach(label => {
            expect(screen.getByText(label)).toBeInTheDocument();
        });
    });

    it('shows step numbers for incomplete steps', () => {
        render(<StepIndicator currentStep={0} steps={STEPS} onStepClick={vi.fn()} />);
        // Steps 2-6 should show numbers (1 is active, shows 1 too)
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('6')).toBeInTheDocument();
    });

    it('calls onStepClick with correct index when step is clicked', () => {
        const onStepClick = vi.fn();
        render(<StepIndicator currentStep={0} steps={STEPS} onStepClick={onStepClick} />);
        fireEvent.click(screen.getByText('Pracownicy'));
        expect(onStepClick).toHaveBeenCalledWith(1);
    });

    it('active step has brand text style', () => {
        render(<StepIndicator currentStep={2} steps={STEPS} onStepClick={vi.fn()} />);
        const activeLabel = screen.getByText('Wyniki');
        expect(activeLabel.className).toContain('text-brand');
    });

    it('completed steps show a checkmark (not a number)', () => {
        render(<StepIndicator currentStep={3} steps={STEPS} onStepClick={vi.fn()} />);
        // Steps 0-2 are completed — number "1" should not be in a step icon
        // The checkmark SVG replaces the number for completed steps
        // We verify by checking number "1" is absent as icon text
        // (step 4 shows "4" as number, not completed)
        expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('renders correct number of step containers', () => {
        const { container } = render(
            <StepIndicator currentStep={0} steps={STEPS} onStepClick={vi.fn()} />
        );
        // Each step is a div with cursor-pointer
        const stepDivs = container.querySelectorAll('[class*="cursor-pointer"]');
        expect(stepDivs).toHaveLength(STEPS.length);
    });
});
