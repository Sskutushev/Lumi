// src/components/common/A11yFocusWrapper.tsx
import React, { useEffect, useRef } from 'react';
import { focusTrap, focusFirstElement } from '../../lib/accessibility/A11yUtils';

interface A11yFocusWrapperProps {
  children: React.ReactNode;
  autoFocus?: boolean;
  focusTrap?: boolean;
  onClose?: () => void;
  returnFocusTo?: HTMLElement;
}

const A11yFocusWrapper: React.FC<A11yFocusWrapperProps> = ({
  children,
  autoFocus = false,
  focusTrap: enableFocusTrap = false,
  onClose,
  returnFocusTo,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus && wrapperRef.current) {
      focusFirstElement(wrapperRef);
    }
  }, [autoFocus]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (enableFocusTrap && wrapperRef.current) {
      cleanup = focusTrap(wrapperRef, returnFocusTo);
    }

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [enableFocusTrap, returnFocusTo]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div ref={wrapperRef} role="dialog" aria-modal="true" tabIndex={-1}>
      {children}
    </div>
  );
};

export default A11yFocusWrapper;
