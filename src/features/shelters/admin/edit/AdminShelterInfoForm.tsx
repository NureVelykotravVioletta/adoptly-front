"use client";

import type { Shelter } from "@/src/features/shelters/shelters.api";

export type ShelterInfoValues = {
  name: string;
  city: string;
  address: string;
  description: string;
  phone: string;
  email: string;
  workingHours: string;
  foundedAt: string;
};

export type ShelterInfoFieldName = keyof ShelterInfoValues;
export type ShelterInfoErrors = Partial<Record<ShelterInfoFieldName, string>>;
export type ShelterInfoTouched = Partial<Record<ShelterInfoFieldName, boolean>>;

const fieldLabels: Record<ShelterInfoFieldName, string> = {
  name: "Назва",
  city: "Місто",
  address: "Адреса",
  description: "Опис",
  phone: "Телефон",
  email: "Email",
  workingHours: "Години роботи",
  foundedAt: "Рік заснування",
};

type AdminShelterInfoFormProps = {
  values: ShelterInfoValues;
  touchedFields: ShelterInfoTouched;
  fieldErrors: ShelterInfoErrors;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onBlur: (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};

export function AdminShelterInfoForm({
  values,
  touchedFields,
  fieldErrors,
  onChange,
  onBlur,
}: AdminShelterInfoFormProps) {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ShelterInfoInput
          name="name"
          value={values.name}
          error={touchedFields.name ? fieldErrors.name : undefined}
          required
          onChange={onChange}
          onBlur={onBlur}
        />
        <ShelterInfoInput
          name="city"
          value={values.city}
          error={touchedFields.city ? fieldErrors.city : undefined}
          required
          onChange={onChange}
          onBlur={onBlur}
        />
        <ShelterInfoInput
          name="address"
          value={values.address}
          error={touchedFields.address ? fieldErrors.address : undefined}
          onChange={onChange}
          onBlur={onBlur}
        />
        <ShelterInfoInput
          name="phone"
          type="tel"
          value={values.phone}
          error={touchedFields.phone ? fieldErrors.phone : undefined}
          onChange={onChange}
          onBlur={onBlur}
        />
        <ShelterInfoInput
          name="email"
          type="email"
          value={values.email}
          error={touchedFields.email ? fieldErrors.email : undefined}
          onChange={onChange}
          onBlur={onBlur}
        />
        <ShelterInfoInput
          name="workingHours"
          value={values.workingHours}
          error={
            touchedFields.workingHours ? fieldErrors.workingHours : undefined
          }
          onChange={onChange}
          onBlur={onBlur}
        />
        <ShelterInfoInput
          name="foundedAt"
          value={values.foundedAt}
          error={touchedFields.foundedAt ? fieldErrors.foundedAt : undefined}
          onChange={onChange}
          onBlur={onBlur}
        />
      </div>

      <div className="mt-4">
        <ShelterInfoTextarea
          name="description"
          value={values.description}
          error={touchedFields.description ? fieldErrors.description : undefined}
          onChange={onChange}
          onBlur={onBlur}
        />
      </div>
    </div>
  );
}

type ShelterInfoInputProps = {
  name: ShelterInfoFieldName;
  value: string;
  type?: React.HTMLInputTypeAttribute;
  required?: boolean;
  error?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
};

function ShelterInfoInput({
  name,
  value,
  type = "text",
  required = false,
  error,
  onChange,
  onBlur,
}: ShelterInfoInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block px-5 text-sm font-semibold">
        {fieldLabels[name]}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        placeholder={fieldLabels[name]}
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

type ShelterInfoTextareaProps = {
  name: "description";
  value: string;
  error?: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
};

function ShelterInfoTextarea({
  name,
  value,
  error,
  onChange,
  onBlur,
}: ShelterInfoTextareaProps) {
  return (
    <label className="block">
      <span className="mb-2 block px-5 text-sm font-semibold">
        {fieldLabels[name]}
      </span>
      <textarea
        name={name}
        value={value}
        placeholder={fieldLabels[name]}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        onChange={onChange}
        onBlur={onBlur}
        className="min-h-36 w-full resize-none rounded-3xl border border-[#8456F0] bg-white px-5 py-4 text-base leading-6 text-[#262626] outline-none placeholder:text-[#9CA3AF] focus:border-[#7045D1] focus:placeholder:text-transparent aria-invalid:border-rose-500"
      />
      {error ? (
        <p id={`${name}-error`} className="mt-2 px-5 text-sm text-rose-600">
          {error}
        </p>
      ) : null}
    </label>
  );
}

export function getShelterInfoValues(shelter: Shelter): ShelterInfoValues {
  return {
    name: shelter.name,
    city: shelter.city,
    address: shelter.address,
    description: shelter.description,
    phone: shelter.phone,
    email: shelter.email,
    workingHours: shelter.workingHours,
    foundedAt: shelter.foundedAt,
  };
}

export function getChangedInfoValues(
  initialValues: ShelterInfoValues,
  values: ShelterInfoValues
) {
  return Object.fromEntries(
    Object.entries(values)
      .map(([field, value]) => [field, value.trim()])
      .filter(
        ([field, value]) =>
          value !== initialValues[field as ShelterInfoFieldName]
      )
  ) as Partial<ShelterInfoValues>;
}

export function validateShelterInfoValues(values: ShelterInfoValues) {
  const errors: ShelterInfoErrors = {};

  if (values.name.trim().length === 0) {
    errors.name = "Назва притулку не може бути порожньою.";
  }

  if (values.city.trim().length === 0) {
    errors.city = "Місто не може бути порожнім.";
  }

  if (
    values.email.trim().length > 0 &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
  ) {
    errors.email = "Введіть коректну пошту.";
  }

  return errors;
}
