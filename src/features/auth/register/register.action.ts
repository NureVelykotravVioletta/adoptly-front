"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, register } from "@/src/features/auth/auth.api";
import { registerFormSchema } from "@/src/features/auth/register/register.schema";
import type { RegisterActionState } from "@/src/features/auth/register/register.types";

function getStringValue(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

export async function registerAction(
  _prevState: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  const parsed = registerFormSchema.safeParse({
    name: getStringValue(formData, "name"),
    email: getStringValue(formData, "email"),
    password: getStringValue(formData, "password"),
    confirmPassword: getStringValue(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      error: "Форма містить помилки. Перевірте поля.",
      fieldErrors: Object.fromEntries(
        Object.entries(fieldErrors)
          .filter(([, errors]) => Array.isArray(errors) && errors.length > 0)
          .map(([fieldName, errors]) => [fieldName, errors[0]]),
      ),
    };
  }

  let redirectPath: string | null = null;

  try {
    const response = await register({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
    });

    const cookieStore = await cookies();

    cookieStore.set("auth_token", response.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    cookieStore.set("user_role", response.user.role, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    redirectPath = "/profile";
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        error: error.message,
        fieldErrors: {},
      };
    }

    return {
      error: "Сталася непередбачена помилка. Спробуйте ще раз.",
      fieldErrors: {},
    };
  }

  redirect(redirectPath);
}
