"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoadingOverlay } from "@/src/components/common/LoadingOverlay";
import PencilIcon from "@/src/assets/icons/PencilIcon.svg";
import TrashIcon from "@/src/assets/icons/TrashIcon.svg";
import DefaultArticleImage from "@/src/assets/images/DefaultArticleImage.png";
import { updateArticleAction } from "@/src/features/articles/articles.action";
import type { Article } from "@/src/features/articles/articles.api";

type AdminArticleEditViewProps = {
  article: Article;
};

export function AdminArticleEditView({ article }: AdminArticleEditViewProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(article.title);
  const [text, setText] = useState(article.text);
  const [imageUrl, setImageUrl] = useState(article.imageUrl);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const imageSrc = previewUrl || imageUrl || DefaultArticleImage.src;
  const hasChanges =
    title.trim() !== article.title ||
    text.trim() !== article.text ||
    imageUrl !== article.imageUrl ||
    selectedImageFile !== null;
  const hasFieldErrors = title.trim().length === 0 || text.trim().length === 0;

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !file.type.startsWith("image/")) {
      event.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
    event.target.value = "";
  }

  function handleDeleteImage() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImageFile(null);
    setPreviewUrl("");
    setImageUrl(null);
    setError("");
  }

  function handleSave() {
    if (!hasChanges || hasFieldErrors || isPending) {
      return;
    }

    setError("");

    const formData = new FormData();
    formData.set("title", title.trim());
    formData.set("content", text.trim());

    if (selectedImageFile) {
      formData.set("image", selectedImageFile);
    } else if (imageUrl !== article.imageUrl) {
      formData.set("image", imageUrl ?? "");
    }

    startTransition(async () => {
      const result = await updateArticleAction(article.id, formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <section className="relative rounded-[44px] bg-white px-6 py-8 text-[#262626] shadow-[0_8px_24px_rgba(38,38,38,0.04)] sm:rounded-[54px] sm:px-10 lg:px-14 lg:py-12">
      <div className="sticky top-24 z-30 -mx-2 mb-6 flex items-center justify-between gap-4 bg-white/95 px-2 py-2 backdrop-blur">
        <h1 className="truncate text-3xl leading-tight font-bold sm:text-4xl">
          {title || article.title}
        </h1>
        <button
          type="button"
          disabled={!hasChanges || hasFieldErrors || isPending}
          onClick={handleSave}
          className="h-12 shrink-0 cursor-pointer rounded-full bg-[#8456F0] px-7 text-sm font-semibold text-white transition hover:bg-[#7045D1] disabled:cursor-not-allowed disabled:bg-[#DACAFF] disabled:text-[#8456F0] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
        >
          {isPending ? "Збереження..." : "Зберегти"}
        </button>
      </div>

      <div className="relative aspect-[2.35] overflow-hidden rounded-[28px] bg-[#D9D9D9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageSrc} alt="" className="h-full w-full object-cover" />

        <div className="absolute top-5 right-5 flex gap-3">
          <button
            type="button"
            aria-label="Змінити фото статті"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#FFF2D8] text-[#F3A51B] shadow-[0_8px_24px_rgba(38,38,38,0.12)] transition hover:bg-[#FFE4A8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3A51B]"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Видалити фото статті"
            onClick={handleDeleteImage}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#FFDADA] text-[#E22F2F] shadow-[0_8px_24px_rgba(38,38,38,0.12)] transition hover:bg-[#FFC2C2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E22F2F]"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleImageChange}
        />
      </div>

      {error ? <p className="mt-5 text-sm text-rose-600">{error}</p> : null}

      <div className="mt-8 grid gap-5">
        <label className="block">
          <span className="mb-2 block px-5 text-sm font-semibold">
            Заголовок
          </span>
          <input
            value={title}
            aria-invalid={title.trim().length === 0}
            onChange={(event) => {
              setTitle(event.target.value);
              setError("");
            }}
            className="h-15 w-full rounded-full border border-[#8456F0] bg-white px-5 text-base text-[#262626] outline-none placeholder:text-[#9CA3AF] focus:border-[#7045D1] focus:placeholder:text-transparent aria-invalid:border-rose-500"
          />
        </label>

        <label className="block">
          <span className="mb-2 block px-5 text-sm font-semibold">
            Текст статті
          </span>
          <textarea
            value={text}
            aria-invalid={text.trim().length === 0}
            onChange={(event) => {
              setText(event.target.value);
              setError("");
            }}
            className="min-h-80 w-full resize-none rounded-3xl border border-[#8456F0] bg-white px-5 py-4 text-base leading-6 text-[#262626] outline-none placeholder:text-[#9CA3AF] focus:border-[#7045D1] focus:placeholder:text-transparent aria-invalid:border-rose-500"
          />
        </label>
      </div>

      {isPending ? <LoadingOverlay label="Збереження статті" /> : null}
    </section>
  );
}
