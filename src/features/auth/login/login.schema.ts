import { z } from "zod";
import type {
  LoginFieldName,
  LoginFormErrors,
  LoginFormValues,
} from "@/src/features/auth/login/login.types";

const fieldMessages = {
  email: {
    required: "Введіть пошту.",
    invalid: "Введіть коректну пошту.",
  },
  password: {
    required: "Введіть пароль.",
    invalid: "Пароль має містити щонайменше 6 символів.",
  },
} satisfies Record<LoginFieldName, { required: string; invalid: string }>;

const trimmedString = (requiredMessage: string) =>
  z.string().trim().min(1, requiredMessage);

export const loginFormSchema = z.object({
  email: trimmedString(fieldMessages.email.required).email(
    fieldMessages.email.invalid,
  ),
  password: trimmedString(fieldMessages.password.required).min(
    6,
    fieldMessages.password.invalid,
  ),
});

export function normalizeLoginValues(values: LoginFormValues) {
  return {
    email: values.email.trim(),
    password: values.password,
  };
}

export function getLoginFieldError(
  values: LoginFormValues,
  fieldName: LoginFieldName,
) {
  const result = loginFormSchema.safeParse(normalizeLoginValues(values));

  if (result.success) {
    return undefined;
  }

  return result.error.flatten().fieldErrors[fieldName]?.[0];
}

export function getLoginFormErrors(values: LoginFormValues) {
  const result = loginFormSchema.safeParse(normalizeLoginValues(values));

  if (result.success) {
    return {};
  }

  const fieldErrors = result.error.flatten().fieldErrors;

  return Object.fromEntries(
    Object.entries(fieldErrors)
      .filter(([, errors]) => Array.isArray(errors) && errors.length > 0)
      .map(([fieldName, errors]) => [fieldName, errors[0]]),
  ) as LoginFormErrors;
}
