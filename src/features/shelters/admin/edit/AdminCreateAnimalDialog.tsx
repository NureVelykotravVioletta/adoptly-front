"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/common/Button";
import { FileUploadButton } from "@/src/components/common/FileUploadButton";
import { LoadingOverlay } from "@/src/components/common/LoadingOverlay";
import { ModalDialog } from "@/src/components/common/ModalDialog";
import UserIcon from "@/src/assets/icons/UserIcon.svg";
import { createAnimalAction } from "@/src/features/animals/animals.action";
import type { Animal } from "@/src/features/animals/animals.api";

type AnimalFormValues = {
  name: string;
  type: string;
  breed: string;
  age: string;
  gender: string;
  healthStatus: string;
  description: string;
};

type AnimalFormFieldName = keyof AnimalFormValues;
type AnimalFormErrors = Partial<Record<AnimalFormFieldName, string>>;
type AnimalFormTouched = Partial<Record<AnimalFormFieldName, boolean>>;

type AdminCreateAnimalDialogProps = {
  shelterId: string;
  onCreated: (animal: Animal) => void;
};

const emptyAnimalValues: AnimalFormValues = {
  name: "",
  type: "",
  breed: "",
  age: "",
  gender: "",
  healthStatus: "",
  description: "",
};

const categoryOptions = [
  { value: "CAT", label: "Кіт" },
  { value: "DOG", label: "Собака" },
];

const genderOptions = [
  { value: "FEMALE", label: "Самка" },
  { value: "MALE", label: "Самець" },
];

export function AdminCreateAnimalDialog({
  shelterId,
  onCreated,
}: AdminCreateAnimalDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<AnimalFormValues>(emptyAnimalValues);
  const [touchedFields, setTouchedFields] = useState<AnimalFormTouched>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const fieldErrors = validateAnimalValues(values);
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  const resetForm = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setValues(emptyAnimalValues);
    setTouchedFields({});
    setSelectedImage(null);
    setPreviewUrl("");
    setError("");
  }, [previewUrl]);

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
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const name = event.target.name as AnimalFormFieldName;
    const { value } = event.target;

    if (name === "age" && !/^\d*$/.test(value)) {
      return;
    }

    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setError("");
  }

  function handleBlur(
    event: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const name = event.target.name as AnimalFormFieldName;

    setTouchedFields((currentFields) => ({
      ...currentFields,
      [name]: true,
    }));
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Файл має бути зображенням.");
      event.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
    event.target.value = "";
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setTouchedFields(
      Object.fromEntries(
        Object.keys(values).map((field) => [field, true])
      ) as AnimalFormTouched
    );

    if (hasFieldErrors || isPending) {
      return;
    }

    const formData = new FormData();
    formData.set("shelterId", shelterId);

    Object.entries(values).forEach(([field, value]) => {
      formData.set(field, value.trim());
    });

    if (selectedImage) {
      formData.set("image", selectedImage);
    }

    setError("");

    startTransition(async () => {
      const result = await createAnimalAction(formData);

      if (result.error || !result.success) {
        setError(result.error ?? "Не вдалося створити тварину.");
        return;
      }

      if (result.animal) {
        onCreated(result.animal);
      }

      setIsOpen(false);
      resetForm();
      router.refresh();
    });
  }

  return (
    <>
      <Button onClick={openDialog}>Додати +</Button>

      <ModalDialog
        isOpen={isOpen}
        titleId="create-animal-title"
        as="form"
        closeDisabled={isPending}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        className="max-h-[calc(100vh-4rem)] max-w-[640px] overflow-y-auto rounded-[34px] px-6 pt-15 pb-9 sm:rounded-[36px] sm:px-10 sm:pt-16 sm:pb-12"
      >
        <h2 id="create-animal-title" className="text-2xl font-bold">
          Додати тварину
        </h2>

        <div className="mt-7 flex justify-center">
          <span
            className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#DACAFF] bg-cover bg-center"
            style={
              previewUrl ? { backgroundImage: `url(${previewUrl})` } : undefined
            }
            aria-hidden
          >
            {previewUrl ? null : (
              <UserIcon className="block h-10 w-10 text-[#8456F0]" />
            )}
          </span>
        </div>

        <div className="mt-6 flex justify-center">
          <FileUploadButton
            inputRef={fileInputRef}
            name="image"
            onChange={handleImageChange}
          />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <AnimalInput
            name="name"
            value={values.name}
            placeholder="Імʼя"
            error={touchedFields.name ? fieldErrors.name : undefined}
            required
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <AnimalSelect
            name="type"
            value={values.type}
            placeholder="Категорія"
            options={categoryOptions}
            error={touchedFields.type ? fieldErrors.type : undefined}
            required
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <AnimalInput
            name="breed"
            value={values.breed}
            placeholder="Порода"
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <AnimalInput
            name="age"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={values.age}
            placeholder="Вік"
            error={touchedFields.age ? fieldErrors.age : undefined}
            required
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <AnimalSelect
            name="gender"
            value={values.gender}
            placeholder="Стать"
            options={genderOptions}
            error={touchedFields.gender ? fieldErrors.gender : undefined}
            required
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <AnimalInput
            name="healthStatus"
            value={values.healthStatus}
            placeholder="Стан здоровʼя"
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </div>

        <div className="mt-4">
          <AnimalTextarea
            name="description"
            value={values.description}
            placeholder="Опис"
            onChange={handleChange}
            onBlur={handleBlur}
          />
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

        {isPending ? <LoadingOverlay label="Створення тварини" /> : null}
      </ModalDialog>
    </>
  );
}

