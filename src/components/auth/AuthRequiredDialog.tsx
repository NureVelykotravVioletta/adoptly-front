"use client";

import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import CloseIcon from "@/src/assets/icons/CloseIcon.svg";

type AuthRequiredDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
};

export function AuthRequiredDialog({
  isOpen,
  onClose,
  title = "Створіть акаунт, щоб продовжити",
  description = "Після реєстрації ви зможете додавати тварин в обране та подавати заявки на адопцію.",
}: AuthRequiredDialogProps) {
  const closeDialog = useCallback(() => {
    onClose();
  }, [onClose]);

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
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-required-title"
        aria-describedby="auth-required-description"
        className="relative w-full max-w-[420px] rounded-[28px] bg-white px-6 pt-14 pb-7 text-center text-[#262626] shadow-[0_24px_80px_rgba(38,38,38,0.16)] sm:px-9 sm:pt-16 sm:pb-9"
      >
        <button
          type="button"
          aria-label="Закрити"
          onClick={closeDialog}
          className="absolute top-4 right-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition hover:bg-[#F4EEFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
        >
          <CloseIcon className="h-5 w-5 text-[#262626]" />
        </button>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DACAFF] text-3xl text-[#8456F0]">
          ♥
        </div>

        <h2 id="auth-required-title" className="mt-5 text-xl font-bold">
          {title}
        </h2>

        <p
          id="auth-required-description"
          className="mt-3 text-sm leading-6 text-[#5F5F5F]"
        >
          {description}
        </p>

        <div className="mt-7 grid gap-2 sm:grid-cols-2">
          <Link
            href="/register"
            className="flex h-12 items-center justify-center rounded-full bg-[#8456F0] px-5 text-sm font-semibold text-white transition hover:bg-[#7045D1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
          >
            Зареєструватися
          </Link>
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-full bg-[#F4F4F4] px-5 text-sm font-semibold text-[#262626] transition hover:bg-[#E8E8E8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
          >
            Увійти
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
