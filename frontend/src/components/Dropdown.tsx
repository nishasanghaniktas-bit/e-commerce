import React, { useState, useRef, useEffect } from 'react';

/**
 * A flexible, headless dropdown component that manages open/close state.
 * Supports both a standard label/options pattern and a headless trigger/children pattern.
 */
interface DropdownProps {
  className?: string;
  trigger?: (props: { open: boolean; setOpen: (open: boolean) => void }) => React.ReactNode;
  children?: ((props: { open: boolean; close: () => void }) => React.ReactNode) | React.ReactNode;
  
  // Backwards compatibility for the "Select" style usage (if needed)
  label?: string;
  options?: Array<{ label: string; value: string; icon?: React.ReactNode }>;
  onSelect?: (value: string) => void;
  selected?: string;
}

export default function Dropdown({
  className,
  trigger,
  children,
  label,
  options,
  onSelect,
  selected
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        close();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // If this is the headless usage (as seen in Navbar.jsx)
  if (trigger) {
    return (
      <div className={`relative ${className || ''}`} ref={containerRef}>
        <div onClick={() => setOpen(!open)} className="cursor-pointer">
          {trigger({ open, setOpen })}
        </div>
        {typeof children === 'function' ? children({ open, close }) : children}
      </div>
    );
  }

  // Fallback/Compatibility for Select-style usage (though not currently used in the project)
  // This part is preserved just in case there are hidden usages or it was partially implemented.
  const selectedLabel = options?.find((opt) => opt.value === selected)?.label || label;

  return (
    <div className={`relative inline-block ${className || ''}`} ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 transition-all"
      >
        {selectedLabel}
        <span className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-[1000] overflow-hidden">
          {options?.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onSelect?.(option.value);
                close();
              }}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${selected === option.value ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'}`}
            >
              <div className="flex items-center gap-2">
                {option.icon}
                {option.label}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
