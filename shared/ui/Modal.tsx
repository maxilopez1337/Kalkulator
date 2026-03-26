import React, { useEffect } from 'react';
import { radius, shadow } from '../config/theme';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /**
   * 'full'  → mobile: 100dvh, bottom sheet; desktop: centred with md:rounded-xl
   * 'small' → centred on all screens, fixed max-w, rounded-2xl (SaveSuccess style)
   */
  size?: 'full' | 'small';
  maxWidth?: string;   // e.g. 'md:max-w-5xl', 'md:max-w-6xl', 'max-w-[1400px]'
  height?: string;     // desktop height, e.g. 'md:h-[90vh]', 'md:h-[85vh]'
  /** background of the panel, default bg-white */
  panelBg?: string;
  /** z-index class, default z-50; use z-[100] for highest-priority modals */
  zIndex?: string;
}

/**
 * Ujednolicony Modal wrapper.
 * Zarządza: backdrop, click-outside, scroll-lock, mobile full-screen, radius, animacja.
 */
export const Modal = ({
  isOpen,
  onClose,
  children,
  size = 'full',
  maxWidth = 'md:max-w-2xl',
  height = 'md:h-[85vh]',
  panelBg = 'bg-white',
  zIndex = 'z-50',
}: ModalProps) => {
  // Scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  if (size === 'small') {
    return (
      <div
        className={`fixed inset-0 bg-slate-900/60 flex items-center justify-center ${zIndex} p-4 backdrop-blur-sm animate-in fade-in duration-200`}
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          className={`${panelBg} ${maxWidth} w-full ${radius.card} ${shadow.elevation16} overflow-hidden animate-in zoom-in-95 duration-200`}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    );
  }

  // size === 'full' (default) — bottom sheet on mobile, centred on desktop
  return (
    <div
      className={`fixed inset-0 bg-slate-900/60 flex items-end md:items-center justify-center ${zIndex} p-0 md:p-4 backdrop-blur-sm transition-opacity`}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`${panelBg} w-full ${maxWidth} h-[100dvh] ${height} flex flex-col ${shadow.elevation16} overflow-hidden rounded-none md:${radius.card}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
