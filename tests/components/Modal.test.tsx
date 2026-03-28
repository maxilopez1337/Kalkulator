import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../../shared/ui/Modal';

describe('Modal', () => {
    it('renders nothing when isOpen=false', () => {
        const { container } = render(
            <Modal isOpen={false} onClose={vi.fn()}>
                <p>Ukryta treść</p>
            </Modal>
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('renders children when isOpen=true', () => {
        render(
            <Modal isOpen={true} onClose={vi.fn()}>
                <p>Widoczna treść</p>
            </Modal>
        );
        expect(screen.getByText('Widoczna treść')).toBeInTheDocument();
    });

    it('calls onClose when backdrop is clicked', () => {
        const onClose = vi.fn();
        render(
            <Modal isOpen={true} onClose={onClose}>
                <p>Treść</p>
            </Modal>
        );
        // Click on the backdrop (outer div)
        const backdrop = document.querySelector('.fixed.inset-0') as HTMLElement;
        fireEvent.click(backdrop);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does NOT call onClose when content panel is clicked', () => {
        const onClose = vi.fn();
        render(
            <Modal isOpen={true} onClose={onClose}>
                <p>Treść panelu</p>
            </Modal>
        );
        fireEvent.click(screen.getByText('Treść panelu'));
        expect(onClose).not.toHaveBeenCalled();
    });

    it('renders in size=small mode (centred layout)', () => {
        render(
            <Modal isOpen={true} onClose={vi.fn()} size="small">
                <p>Small modal</p>
            </Modal>
        );
        const panel = document.querySelector('[role="dialog"]') as HTMLElement;
        expect(panel).toBeInTheDocument();
        expect(screen.getByText('Small modal')).toBeInTheDocument();
    });

    it('applies custom maxWidth class', () => {
        render(
            <Modal isOpen={true} onClose={vi.fn()} size="small" maxWidth="max-w-xl">
                <p>Custom width</p>
            </Modal>
        );
        const panel = document.querySelector('[role="dialog"]') as HTMLElement;
        expect(panel.className).toContain('max-w-xl');
    });

    it('panel has aria-modal=true for accessibility', () => {
        render(
            <Modal isOpen={true} onClose={vi.fn()}>
                <p>Aria test</p>
            </Modal>
        );
        expect(document.querySelector('[aria-modal="true"]')).toBeInTheDocument();
    });
});
