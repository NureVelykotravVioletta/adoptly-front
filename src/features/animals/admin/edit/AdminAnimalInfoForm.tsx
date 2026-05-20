"use client";

import type { Animal } from "@/src/features/animals/animals.api";

export type AnimalInfoValues = {
  name: string;
  type: string;
  breed: string;
  age: string;
  gender: string;
  healthStatus: string;
  description: string;
};

export type AnimalInfoFieldName = keyof AnimalInfoValues;
export type AnimalInfoErrors = Partial<Record<AnimalInfoFieldName, string>>;
export type AnimalInfoTouched = Partial<Record<AnimalInfoFieldName, boolean>>;

const fieldLabels: Record<AnimalInfoFieldName, string> = {
  name: "Імʼя",
  type: "Категорія",
  breed: "Порода",
  age: "Вік",
  gender: "Стать",
  healthStatus: "Стан здоровʼя",
  description: "Опис",
};

const categoryOptions = [
  { value: "CAT", label: "Кіт" },
  { value: "DOG", label: "Собака" },
];

const genderOptions = [
  { value: "FEMALE", label: "Самка" },
  { value: "MALE", label: "Самець" },
];

type AdminAnimalInfoFormProps = {
  values: AnimalInfoValues;
  touchedFields: AnimalInfoTouched;
  fieldErrors: AnimalInfoErrors;
  onChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onBlur: (
    event: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
};

export function AdminAnimalInfoForm({
  values,
  touchedFields,
  fieldErrors,
  onChange,
  onBlur,
}: AdminAnimalInfoFormProps) {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <AnimalInfoInput
          name="name"
          value={values.name}
          error={touchedFields.name ? fieldErrors.name : undefined}
          required
          onChange={onChange}
          onBlur={onBlur}
        />
        <AnimalInfoSelect
          name="type"
          value={values.type}
          options={categoryOptions}
          error={touchedFields.type ? fieldErrors.type : undefined}
          required
          onChange={onChange}
          onBlur={onBlur}
        />
        <AnimalInfoInput
          name="breed"
          value={values.breed}
          error={touchedFields.breed ? fieldErrors.breed : undefined}
          onChange={onChange}
          onBlur={onBlur}
        />
        <AnimalInfoInput
          name="age"
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          value={values.age}
          error={touchedFields.age ? fieldErrors.age : undefined}
          required
          onChange={onChange}
          onBlur={onBlur}
        />
        <AnimalInfoSelect
          name="gender"
          value={values.gender}
          options={genderOptions}
          error={touchedFields.gender ? fieldErrors.gender : undefined}
          required
          onChange={onChange}
          onBlur={onBlur}
        />
        <AnimalInfoInput
          name="healthStatus"
          value={values.healthStatus}
          error={
            touchedFields.healthStatus ? fieldErrors.healthStatus : undefined
          }
          required
          onChange={onChange}
          onBlur={onBlur}
        />
      </div>

      <div className="mt-4">
        <AnimalInfoTextarea
          name="description"
          value={values.description}
          error={touchedFields.description ? fieldErrors.description : undefined}
          required
          onChange={onChange}
          onBlur={onBlur}
        />
      </div>
    </div>
  );
}

type AnimalInfoInputProps = {
  name: Exclude<AnimalInfoFieldName, "description" | "type" | "gender">;
  value: string;
  type?: React.HTMLInputTypeAttribute;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  min?: number;
  step?: number;
  required?: boolean;
  error?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
};

function AnimalInfoInput({
  name,
  value,
  type = "text",
  inputMode,
  min,
  step,
  required = false,
  error,
  onChange,
  onBlur,
}: AnimalInfoInputProps) {
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

type AnimalInfoSelectProps = {
  name: "type" | "gender";
  value: string;
  options: { value: string; label: string }[];
  required?: boolean;
  error?: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLSelectElement>) => void;
};

function AnimalInfoSelect({
  name,
  value,
  options,
  required = false,
  error,
  onChange,
  onBlur,
}: AnimalInfoSelectProps) {
  return (
    <label className="block">
      <span className="mb-2 block px-5 text-sm font-semibold">
        {fieldLabels[name]}
      </span>
      <select
        name={name}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        required={required}
        onChange={onChange}
        onBlur={onBlur}
        className="h-15 w-full cursor-pointer appearance-none rounded-full border border-[#8456F0] bg-white px-5 text-base text-[#262626] outline-none transition focus:border-[#7045D1] aria-invalid:border-rose-500"
      >
        <option value="" disabled>
          {fieldLabels[name]}
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

type AnimalInfoTextareaProps = {
  name: "description";
  value: string;
  required?: boolean;
  error?: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
};

function AnimalInfoTextarea({
  name,
  value,
  required = false,
  error,
  onChange,
  onBlur,
}: AnimalInfoTextareaProps) {
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
        required={required}
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

export function getAnimalInfoValues(animal: Animal): AnimalInfoValues {
  return {
    name: animal.name,
    type: animal.categoryCode,
    breed: animal.breed ?? "",
    age: getNumericAgeValue(animal.age),
    gender: animal.genderCode,
    healthStatus: animal.healthStatus,
    description: animal.description,
  };
}

export function getChangedAnimalInfoValues(
  initialValues: AnimalInfoValues,
  values: AnimalInfoValues
) {
  return Object.fromEntries(
    Object.entries(values)
      .map(([field, value]) => [field, value.trim()])
      .filter(
        ([field, value]) =>
          value !== initialValues[field as AnimalInfoFieldName]
      )
  ) as Partial<AnimalInfoValues>;
}

export function validateAnimalInfoValues(values: AnimalInfoValues) {
  const errors: AnimalInfoErrors = {};

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

  if (values.healthStatus.trim().length === 0) {
    errors.healthStatus = "Стан здоровʼя тварини не може бути порожнім.";
  }

  if (values.description.trim().length === 0) {
    errors.description = "Опис тварини не може бути порожнім.";
  }

  return errors;
}

function getNumericAgeValue(age: string) {
  const match = age.match(/\d+/);
  return match?.[0] ?? "";
}
