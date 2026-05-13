"use client";

import { useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";

export type FilterSelectOption = {
  value: string;
  label: string;
};

type FilterSelectProps = {
  value: string;
  ariaLabel: string;
  placeholder: string;
  options: FilterSelectOption[];
  onChange: (value: string) => void;
  className?: string;
};

export function FilterSelect({
  value,
  ariaLabel,
  placeholder,
  options,
  onChange,
  className,
}: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);
  const buttonLabel = selectedOption?.value ? selectedOption.label : placeholder;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  function handleSelect(nextValue: string) {
    onChange(nextValue);
    setIsOpen(false);
  }

  return (
    <div ref={rootRef} className={clsx("relative", className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={selectId}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="flex h-10 w-full cursor-pointer items-center justify-between gap-3 rounded-full border border-transparent bg-white px-5 text-left text-sm text-[#262626] outline-none transition hover:border-[#8456F0] focus-visible:border-[#8456F0]"
      >
        <span className="truncate">{buttonLabel}</span>
        <span
          aria-hidden="true"
          className={clsx(
            "h-2 w-2 shrink-0 rotate-45 border-r-2 border-b-2 border-[#262626] transition-transform",
            isOpen ? "translate-y-0.5 rotate-[225deg]" : "-translate-y-0.5"
          )}
        />
      </button>

      {isOpen ? (
        <div
          id={selectId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute top-[calc(100%+8px)] left-0 z-20 w-full min-w-40 overflow-hidden rounded-[12px] bg-white py-2 shadow-[0_8px_22px_rgba(38,38,38,0.22)]"
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.label}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                className={clsx(
                  "block w-full cursor-pointer px-4 py-1.5 text-left text-sm leading-5 transition hover:bg-[#F4EEFF] hover:text-[#8456F0]",
                  isSelected ? "text-[#8456F0]" : "text-[#8E8E8E]"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
