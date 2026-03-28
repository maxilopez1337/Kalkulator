import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SaveSuccessModal } from '../../features/modals/SaveSuccessModal';

describe('SaveSuccessModal', () => {
    it('renders nothing when isOpen=false', () => {
        const { container } = render(
            <SaveSuccessModal isOpen={false} onClose={vi.fn()} onExit={vi.fn()} />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('renders success heading when open', () => {
        render(<SaveSuccessModal isOpen={true} onClose={vi.fn()} onExit={vi.fn()} />);
        expect(screen.getByText('Zapisano pomyślnie!')).toBeInTheDocument();
    });

    it('renders "Zostań tutaj" and "Zakończ analizę" buttons', () => {
        render(<SaveSuccessModal isOpen={true} onClose={vi.fn()} onExit={vi.fn()} />);
        expect(screen.getByText('Zostań tutaj')).toBeInTheDocument();
        expect(screen.getByText('Zakończ analizę')).toBeInTheDocument();
    });

    it('calls onClose when "Zostań tutaj" is clicked', () => {
        const onClose = vi.fn();
        render(<SaveSuccessModal isOpen={true} onClose={onClose} onExit={vi.fn()} />);
        fireEvent.click(screen.getByText('Zostań tutaj').closest('button')!);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onExit when "Zakończ analizę" is clicked', () => {
        const onExit = vi.fn();
        render(<SaveSuccessModal isOpen={true} onClose={vi.fn()} onExit={onExit} />);
        fireEvent.click(screen.getByText('Zakończ analizę').closest('button')!);
        expect(onExit).toHaveBeenCalledTimes(1);
    });

    it('shows download button when onDownload prop is provided', () => {
        render(
            <SaveSuccessModal
                isOpen={true}
                onClose={vi.fn()}
                onExit={vi.fn()}
                onDownload={vi.fn()}
            />
        );
        expect(screen.getByText('Pobierz plik bazy (.json)')).toBeInTheDocument();
    });

    it('does not show download button when onDownload is not provided', () => {
        render(<SaveSuccessModal isOpen={true} onClose={vi.fn()} onExit={vi.fn()} />);
        expect(screen.queryByText('Pobierz plik bazy (.json)')).not.toBeInTheDocument();
    });

    it('calls onDownload when download button is clicked', () => {
        const onDownload = vi.fn();
        render(
            <SaveSuccessModal
                isOpen={true}
                onClose={vi.fn()}
                onExit={vi.fn()}
                onDownload={onDownload}
            />
        );
        fireEvent.click(screen.getByText('Pobierz plik bazy (.json)').closest('button')!);
        expect(onDownload).toHaveBeenCalledTimes(1);
    });
});
