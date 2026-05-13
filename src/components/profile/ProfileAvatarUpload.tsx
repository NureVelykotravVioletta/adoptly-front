"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoadingOverlay } from "@/src/components/common/LoadingOverlay";
import { uploadAvatarAction } from "@/src/features/auth/auth.action";
import UserIcon from "@/src/assets/icons/UserIcon.svg";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

type ProfileAvatarUploadProps = {
  avatarUrl: string | null;
};

export function ProfileAvatarUpload({ avatarUrl }: ProfileAvatarUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState(avatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSelectPhoto = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Файл має бути зображенням.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setError("Фото має бути не більше 5MB.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.set("image", file);
    setError(null);

    startTransition(async () => {
      const result = await uploadAvatarAction(formData);

      if (result.error) {
        setError(result.error);
        event.target.value = "";
        return;
      }

      setPreviewUrl(result.avatarUrl ?? URL.createObjectURL(file));
      event.target.value = "";
      router.refresh();
    });
  };

  return (
    <div className="-mt-2 flex flex-col items-center">
      <span
        className="flex h-26 w-26 items-center justify-center overflow-hidden rounded-full bg-[#DACAFF] bg-cover bg-center"
        style={
          previewUrl ? { backgroundImage: `url(${previewUrl})` } : undefined
        }
        aria-hidden
      >
        {previewUrl ? null : (
          <UserIcon className="block h-12.5 w-12.5 text-[#8456F0]" />
        )}
      </span>

      <input
        ref={inputRef}
        type="file"
        name="image"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={handleSelectPhoto}
        disabled={isPending}
        className="mt-3 cursor-pointer text-sm font-medium underline underline-offset-2 transition hover:text-[#8456F0] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Завантаження..." : "Завантажити фото"}
      </button>

      {isPending ? <LoadingOverlay label="Завантаження фото" /> : null}

      {error ? (
        <p className="mt-2 text-center text-sm text-rose-600">{error}</p>
      ) : null}
    </div>
  );
}
