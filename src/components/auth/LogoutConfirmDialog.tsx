"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal, useFormStatus } from "react-dom";
import Image from "next/image";
import { LoadingOverlay } from "@/src/components/common/LoadingOverlay";
import { logoutAction } from "@/src/features/auth/auth.action";
import CloseIcon from "@/src/assets/icons/CloseIcon.svg";
import catImage from "@/src/assets/images/Cat.png";

type LogoutConfirmDialogProps = {
  triggerClassName?: string;
  triggerWrapperClassName?: string;
};

export function LogoutConfirmDialog({
  triggerClassName,
  triggerWrapperClassName,
}: LogoutConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

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

  return (
    <>
      <div className={triggerWrapperClassName}>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={triggerClassName}
        >
          Вийти
        </button>
      </div>

      {isOpen && typeof document !== "undefined"
        ? createPortal(
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
                aria-labelledby="logout-confirm-title"
                className="relative w-full max-w-[356px] rounded-[24px] bg-white px-8 pt-16 pb-10 text-center text-[#262626] shadow-[0_24px_80px_rgba(38,38,38,0.16)] sm:max-w-[420px]"
              >
                <button
                  type="button"
                  aria-label="Закрити"
                  onClick={closeDialog}
                  className="absolute top-4 right-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition hover:bg-[#F4EEFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
                >
                  <CloseIcon className="h-5 w-5 text-[#262626]" />
                </button>

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#DACAFF]">
                  <Image
                    src={catImage}
                    alt=""
                    width={44}
                    height={44}
                    className="h-11 w-11 object-contain"
                    aria-hidden
                  />
                </div>

                <h2
                  id="logout-confirm-title"
                  className="mt-5 text-xl font-bold"
                >
                  Хочете вийти з акаунту?
                </h2>

                <div className="mt-6 grid grid-cols-2 gap-2">
                  <form action={logoutAction}>
                    <LogoutSubmitButton />
                  </form>
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="h-12 cursor-pointer rounded-full bg-[#F4F4F4] text-sm font-semibold text-[#262626] transition hover:bg-[#E8E8E8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
                  >
                    Закрити
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

function LogoutSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <>
      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full cursor-pointer rounded-full bg-[#8456F0] text-sm font-semibold text-white transition hover:bg-[#7045D1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0] disabled:cursor-wait disabled:bg-[#DACAFF] disabled:text-[#8456F0]"
      >
        {pending ? "Вихід..." : "Так"}
      </button>
      {pending ? <LoadingOverlay label="Вихід з акаунта" /> : null}
    </>
  );
}
