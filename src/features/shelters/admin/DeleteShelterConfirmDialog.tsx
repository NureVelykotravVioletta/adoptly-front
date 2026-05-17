"use client";

import { useCallback, useState, useTransition } from "react";
import { Button } from "@/src/components/common/Button";
import { LoadingOverlay } from "@/src/components/common/LoadingOverlay";
import { ModalDialog } from "@/src/components/common/ModalDialog";
import { deleteShelterAction } from "@/src/features/shelters/shelters.action";
import type { Shelter } from "@/src/features/shelters/shelters.api";

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

  if (!shelter) {
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

  return (
    <ModalDialog
      isOpen={isOpen}
      titleId="delete-shelter-title"
      closeDisabled={isPending}
      onClose={closeDialog}
      className="max-w-[420px] rounded-[28px] px-7 pt-14 pb-8 text-center"
    >
      <h2 id="delete-shelter-title" className="text-xl font-bold">
        Видалити притулок?
      </h2>

      <p className="mt-3 text-sm leading-6 text-[#5F5F5F]">
        Притулок «{shelter.name}» буде видалено. Цю дію не можна скасувати.
      </p>

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      <div className="mt-7 grid grid-cols-2 gap-2">
        <Button variant="danger" disabled={isPending} onClick={handleDelete}>
          {isPending ? "Видаляємо..." : "Видалити"}
        </Button>
        <Button variant="neutral" disabled={isPending} onClick={closeDialog}>
          Скасувати
        </Button>
      </div>

      {isPending ? <LoadingOverlay label="Видалення притулку" /> : null}
    </ModalDialog>
  );
}
