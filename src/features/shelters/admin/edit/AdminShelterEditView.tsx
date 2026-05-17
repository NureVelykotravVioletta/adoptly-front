"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { LoadingOverlay } from "@/src/components/common/LoadingOverlay";
import { deleteAnimalAction } from "@/src/features/animals/animals.action";
import { AdminShelterAnimalsSection } from "@/src/features/shelters/admin/edit/AdminShelterAnimalsSection";
import {
  AdminShelterInfoForm,
  getChangedInfoValues,
  getShelterInfoValues,
  validateShelterInfoValues,
  type ShelterInfoFieldName,
  type ShelterInfoTouched,
  type ShelterInfoValues,
} from "@/src/features/shelters/admin/edit/AdminShelterInfoForm";
import {
  AdminShelterPhotosSection,
  type PendingShelterPhoto,
} from "@/src/features/shelters/admin/edit/AdminShelterPhotosSection";
import {
  updateShelterAction,
  uploadShelterPhotoAction,
} from "@/src/features/shelters/shelters.action";
import type { Animal } from "@/src/features/animals/animals.api";
import type { Shelter } from "@/src/features/shelters/shelters.api";

const tabs = [
  { id: "info", label: "Інформація" },
  { id: "photos", label: "Фото" },
  { id: "animals", label: "Тварини" },
] as const;

type AdminShelterEditTab = (typeof tabs)[number]["id"];

type AdminShelterEditViewProps = {
  shelter: Shelter;
  animals: Animal[];
};

