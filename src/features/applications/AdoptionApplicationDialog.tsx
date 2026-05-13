"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { LoadingOverlay } from "@/src/components/common/LoadingOverlay";
import { submitAdoptionApplicationAction } from "@/src/features/applications/adoption-applications.action";
import CloseIcon from "@/src/assets/icons/CloseIcon.svg";

type AdoptionApplicationDialogProps = {
  animalId: string;
  animalName: string;
  disabled?: boolean;
};

export function AdoptionApplicationDialog({
  animalId,
  animalName,
  disabled = false,
}: AdoptionApplicationDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const closeDialog = useCallback(() => {
    if (isPending) {
      return;
    }

    setIsOpen(false);
  }, [isPending]);

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

  const openDialog = () => {
    if (disabled) {
      return;
    }

    setMessage("");
    setError(null);
    setIsOpen(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isPending) {
      return;
    }

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await submitAdoptionApplicationAction(formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      setIsOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        disabled={disabled}
        className="w-full max-w-60 cursor-pointer rounded-full bg-[#8456F0] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#7045D1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0] disabled:cursor-not-allowed disabled:bg-[#DACAFF] disabled:text-[#8456F0] disabled:opacity-70"
      >
        {disabled ? "Заявку подано" : "Подати заявку"}
      </button>

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
              <form
                className="relative w-full max-w-[560px] rounded-[34px] bg-white px-6 pt-15 pb-9 text-[#262626] shadow-[0_24px_80px_rgba(38,38,38,0.16)] sm:rounded-[36px] sm:px-12 sm:pt-16 sm:pb-12"
                role="dialog"
                aria-modal="true"
                aria-labelledby="adoption-application-title"
                onSubmit={handleSubmit}
              >
                <button
                  type="button"
                  aria-label="Закрити"
                  onClick={closeDialog}
                  className="absolute top-5 right-5 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition hover:bg-[#F4EEFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
                >
                  <CloseIcon className="h-6 w-6 text-[#262626]" />
                </button>

                <h2
                  id="adoption-application-title"
                  className="text-2xl leading-8 font-bold"
                >
                  Подати заявку
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#5F5F5F]">
                  Заявка на адопцію тварини {animalName}. За бажанням додайте
                  коротке повідомлення для притулку.
                </p>

                <input type="hidden" name="animalId" value={animalId} />

                <label className="mt-7 block">
                  <span className="mb-2 block text-sm font-semibold">
                    Повідомлення
                  </span>
                  <textarea
                    name="message"
                    value={message}
                    maxLength={1000}
                    placeholder="Напишіть кілька слів про себе"
                    onChange={(event) => {
                      setMessage(event.target.value);
                      setError(null);
                    }}
                    className="min-h-35 w-full resize-none rounded-3xl border border-transparent bg-[#F7F7F7] px-5 py-4 text-base leading-6 outline-none transition placeholder:text-[#8E8E8E] focus:border-[#8456F0] focus:bg-white"
                  />
                </label>

                {error ? (
                  <p className="mt-4 text-sm text-rose-600">{error}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={isPending}
                  className="mt-8 h-14 w-full cursor-pointer rounded-full bg-[#8456F0] text-base font-semibold text-white transition hover:bg-[#7045D1] disabled:cursor-not-allowed disabled:bg-[#DACAFF] disabled:text-[#8456F0] disabled:opacity-60"
                >
                  {isPending ? "Подаємо заявку..." : "Подати заявку"}
                </button>

                {isPending ? <LoadingOverlay label="Подача заявки" /> : null}
              </form>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
