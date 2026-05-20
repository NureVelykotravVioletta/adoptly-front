"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/common/Button";
import { FileUploadButton } from "@/src/components/common/FileUploadButton";
import { LoadingOverlay } from "@/src/components/common/LoadingOverlay";
import { ModalDialog } from "@/src/components/common/ModalDialog";
import TrashIcon from "@/src/assets/icons/TrashIcon.svg";
import { createArticleAction } from "@/src/features/articles/articles.action";

const emptyArticleValues = {
  title: "",
  content: "",
};

type ArticleValues = typeof emptyArticleValues;
type ArticleFieldName = keyof ArticleValues;
type ArticleErrors = Partial<Record<ArticleFieldName, string>>;
type ArticleTouched = Partial<Record<ArticleFieldName, boolean>>;

export function AdminCreateArticleDialog() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<ArticleValues>(emptyArticleValues);
  const [touchedFields, setTouchedFields] = useState<ArticleTouched>({});
  const [selectedPhoto, setSelectedPhoto] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const fieldErrors = validateArticleValues(values);
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  const resetForm = useCallback(() => {
    if (selectedPhoto) {
      URL.revokeObjectURL(selectedPhoto.previewUrl);
    }

    setValues(emptyArticleValues);
    setTouchedFields({});
    setSelectedPhoto(null);
    setError("");
  }, [selectedPhoto]);

  const closeDialog = useCallback(() => {
    if (isPending) {
      return;
    }

    setIsOpen(false);
  }, [isPending]);

  function openDialog() {
    resetForm();
    setIsOpen(true);
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const name = event.target.name as ArticleFieldName;
    const { value } = event.target;

    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setError("");
  }

  function handleBlur(
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const name = event.target.name as ArticleFieldName;

    setTouchedFields((currentFields) => ({
      ...currentFields,
      [name]: true,
    }));
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Файл має бути зображенням.");
      event.target.value = "";
      return;
    }

    if (selectedPhoto) {
      URL.revokeObjectURL(selectedPhoto.previewUrl);
    }

    setSelectedPhoto({
      file,
      previewUrl: URL.createObjectURL(file),
    });
    setError("");
    event.target.value = "";
  }

  function handleRemovePhoto() {
    if (selectedPhoto) {
      URL.revokeObjectURL(selectedPhoto.previewUrl);
    }

    setSelectedPhoto(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setTouchedFields({
      title: true,
      content: true,
    });

    if (hasFieldErrors || isPending) {
      return;
    }

    setError("");

    startTransition(async () => {
      const formData = new FormData();
      formData.set("title", values.title.trim());
      formData.set("content", values.content.trim());

      if (selectedPhoto) {
        formData.set("image", selectedPhoto.file);
      }

      const result = await createArticleAction(formData);

      if (result.error || !result.article) {
        setError(result.error ?? "Не вдалося створити статтю.");
        return;
      }

      setIsOpen(false);
      resetForm();
      router.refresh();
    });
  }

  return (
    <>
      <Button onClick={openDialog} className="py-3">
        Додати +
      </Button>

      <ModalDialog
        isOpen={isOpen}
        titleId="create-article-title"
        as="form"
        closeDisabled={isPending}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        className="max-h-[calc(100vh-4rem)] max-w-[720px] overflow-y-auto rounded-[34px] px-6 pt-15 pb-9 sm:rounded-[36px] sm:px-10 sm:pt-16 sm:pb-12"
      >
        <h2 id="create-article-title" className="text-2xl font-bold">
          Додати статтю
        </h2>

        <div className="mt-7 grid gap-5">
          <ArticleInput
            name="title"
            value={values.title}
            label="Заголовок"
            error={touchedFields.title ? fieldErrors.title : undefined}
            required
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <ArticleTextarea
            name="content"
            value={values.content}
            label="Текст статті"
            error={touchedFields.content ? fieldErrors.content : undefined}
            required
            onChange={handleChange}
            onBlur={handleBlur}
          />

          <div>
            <FileUploadButton
              inputRef={fileInputRef}
              name="image"
              onChange={handlePhotoChange}
            />

            {selectedPhoto ? (
              <div className="group relative mt-4 aspect-[1.8] overflow-hidden rounded-2xl bg-[#F4EEFF]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedPhoto.previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <Button
                  type="button"
                  variant="danger"
                  size="icon"
                  aria-label="Видалити фото"
                  onClick={handleRemovePhoto}
                  className="absolute top-3 right-3 bg-[#FFDADA] text-[#E22F2F] opacity-0 shadow-[0_8px_24px_rgba(38,38,38,0.12)] group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-[#E22F2F]"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

        <Button
          type="submit"
          size="lg"
          disabled={hasFieldErrors || isPending}
          className="mt-8"
        >
          {isPending ? "Створення..." : "Створити"}
        </Button>

        {isPending ? <LoadingOverlay label="Створення статті" /> : null}
      </ModalDialog>
    </>
  );
}

type ArticleInputProps = {
  name: "title";
  value: string;
  label: string;
  required?: boolean;
  error?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
};

function ArticleInput({
  name,
  value,
  label,
  required = false,
  error,
  onChange,
  onBlur,
}: ArticleInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block px-5 text-sm font-semibold">{label}</span>
      <input
        name={name}
        value={value}
        placeholder={label}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        required={required}
        onChange={onChange}
        onBlur={onBlur}
        className="h-15 w-full rounded-full border border-[#8456F0] bg-white px-5 text-base text-[#262626] outline-none placeholder:text-[#9CA3AF] focus:border-[#7045D1] focus:placeholder:text-transparent aria-invalid:border-rose-500"
      />
      {error ? (
        <p id={`${name}-error`} className="mt-2 px-5 text-sm text-rose-600">
          {error}
        </p>
      ) : null}
    </label>
  );
}

type ArticleTextareaProps = {
  name: "content";
  value: string;
  label: string;
  required?: boolean;
  error?: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
};

function ArticleTextarea({
  name,
  value,
  label,
  required = false,
  error,
  onChange,
  onBlur,
}: ArticleTextareaProps) {
  return (
    <label className="block">
      <span className="mb-2 block px-5 text-sm font-semibold">{label}</span>
      <textarea
        name={name}
        value={value}
        placeholder={label}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        required={required}
        onChange={onChange}
        onBlur={onBlur}
        className="min-h-44 w-full resize-none rounded-3xl border border-[#8456F0] bg-white px-5 py-4 text-base leading-6 text-[#262626] outline-none placeholder:text-[#9CA3AF] focus:border-[#7045D1] focus:placeholder:text-transparent aria-invalid:border-rose-500"
      />
      {error ? (
        <p id={`${name}-error`} className="mt-2 px-5 text-sm text-rose-600">
          {error}
        </p>
      ) : null}
    </label>
  );
}

function validateArticleValues(values: ArticleValues) {
  const errors: ArticleErrors = {};

  if (values.title.trim().length === 0) {
    errors.title = "Заголовок статті не може бути порожнім.";
  }

  if (values.content.trim().length === 0) {
    errors.content = "Текст статті не може бути порожнім.";
  }

  return errors;
}
