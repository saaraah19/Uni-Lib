import { useEffect, useRef } from 'react';

/**
 * useModalA11y
 *
 * ACCESSIBILITY FIX (P2): none of the app's modals (ConfirmationModal,
 * LoanModal, BookDetail) implemented focus trapping, Escape-to-close, or
 * focus restoration. A keyboard user could tab out of an open modal into
 * the page content hidden behind the overlay, and there was no way to
 * dismiss a modal without a mouse.
 *
 * This hook is intentionally generic so every modal in the app can share
 * the same behavior instead of re-implementing it (or not implementing it
 * at all) independently.
 *
 * @param {Object} options
 * @param {boolean} options.isOpen - whether the modal is currently open
 * @param {Function} options.onClose - called when Escape is pressed
 * @returns {React.RefObject} ref to attach to the modal's outer container
 *
 * @example
 * const modalRef = useModalA11y({ isOpen, onClose });
 * return <div ref={modalRef} role="dialog" aria-modal="true">...</div>
 */
export const useModalA11y = ({ isOpen, onClose }) => {
  const containerRef = useRef(null);
  const previouslyFocusedElement = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    // Remember what had focus before the modal opened, so we can restore it.
    previouslyFocusedElement.current = document.activeElement;

    const container = containerRef.current;

    const getFocusableElements = () => {
      if (!container) return [];
      return Array.from(
        container.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null); // skip hidden elements
    };

    // Move focus into the modal on open (first focusable element, or the
    // container itself as a fallback so Escape/keyboard still works).
    const focusables = getFocusableElements();
    if (focusables.length > 0) {
      focusables[0].focus();
    } else if (container) {
      container.setAttribute('tabindex', '-1');
      container.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to whatever triggered the modal.
      if (previouslyFocusedElement.current?.focus) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  return containerRef;
};

export default useModalA11y;
