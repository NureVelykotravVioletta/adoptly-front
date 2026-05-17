"use client";

import { useCallback, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import CloseIcon from "@/src/assets/icons/CloseIcon.svg";

type ModalDialogProps = {
  isOpen: boolean;
  titleId: string;
  onClose: () => void;
  children: ReactNode;
  as?: "div" | "form";
  className?: string;
  closeDisabled?: boolean;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function ModalDialog({
  isOpen,
  titleId,
  onClose,
  children,
  as = "div",
  className,
  closeDisabled = false,
  onSubmit,
}: ModalDialogProps) {
  const closeDialog = useCallback(() => {
    if (!closeDisabled) {
      onClose();
    }
  }, [closeDisabled, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDialog();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeDialog, isOpen]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  const contentClassName = clsx(
    "relative w-full bg-white text-[#262626] shadow-[0_24px_80px_rgba(38,38,38,0.16)]",
    className
  );
  const closeButton = (
    <button
      type="button"
      aria-label="Закрити"
      disabled={closeDisabled}
      onClick={closeDialog}
      className="absolute top-5 right-5 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition hover:bg-[#F4EEFF] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
    >
      <CloseIcon className="h-6 w-6 text-[#262626]" />
    </button>
  );
  const content =
    as === "form" ? (
      <form
        className={contentClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={onSubmit}
      >
        {closeButton}
        {children}
      </form>
    ) : (
      <div
        className={contentClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {closeButton}
        {children}
      </div>
    );

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex min-h-screen w-screen items-center justify-center bg-black/30 px-5 py-8 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeDialog();
        }
      }}
    >
      {content}
    </div>,
    document.body
  );
}