export function AdminShelterEditView({
  shelter,
  animals,
}: AdminShelterEditViewProps) {
  const router = useRouter();
  const initialInfoValues = useMemo(
    () => getShelterInfoValues(shelter),
    [shelter]
  );
  const [activeTab, setActiveTab] = useState<AdminShelterEditTab>("info");
  const [infoValues, setInfoValues] =
    useState<ShelterInfoValues>(initialInfoValues);
  const [touchedFields, setTouchedFields] = useState<ShelterInfoTouched>({});
  const [existingPhotos, setExistingPhotos] = useState(shelter.images);
  const [pendingPhotos, setPendingPhotos] = useState<PendingShelterPhoto[]>([]);
  const [visibleAnimals, setVisibleAnimals] = useState(animals);
  const [deletedAnimalIds, setDeletedAnimalIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const fieldErrors = validateShelterInfoValues(infoValues);
  const changedInfoValues = getChangedInfoValues(
    initialInfoValues,
    infoValues
  );
  const hasInfoChanges = Object.keys(changedInfoValues).length > 0;
  const hasPhotoChanges =
    pendingPhotos.length > 0 ||
    existingPhotos.length !== shelter.images.length ||
    existingPhotos.some((photo, index) => photo !== shelter.images[index]);
  const hasAnimalChanges = deletedAnimalIds.length > 0;
  const hasChanges = hasInfoChanges || hasPhotoChanges || hasAnimalChanges;
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  function handleInfoChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const name = event.target.name as ShelterInfoFieldName;
    const { value } = event.target;

    setInfoValues((currentValues) => ({ ...currentValues, [name]: value }));
    setError("");
  }

  function handleInfoBlur(
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const name = event.target.name as ShelterInfoFieldName;

    setTouchedFields((currentFields) => ({
      ...currentFields,
      [name]: true,
    }));
  }

  function handleAddPhotos(files: File[]) {
    setPendingPhotos((currentPhotos) => [
      ...currentPhotos,
      ...files.map((file) => ({
        id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
    setError("");
  }

  function handleRemovePendingPhoto(photoId: string) {
    setPendingPhotos((currentPhotos) =>
      currentPhotos.filter((photo) => photo.id !== photoId)
    );
  }

  function handleRemoveAnimal(animalId: string) {
    setVisibleAnimals((currentAnimals) =>
      currentAnimals.filter((animal) => animal.id !== animalId)
    );
    setDeletedAnimalIds((currentIds) =>
      currentIds.includes(animalId) ? currentIds : [...currentIds, animalId]
    );
    setError("");
  }

  function handleSave() {
    if (!hasChanges || hasFieldErrors || isPending) {
      return;
    }

    setTouchedFields(
      Object.fromEntries(
        Object.keys(infoValues).map((field) => [field, true])
      ) as ShelterInfoTouched
    );
    setError("");

    const formData = new FormData();

    Object.entries(changedInfoValues).forEach(([field, value]) => {
      formData.set(field, value);
    });

    if (hasPhotoChanges) {
      existingPhotos.forEach((photo) => {
        formData.append("images", photo);
      });
    }

    startTransition(async () => {
      const updateResult =
        hasInfoChanges || hasPhotoChanges
          ? await updateShelterAction(shelter.id, formData)
          : {};

      if (updateResult.error) {
        setError(updateResult.error);
        return;
      }

      for (const photo of pendingPhotos) {
        const photoFormData = new FormData();
        photoFormData.set("image", photo.file);

        const uploadResult = await uploadShelterPhotoAction(
          shelter.id,
          photoFormData
        );

        if (uploadResult.error) {
          setError(uploadResult.error);
          return;
        }
      }

      for (const animalId of deletedAnimalIds) {
        const deleteResult = await deleteAnimalAction(animalId, shelter.id);

        if (deleteResult.error) {
          setError(deleteResult.error);
          return;
        }
      }

      setPendingPhotos([]);
      setDeletedAnimalIds([]);
      router.refresh();
    });
  }

  return (
    <section className="relative rounded-[44px] bg-white px-6 py-8 text-[#262626] shadow-[0_8px_24px_rgba(38,38,38,0.04)] sm:rounded-[54px] sm:px-10 lg:px-14 lg:py-12">
      <div className="sticky top-4 z-30 -mx-2 mb-6 flex items-start justify-between gap-4 bg-white/95 px-2 py-2 backdrop-blur">
        <div className="min-w-0">
          <h1 className="truncate text-3xl leading-tight font-bold sm:text-4xl">
            {infoValues.name || shelter.name}
          </h1>
          <p className="mt-2 text-sm text-[#8E8E8E]">Редагування притулку</p>
        </div>
        <button
          type="button"
          disabled={!hasChanges || hasFieldErrors || isPending}
          onClick={handleSave}
          className="h-12 shrink-0 cursor-pointer rounded-full bg-[#8456F0] px-7 text-sm font-semibold text-white transition hover:bg-[#7045D1] disabled:cursor-not-allowed disabled:bg-[#DACAFF] disabled:text-[#8456F0] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
        >
          {isPending ? "Збереження..." : "Зберегти"}
        </button>
      </div>

      <div
        className="sticky top-[92px] z-20 -mx-2 mb-8 flex gap-2 overflow-x-auto bg-white/95 px-2 py-3 backdrop-blur"
        role="tablist"
        aria-label="Розділи редагування притулку"
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
        <AdminShelterInfoForm
          values={infoValues}
          touchedFields={touchedFields}
          fieldErrors={fieldErrors}
          onChange={handleInfoChange}
          onBlur={handleInfoBlur}
        />
      ) : null}
      {activeTab === "photos" ? (
        <AdminShelterPhotosSection
          existingPhotos={existingPhotos}
          pendingPhotos={pendingPhotos}
          onAddPhotos={handleAddPhotos}
          onRemoveExistingPhoto={(photo) =>
            setExistingPhotos((currentPhotos) =>
              currentPhotos.filter((currentPhoto) => currentPhoto !== photo)
            )
          }
          onRemovePendingPhoto={handleRemovePendingPhoto}
        />
      ) : null}
      {activeTab === "animals" ? (
        <AdminShelterAnimalsSection
          animals={visibleAnimals}
          onRemoveAnimal={handleRemoveAnimal}
        />
      ) : null}

      {isPending ? <LoadingOverlay label="Збереження притулку" /> : null}
    </section>
  );
}
