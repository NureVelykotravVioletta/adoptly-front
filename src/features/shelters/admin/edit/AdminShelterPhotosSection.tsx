"use client";

import TrashIcon from "@/src/assets/icons/TrashIcon.svg";

export type PendingShelterPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

type AdminShelterPhotosSectionProps = {
  existingPhotos: string[];
  pendingPhotos: PendingShelterPhoto[];
  title?: string;
  addButtonLabel?: string;
  emptyText?: string;
  onAddPhotos: (files: File[]) => void;
  onRemoveExistingPhoto: (photo: string) => void;
  onRemovePendingPhoto: (photoId: string) => void;
};

export function AdminShelterPhotosSection({
  existingPhotos,
  pendingPhotos,
  title = "Фото",
  addButtonLabel = "Додати фото",
  emptyText = "Фото притулку поки не додано.",
  onAddPhotos,
  onRemoveExistingPhoto,
  onRemovePendingPhoto,
}: AdminShelterPhotosSectionProps) {
  const photos = [
    ...existingPhotos.map((photo) => ({
      id: photo,
      src: photo,
      type: "existing" as const,
    })),
    ...pendingPhotos.map((photo) => ({
      id: photo.id,
      src: photo.previewUrl,
      type: "pending" as const,
    })),
  ];

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length > 0) {
      onAddPhotos(files);
    }

    event.target.value = "";
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <label className="flex h-12 cursor-pointer items-center rounded-full bg-[#8456F0] px-7 text-sm font-semibold text-white transition hover:bg-[#7045D1] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#8456F0]">
          {addButtonLabel}
          <input
            type="file"
            name="photos"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {photos.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <div
              key={`${photo.type}-${photo.id}`}
              className="group relative aspect-[1.45] overflow-hidden rounded-[24px] bg-[#D9D9D9]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <button
                type="button"
                aria-label="Видалити фото"
                onClick={() =>
                  photo.type === "existing"
                    ? onRemoveExistingPhoto(photo.src)
                    : onRemovePendingPhoto(photo.id)
                }
                className="absolute top-4 right-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#FFDADA] text-[#E22F2F] opacity-0 shadow-[0_8px_24px_rgba(38,38,38,0.12)] transition group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E22F2F]"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-60 items-center justify-center rounded-[28px] bg-[#F7F7F7] px-6 text-center text-sm text-[#8E8E8E]">
          {emptyText}
        </div>
      )}
    </section>
  );
}
