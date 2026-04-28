import { z } from "zod";
import type {
  RegisterFieldName,
  RegisterFormErrors,
  RegisterFormValues,
} from "@/src/features/auth/register/register.types";

const fieldMessages = {
  name: {
    required: "Введіть імʼя.",
    invalid: "Введіть коректне імʼя.",
  },
  email: {
    required: "Введіть пошту.",
    invalid: "Введіть коректну пошту.",
  },
  password: {
    required: "Введіть пароль.",
    invalid: "Пароль має містити щонайменше 6 символів.",
  },
  confirmPassword: {
    required: "Підтвердіть пароль.",
    invalid: "Паролі не співпадають.",
  },
} satisfies Record<RegisterFieldName, { required: string; invalid: string }>;

const trimmedString = (requiredMessage: string) =>
  z.string().trim().min(1, requiredMessage);

export const registerFormSchema = z
  .object({
    name: trimmedString(fieldMessages.name.required).min(
      2,
      fieldMessages.name.invalid,
    ),
    email: trimmedString(fieldMessages.email.required).email(
      fieldMessages.email.invalid,
    ),
    password: trimmedString(fieldMessages.password.required).min(
      6,
      fieldMessages.password.invalid,
    ),
    confirmPassword: trimmedString(fieldMessages.confirmPassword.required),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: fieldMessages.confirmPassword.invalid,
    path: ["confirmPassword"],
  });

export function normalizeRegisterValues(values: RegisterFormValues) {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    password: values.password,
    confirmPassword: values.confirmPassword,
  };
}

export function getRegisterFieldError(
  values: RegisterFormValues,
  fieldName: RegisterFieldName,
) {
  const result = registerFormSchema.safeParse(normalizeRegisterValues(values));

  if (result.success) {
    return undefined;
  }

  return result.error.flatten().fieldErrors[fieldName]?.[0];
}

export function getRegisterFormErrors(values: RegisterFormValues) {
  const result = registerFormSchema.safeParse(normalizeRegisterValues(values));

  if (result.success) {
    return {};
  }

  const fieldErrors = result.error.flatten().fieldErrors;

  return Object.fromEntries(
    Object.entries(fieldErrors)
      .filter(([, errors]) => Array.isArray(errors) && errors.length > 0)
      .map(([fieldName, errors]) => [fieldName, errors[0]]),
  ) as RegisterFormErrors;
}
