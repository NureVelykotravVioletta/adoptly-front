"use client";

import { useCallback } from "react";
import { Button } from "@/src/components/common/Button";
import { LoadingOverlay } from "@/src/components/common/LoadingOverlay";
import { ModalDialog } from "@/src/components/common/ModalDialog";

type AdminShelterConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  loadingLabel: string;
  error?: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function AdminShelterConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  loadingLabel,
  error,
  isPending,
  onClose,
  onConfirm,
}: AdminShelterConfirmDialogProps) {
  const closeDialog = useCallback(() => {
    if (!isPending) {
      onClose();
    }
  }, [isPending, onClose]);

  return (
    <ModalDialog
      isOpen={isOpen}
      titleId="admin-shelter-confirm-title"
      closeDisabled={isPending}
      onClose={closeDialog}
      className="max-w-[420px] rounded-[28px] px-7 pt-14 pb-8 text-center"
    >
      <h2 id="admin-shelter-confirm-title" className="text-xl font-bold">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-[#5F5F5F]">{description}</p>

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      <div className="mt-7 grid grid-cols-2 gap-2">
        <Button variant="danger" disabled={isPending} onClick={onConfirm}>
          {isPending ? "Видаляємо..." : confirmLabel}
        </Button>
        <Button variant="neutral" disabled={isPending} onClick={closeDialog}>
          Скасувати
        </Button>
      </div>

      {isPending ? <LoadingOverlay label={loadingLabel} /> : null}
    </ModalDialog>
  );
}
