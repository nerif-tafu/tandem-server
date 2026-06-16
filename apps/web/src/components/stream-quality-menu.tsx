import { useEffect, useRef, useState } from 'react';

import { VIEWER_RESOLUTION_DIMENSIONS, type ViewerResolution } from '@tandem/shared';

import { cn } from '../lib/cn';

interface StreamQualityMenuProps {
  value: ViewerResolution;
  options: readonly ViewerResolution[];
  onChange: (resolution: ViewerResolution) => void;
  variant?: 'toolbar' | 'overlay';
}

export function StreamQualityMenu({
  value,
  options,
  onChange,
  variant = 'toolbar',
}: StreamQualityMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isToolbar = variant === 'toolbar';

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: PointerEvent): void {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  function selectResolution(option: ViewerResolution): void {
    onChange(option);
    setOpen(false);
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label={`Stream quality: ${VIEWER_RESOLUTION_DIMENSIONS[value].label}`}
        aria-expanded={open}
        aria-haspopup="menu"
        title={`Stream quality: ${VIEWER_RESOLUTION_DIMENSIONS[value].label}`}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors',
          isToolbar
            ? 'border-border bg-background text-foreground hover:bg-muted'
            : 'border-white/20 bg-black/50 text-white/90 shadow-sm backdrop-blur-sm hover:bg-black/65',
        )}
        onClick={() => setOpen((current) => !current)}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.77 1.05 1.41 1.13H21a2 2 0 1 1 0 4h-.09c-.64.08-1.15.53-1.41 1.13Z"
          />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-20 mt-2 w-44 rounded-xl border border-border bg-card p-2 shadow-lg"
          role="menu"
          aria-label="Stream quality"
        >
          <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Stream quality</p>
          {options.map((option) => {
            const selected = option === value;

            return (
              <button
                key={option}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                className={cn(
                  'flex w-full rounded-lg px-2 py-2 text-left text-sm transition-colors',
                  selected
                    ? 'bg-accent/10 font-medium text-accent'
                    : 'text-foreground hover:bg-muted',
                )}
                onClick={() => selectResolution(option)}
              >
                {VIEWER_RESOLUTION_DIMENSIONS[option].label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