type AnimalInputProps = {
  name: Exclude<AnimalFormFieldName, "description" | "type" | "gender">;
  value: string;
  placeholder: string;
  type?: React.HTMLInputTypeAttribute;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  min?: number;
  step?: number;
  required?: boolean;
  error?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
};

function AnimalInput({
  name,
  value,
  placeholder,
  type = "text",
  inputMode,
  min,
  step,
  required = false,
  error,
  onChange,
  onBlur,
}: AnimalInputProps) {
  return (
    <label className="block">
      <input
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        inputMode={inputMode}
        min={min}
        step={step}
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

type AnimalSelectProps = {
  name: "type" | "gender";
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  required?: boolean;
  error?: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLSelectElement>) => void;
};

function AnimalSelect({
  name,
  value,
  placeholder,
  options,
  required = false,
  error,
  onChange,
  onBlur,
}: AnimalSelectProps) {
  return (
    <label className="block">
      <select
        name={name}
        value={value}
        aria-label={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        required={required}
        onChange={onChange}
        onBlur={onBlur}
        className="h-15 w-full cursor-pointer appearance-none rounded-full border border-[#8456F0] bg-white px-5 text-base text-[#262626] outline-none transition focus:border-[#7045D1] aria-invalid:border-rose-500"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={`${name}-error`} className="mt-2 px-5 text-sm text-rose-600">
          {error}
        </p>
      ) : null}
    </label>
  );
}

type AnimalTextareaProps = {
  name: "description";
  value: string;
  placeholder: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
};

function AnimalTextarea({
  name,
  value,
  placeholder,
  onChange,
  onBlur,
}: AnimalTextareaProps) {
  return (
    <label className="block">
      <textarea
        name={name}
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        className="min-h-32 w-full resize-none rounded-3xl border border-[#8456F0] bg-white px-5 py-4 text-base leading-6 text-[#262626] outline-none placeholder:text-[#9CA3AF] focus:border-[#7045D1] focus:placeholder:text-transparent"
      />
    </label>
  );
}

function validateAnimalValues(values: AnimalFormValues) {
  const errors: AnimalFormErrors = {};

  if (values.name.trim().length === 0) {
    errors.name = "Імʼя тварини не може бути порожнім.";
  }

  if (values.type.trim().length === 0) {
    errors.type = "Категорія тварини не може бути порожньою.";
  }

  if (values.age.trim().length === 0) {
    errors.age = "Вік тварини не може бути порожнім.";
  } else if (!/^\d+$/.test(values.age.trim())) {
    errors.age = "Вік має бути числом.";
  }

  if (values.gender.trim().length === 0) {
    errors.gender = "Стать тварини не може бути порожньою.";
  }

  return errors;
}
