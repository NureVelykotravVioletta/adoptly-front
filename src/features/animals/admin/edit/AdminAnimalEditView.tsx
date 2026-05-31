"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { LoadingOverlay } from "@/src/components/common/LoadingOverlay";
import {
  deleteAnimalPhotoAction,
  updateAnimalAction,
  uploadAnimalPhotoAction,
} from "@/src/features/animals/animals.action";
import type { Animal } from "@/src/features/animals/animals.api";
import type { EntityImage } from "@/src/types/api";
import {
  AdminAnimalInfoForm,
  getAnimalInfoValues,
  getChangedAnimalInfoValues,
  validateAnimalInfoValues,
  type AnimalInfoFieldName,
  type AnimalInfoTouched,
  type AnimalInfoValues,
} from "@/src/features/animals/admin/edit/AdminAnimalInfoForm";
import { AdminShelterConfirmDialog } from "@/src/features/shelters/admin/edit/AdminShelterConfirmDialog";
import {
  AdminShelterPhotosSection,
  type PendingShelterPhoto,
} from "@/src/features/shelters/admin/edit/AdminShelterPhotosSection";

const tabs = [
  { id: "info", label: "Інформація" },
  { id: "photos", label: "Фото" },
] as const;

type AdminAnimalEditTab = (typeof tabs)[number]["id"];

type AdminAnimalEditViewProps = {
  animal: Animal;
};

type ConfirmAction = { type: "photo"; imageId: string };

