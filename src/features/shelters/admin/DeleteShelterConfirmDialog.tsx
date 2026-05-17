"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { LoadingOverlay } from "@/src/components/common/LoadingOverlay";
import { deleteShelterAction } from "@/src/features/shelters/shelters.action";
import type { Shelter } from "@/src/features/shelters/shelters.api";
import CloseIcon from "@/src/assets/icons/CloseIcon.svg";

type DeleteShelterConfirmDialogProps = {
  shelter: Shelter | null;
  onClose: () => void;
  onDeleted: (shelterId: string) => void;
};

export function DeleteShelterConfirmDialog({
  shelter,
  onClose,
  onDeleted,
}: DeleteShelterConfirmDialogProps) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const isOpen = Boolean(shelter);

  const closeDialog = useCallback(() => {
    if (isPending) {
      return;
    }

    setError("");
    onClose();
  }, [isPending, onClose]);

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

  if (!shelter || typeof document === "undefined") {
    return null;
  }

  function handleDelete() {
    if (!shelter || isPending) {
      return;
    }

    setError("");

    startTransition(async () => {
      const result = await deleteShelterAction(shelter.id);

      if (result.error) {
        setError(result.error);
        return;
      }

      onDeleted(shelter.id);
    });
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
        aria-labelledby="delete-shelter-title"
        className="relative w-full max-w-[420px] rounded-[28px] bg-white px-7 pt-14 pb-8 text-center text-[#262626] shadow-[0_24px_80px_rgba(38,38,38,0.16)]"
      >
        <button
          type="button"
          aria-label="Закрити"
          onClick={closeDialog}
          className="absolute top-4 right-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition hover:bg-[#F4EEFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
        >
          <CloseIcon className="h-5 w-5 text-[#262626]" />
        </button>

        <h2 id="delete-shelter-title" className="text-xl font-bold">
          Видалити притулок?
        </h2>

        <p className="mt-3 text-sm leading-6 text-[#5F5F5F]">
          Притулок «{shelter.name}» буде видалено. Цю дію не можна скасувати.
        </p>

        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

        <div className="mt-7 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={handleDelete}
            className="h-12 cursor-pointer rounded-full bg-[#E22F2F] text-sm font-semibold text-white transition hover:bg-[#C92424] disabled:cursor-wait disabled:bg-[#FFDADA] disabled:text-[#E22F2F]"
          >
            {isPending ? "Видаляємо..." : "Видалити"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={closeDialog}
            className="h-12 cursor-pointer rounded-full bg-[#F4F4F4] text-sm font-semibold text-[#262626] transition hover:bg-[#E8E8E8] disabled:cursor-wait disabled:opacity-70"
          >
            Скасувати
          </button>
        </div>

        {isPending ? <LoadingOverlay label="Видалення притулку" /> : null}
      </div>
    </div>,
    document.body
  );
}
