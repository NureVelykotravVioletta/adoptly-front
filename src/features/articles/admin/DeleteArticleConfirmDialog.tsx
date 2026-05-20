"use client";

import { useCallback, useState, useTransition } from "react";
import { Button } from "@/src/components/common/Button";
import { LoadingOverlay } from "@/src/components/common/LoadingOverlay";
import { ModalDialog } from "@/src/components/common/ModalDialog";
import { deleteArticleAction } from "@/src/features/articles/articles.action";
import type { Article } from "@/src/features/articles/articles.api";

type DeleteArticleConfirmDialogProps = {
  article: Article | null;
  onClose: () => void;
  onDeleted: (articleId: string) => void;
};

export function DeleteArticleConfirmDialog({
  article,
  onClose,
  onDeleted,
}: DeleteArticleConfirmDialogProps) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const isOpen = Boolean(article);

  const closeDialog = useCallback(() => {
    if (isPending) {
      return;
    }

    setError("");
    onClose();
  }, [isPending, onClose]);

  if (!article) {
    return null;
  }

  function handleDelete() {
    if (!article || isPending) {
      return;
    }

    setError("");

    startTransition(async () => {
      const result = await deleteArticleAction(article.id);

      if (result.error) {
        setError(result.error);
        return;
      }

      onDeleted(article.id);
    });
  }

  return (
    <ModalDialog
      isOpen={isOpen}
      titleId="delete-article-title"
      closeDisabled={isPending}
      onClose={closeDialog}
      className="max-w-[420px] rounded-[28px] px-7 pt-14 pb-8 text-center"
    >
      <h2 id="delete-article-title" className="text-xl font-bold">
        Видалити статтю?
      </h2>

      <p className="mt-3 text-sm leading-6 text-[#5F5F5F]">
        Статтю «{article.title}» буде видалено. Цю дію не можна скасувати.
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

      {isPending ? <LoadingOverlay label="Видалення статті" /> : null}
    </ModalDialog>
  );
}