export function AdminAnimalEditView({ animal }: AdminAnimalEditViewProps) {
  const router = useRouter();
  const initialInfoValues = useMemo(() => getAnimalInfoValues(animal), [animal]);
  const [activeTab, setActiveTab] = useState<AdminAnimalEditTab>("info");
  const [infoValues, setInfoValues] =
    useState<AnimalInfoValues>(initialInfoValues);
  const [touchedFields, setTouchedFields] = useState<AnimalInfoTouched>({});
  const [existingPhotos, setExistingPhotos] = useState(animal.images);
  const [pendingPhotos, setPendingPhotos] = useState<PendingShelterPhoto[]>([]);
  const [error, setError] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmError, setConfirmError] = useState("");
  const [isPending, startTransition] = useTransition();

  const fieldErrors = validateAnimalInfoValues(infoValues);
  const changedInfoValues = getChangedAnimalInfoValues(
    initialInfoValues,
    infoValues
  );
  const hasInfoChanges = Object.keys(changedInfoValues).length > 0;
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  function handleInfoChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const name = event.target.name as AnimalInfoFieldName;
    const { value } = event.target;

    if (name === "age" && !/^\d*$/.test(value)) {
      return;
    }

    setInfoValues((currentValues) => ({ ...currentValues, [name]: value }));
    setError("");
  }

  function handleInfoBlur(
    event: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const name = event.target.name as AnimalInfoFieldName;

    setTouchedFields((currentFields) => ({
      ...currentFields,
      [name]: true,
    }));
  }

  function handleAddPhotos(files: File[]) {
    if (isPending) {
      return;
    }

    const photosToUpload = files.map((file) => ({
      id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPendingPhotos((currentPhotos) => [...currentPhotos, ...photosToUpload]);
    setError("");

    startTransition(async () => {
      for (const photo of photosToUpload) {
        const photoFormData = new FormData();
        photoFormData.set("image", photo.file);

        const uploadResult = await uploadAnimalPhotoAction(
          animal.id,
          photoFormData
        );

        if (uploadResult.error) {
          setError(uploadResult.error);
          return;
        }

        if (uploadResult.animal) {
          setExistingPhotos((currentPhotos) =>
            mergePhotos(currentPhotos, uploadResult.animal?.images ?? [])
          );
        }

        setPendingPhotos((currentPhotos) =>
          currentPhotos.filter((currentPhoto) => currentPhoto.id !== photo.id)
        );
      }

      router.refresh();
    });
  }

  function handleRemovePendingPhoto(photoId: string) {
    setPendingPhotos((currentPhotos) =>
      currentPhotos.filter((photo) => photo.id !== photoId)
    );
  }

  function handleSave() {
    if (activeTab !== "info" || !hasInfoChanges || hasFieldErrors || isPending) {
      return;
    }

    setTouchedFields(
      Object.fromEntries(
        Object.keys(infoValues).map((field) => [field, true])
      ) as AnimalInfoTouched
    );
    setError("");

    const formData = new FormData();

    Object.entries(changedInfoValues).forEach(([field, value]) => {
      formData.set(field, value);
    });

    startTransition(async () => {
      const updateResult = await updateAnimalAction(animal.id, formData);

      if (updateResult.error) {
        setError(updateResult.error);
        return;
      }

      router.refresh();
    });
  }

  function handleConfirmAction() {
    if (!confirmAction || isPending) {
      return;
    }

    setConfirmError("");

    startTransition(async () => {
      const result = await deleteAnimalPhotoAction(
        animal.id,
        confirmAction.imageId
      );

      if (result.error) {
        setConfirmError(result.error);
        return;
      }

      setExistingPhotos((currentPhotos) =>
        currentPhotos.filter((photo) => photo.id !== confirmAction.imageId)
      );
      setConfirmAction(null);
      router.refresh();
    });
  }

  return (
    <section className="relative rounded-[44px] bg-white px-6 py-8 text-[#262626] shadow-[0_8px_24px_rgba(38,38,38,0.04)] sm:rounded-[54px] sm:px-10 lg:px-14 lg:py-12">
      <div className="sticky top-24 z-30 -mx-2 mb-6 flex items-start justify-between gap-4 bg-white/95 px-2 py-2 backdrop-blur">
        <div className="min-w-0">
          <h1 className="truncate text-3xl leading-tight font-bold sm:text-4xl">
            {infoValues.name || animal.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#8E8E8E]">
            <span>Редагування тварини</span>
            {animal.shelterId ? (
              <>
                <span aria-hidden="true">/</span>
                <Link
                  href={`/shelters/${encodeURIComponent(animal.shelterId)}/edit`}
                  className="font-semibold text-[#8456F0] transition hover:text-[#7045D1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
                >
                  {animal.shelterName}
                </Link>
              </>
            ) : null}
          </div>
        </div>
        {activeTab === "info" ? (
          <button
            type="button"
            disabled={!hasInfoChanges || hasFieldErrors || isPending}
            onClick={handleSave}
            className="h-12 shrink-0 cursor-pointer rounded-full bg-[#8456F0] px-7 text-sm font-semibold text-white transition hover:bg-[#7045D1] disabled:cursor-not-allowed disabled:bg-[#DACAFF] disabled:text-[#8456F0] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
          >
            {isPending ? "Збереження..." : "Зберегти"}
          </button>
        ) : null}
      </div>

      <div
        className="sticky top-[168px] z-20 -mx-2 mb-8 flex gap-2 overflow-x-auto bg-white/95 px-2 py-3 backdrop-blur"
        role="tablist"
        aria-label="Розділи редагування тварини"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "h-11 shrink-0 cursor-pointer rounded-full px-6 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]",
                isActive
                  ? "bg-[#8456F0] text-white hover:bg-[#7045D1]"
                  : "bg-[#F4EEFF] text-[#262626] hover:bg-[#DACAFF] hover:text-[#8456F0]"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {error ? <p className="mb-6 text-sm text-rose-600">{error}</p> : null}

      {activeTab === "info" ? (
        <AdminAnimalInfoForm
          values={infoValues}
          touchedFields={touchedFields}
          fieldErrors={fieldErrors}
          onChange={handleInfoChange}
          onBlur={handleInfoBlur}
        />
      ) : null}

      {activeTab === "photos" ? (
        <AdminShelterPhotosSection
          title="Фото"
          addButtonLabel="Додати фото"
          emptyText="Фото тварини поки не додано."
          existingPhotos={existingPhotos}
          pendingPhotos={pendingPhotos}
          onAddPhotos={handleAddPhotos}
          onRemoveExistingPhoto={(imageId) => {
            setConfirmAction({ type: "photo", imageId });
            setError("");
            setConfirmError("");
          }}
          onRemovePendingPhoto={handleRemovePendingPhoto}
        />
      ) : null}

      {isPending && !confirmAction ? (
        <LoadingOverlay label="Оновлення тварини" />
      ) : null}

      <AdminShelterConfirmDialog
        isOpen={Boolean(confirmAction)}
        title="Видалити фото?"
        description="Фото буде видалено з тварини. Цю дію не можна скасувати."
        confirmLabel="Видалити"
        loadingLabel="Видалення фото"
        error={confirmError}
        isPending={isPending}
        onClose={() => {
          setConfirmAction(null);
          setConfirmError("");
        }}
        onConfirm={handleConfirmAction}
      />
    </section>
  );
}

function mergePhotos(
  currentPhotos: EntityImage[],
  uploadedPhotos: EntityImage[]
): EntityImage[] {
  const merged = [...currentPhotos];
  const seenIds = new Set(currentPhotos.map((photo) => photo.id));

  for (const photo of uploadedPhotos) {
    if (!seenIds.has(photo.id)) {
      merged.push(photo);
      seenIds.add(photo.id);
    }
  }

  return merged;
}
