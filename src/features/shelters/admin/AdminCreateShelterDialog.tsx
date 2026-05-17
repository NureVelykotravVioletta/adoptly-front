"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/common/Button";
import { FileUploadButton } from "@/src/components/common/FileUploadButton";
import { LoadingOverlay } from "@/src/components/common/LoadingOverlay";
import { ModalDialog } from "@/src/components/common/ModalDialog";
import TrashIcon from "@/src/assets/icons/TrashIcon.svg";
import {
  AdminShelterInfoForm,
  validateShelterInfoValues,
  type ShelterInfoFieldName,
  type ShelterInfoTouched,
  type ShelterInfoValues,
} from "@/src/features/shelters/admin/edit/AdminShelterInfoForm";
import {
  createShelterAction,
  uploadShelterPhotoAction,
} from "@/src/features/shelters/shelters.action";

const emptyShelterValues: ShelterInfoValues = {
  name: "",
  city: "",
  address: "",
  description: "",
  phone: "",
  email: "",
  workingHours: "",
  foundedAt: "",
};

type SelectedShelterPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

export function AdminCreateShelterDialog() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<ShelterInfoValues>(emptyShelterValues);
  const [touchedFields, setTouchedFields] = useState<ShelterInfoTouched>({});
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedShelterPhoto[]>(
    []
  );
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const fieldErrors = validateShelterInfoValues(values);
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  const resetForm = useCallback(() => {
    selectedPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    setValues(emptyShelterValues);
    setTouchedFields({});
    setSelectedPhotos([]);
    setError("");
  }, [selectedPhotos]);

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
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const name = event.target.name as ShelterInfoFieldName;
    const { value } = event.target;

    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setError("");
  }

  function handleBlur(
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const name = event.target.name as ShelterInfoFieldName;

    setTouchedFields((currentFields) => ({
      ...currentFields,
      [name]: true,
    }));
  }

  function handlePhotosChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length === 0) {
      event.target.value = "";
      return;
    }

    setSelectedPhotos((currentPhotos) => [
      ...currentPhotos,
      ...files.map((file) => ({
        id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
    setError("");
    event.target.value = "";
  }

  function handleRemovePhoto(photoId: string) {
    setSelectedPhotos((currentPhotos) => {
      const photoToRemove = currentPhotos.find((photo) => photo.id === photoId);

      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.previewUrl);
      }

      return currentPhotos.filter((photo) => photo.id !== photoId);
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setTouchedFields(
      Object.fromEntries(
        Object.keys(values).map((field) => [field, true])
      ) as ShelterInfoTouched
    );

    if (hasFieldErrors || isPending) {
      return;
    }

    setError("");

    const formData = new FormData();

    Object.entries(values).forEach(([field, value]) => {
      formData.set(field, value.trim());
    });

    startTransition(async () => {
      const createResult = await createShelterAction(formData);

      if (createResult.error || !createResult.shelter) {
        setError(createResult.error ?? "Не вдалося створити притулок.");
        return;
      }

      for (const photo of selectedPhotos) {
        const photoFormData = new FormData();
        photoFormData.set("image", photo.file);

        const uploadResult = await uploadShelterPhotoAction(
          createResult.shelter.id,
          photoFormData
        );

        if (uploadResult.error) {
          setError(
            `Притулок створено, але фото не завантажено: ${uploadResult.error}`
          );
          router.refresh();
          return;
        }
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
        titleId="create-shelter-title"
        as="form"
        closeDisabled={isPending}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        className="max-h-[calc(100vh-4rem)] max-w-[720px] overflow-y-auto rounded-[34px] px-6 pt-15 pb-9 sm:rounded-[36px] sm:px-10 sm:pt-16 sm:pb-12"
      >
        <h2 id="create-shelter-title" className="text-2xl font-bold">
          Додати притулок
        </h2>

        <div className="mt-7">
          <AdminShelterInfoForm
            values={values}
            touchedFields={touchedFields}
            fieldErrors={fieldErrors}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </div>

        <div className="mt-7">
          <FileUploadButton
            inputRef={fileInputRef}
            name="photos"
            multiple
            onChange={handlePhotosChange}
          />
        </div>

        {selectedPhotos.length > 0 ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {selectedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-[1.35] overflow-hidden rounded-2xl bg-[#F4EEFF]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <Button
                  type="button"
                  variant="danger"
                  size="icon"
                  aria-label="Видалити фото"
                  onClick={() => handleRemovePhoto(photo.id)}
                  className="absolute top-3 right-3 bg-[#FFDADA] text-[#E22F2F] opacity-0 shadow-[0_8px_24px_rgba(38,38,38,0.12)] group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-[#E22F2F]"
                >
                  <TrashIcon className="h-4.5 w-4.5" />
                </Button>
              </div>
            ))}
          </div>
        ) : null}

        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

        <Button
          type="submit"
          size="lg"
          disabled={hasFieldErrors || isPending}
          className="mt-8"
        >
          {isPending ? "Створення..." : "Зберегти"}
        </Button>

        {isPending ? <LoadingOverlay label="Створення притулку" /> : null}
      </ModalDialog>
    </>
  );
}
