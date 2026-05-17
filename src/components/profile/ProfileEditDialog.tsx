"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateProfileAction,
  uploadAvatarAction,
} from "@/src/features/auth/auth.action";
import { Button } from "@/src/components/common/Button";
import { FileUploadButton } from "@/src/components/common/FileUploadButton";
import { LoadingOverlay } from "@/src/components/common/LoadingOverlay";
import { ModalDialog } from "@/src/components/common/ModalDialog";
import type { AuthUser } from "@/src/features/auth/auth.api";
import EditIcon from "@/src/assets/icons/EditIcon.svg";
import UserIcon from "@/src/assets/icons/UserIcon.svg";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

type ProfileEditDialogProps = {
  user: AuthUser;
};

type ProfileEditValues = {
  name: string;
  email: string;
  phone: string;
};

type ProfileEditFieldName = keyof ProfileEditValues;
type ProfileEditErrors = Partial<Record<ProfileEditFieldName, string>>;
type ProfileEditTouched = Partial<Record<ProfileEditFieldName, boolean>>;

export function ProfileEditDialog({ user }: ProfileEditDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialValues = useMemo(
    () => ({
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
    }),
    [user.email, user.name, user.phone]
  );
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<ProfileEditValues>(initialValues);
  const [touchedFields, setTouchedFields] = useState<ProfileEditTouched>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(user.avatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const changedValues = getChangedValues(initialValues, values);
  const fieldErrors = validateProfileEditValues(values);
  const hasChanges =
    Object.keys(changedValues).length > 0 || selectedImage !== null;
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  const closeDialog = useCallback(() => {
    if (isPending) {
      return;
    }

    setIsOpen(false);
  }, [isPending]);

  const openDialog = () => {
    setValues(initialValues);
    setTouchedFields({});
    setSelectedImage(null);
    setPreviewUrl(user.avatarUrl);
    setError(null);
    setIsOpen(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name as ProfileEditFieldName;
    const { value } = event.target;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
    setError(null);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const name = event.target.name as ProfileEditFieldName;

    setTouchedFields((currentFields) => ({
      ...currentFields,
      [name]: true,
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasChanges || isPending) {
      return;
    }

    setTouchedFields({
      name: true,
      email: true,
      phone: true,
    });

    if (hasFieldErrors) {
      return;
    }

    startTransition(async () => {
      if (Object.keys(changedValues).length > 0) {
        const formData = new FormData();

        Object.entries(changedValues).forEach(([field, value]) => {
          formData.set(field, value);
        });

        const result = await updateProfileAction(formData);

        if (result.error) {
          setError(result.error);
          return;
        }
      }

      if (selectedImage) {
        const imageFormData = new FormData();
        imageFormData.set("image", selectedImage);

        const result = await uploadAvatarAction(imageFormData);

        if (result.error) {
          setError(result.error);
          return;
        }
      }

      setIsOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="icon"
        size="icon"
        aria-label="Редагувати профіль"
        onClick={openDialog}
      >
        <EditIcon className="h-4.5 w-4.5" />
      </Button>

      <ModalDialog
        isOpen={isOpen}
        titleId="profile-edit-title"
        as="form"
        closeDisabled={isPending}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        className="max-w-[560px] rounded-[34px] px-6 pt-15 pb-9 sm:rounded-[36px] sm:px-14 sm:pt-16 sm:pb-14"
      >
        <h2 id="profile-edit-title" className="text-2xl font-bold">
          Редагувати інформацію
        </h2>

        <div className="mt-7 flex justify-center">
          <span
            className="flex h-22 w-22 items-center justify-center overflow-hidden rounded-full bg-[#DACAFF] bg-cover bg-center"
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

        <div className="mt-5 space-y-4">
          <ProfileEditInput
            name="name"
            value={values.name}
            placeholder="Імʼя"
            ariaLabel="Імʼя"
            autoComplete="name"
            error={touchedFields.name ? fieldErrors.name : undefined}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <ProfileEditInput
            name="email"
            type="email"
            value={values.email}
            placeholder="name@gmail.com"
            ariaLabel="Електронна пошта"
            autoComplete="email"
            error={touchedFields.email ? fieldErrors.email : undefined}
            required
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <ProfileEditInput
            name="phone"
            type="tel"
            value={values.phone}
            placeholder="+380"
            ariaLabel="Номер телефону"
            autoComplete="tel"
            inputMode="tel"
            pattern="^\+?[0-9\s()\-]{7,20}$"
            title="Введіть коректний номер телефону"
            error={touchedFields.phone ? fieldErrors.phone : undefined}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </div>

        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

        <Button
          type="submit"
          size="lg"
          disabled={!hasChanges || hasFieldErrors || isPending}
          className="mt-8"
        >
          {isPending ? "Збереження..." : "Зберегти"}
        </Button>

        {isPending ? <LoadingOverlay label="Збереження профілю" /> : null}
      </ModalDialog>
    </>
  );
}

type ProfileEditInputProps = {
  name: ProfileEditFieldName;
  value: string;
  placeholder: string;
  ariaLabel: string;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: React.HTMLInputAutoCompleteAttribute;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
  title?: string;
  required?: boolean;
  error?: string;
  readOnly?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
};

function ProfileEditInput({
  name,
  value,
  placeholder,
  ariaLabel,
  type = "text",
  autoComplete,
  inputMode,
  pattern,
  title,
  required = false,
  error,
  readOnly = false,
  onChange,
  onBlur,
}: ProfileEditInputProps) {
  return (
    <label className="block">
      <input
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        autoComplete={autoComplete}
        inputMode={inputMode}
        pattern={pattern}
        title={title}
        required={required}
        readOnly={readOnly}
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

function getChangedValues(
  initialValues: ProfileEditValues,
  values: ProfileEditValues
) {
  return Object.fromEntries(
    Object.entries(values)
      .map(([field, value]) => [field, value.trim()])
      .filter(
        ([field, value]) =>
          value !== initialValues[field as keyof ProfileEditValues]
      )
  ) as Partial<ProfileEditValues>;
}

function validateProfileEditValues(values: ProfileEditValues) {
  const errors: ProfileEditErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const phone = values.phone.trim();

  if (name.length === 0) {
    errors.name = "Імʼя не може бути порожнім.";
  }

  if (email.length === 0) {
    errors.email = "Пошта не може бути порожньою.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Введіть коректну пошту.";
  }

  if (phone.length > 0 && !/^\+?[0-9\s()-]{7,20}$/.test(phone)) {
    errors.phone = "Введіть коректний номер телефону.";
  }

  return errors;
}
