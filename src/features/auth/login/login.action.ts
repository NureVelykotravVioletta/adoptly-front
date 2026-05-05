"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, login } from "@/src/features/auth/auth.api";
import { loginFormSchema } from "@/src/features/auth/login/login.schema";
import type { LoginActionState } from "@/src/features/auth/login/login.types";

function getStringValue(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginFormSchema.safeParse({
    email: getStringValue(formData, "email"),
    password: getStringValue(formData, "password"),
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
    const response = await login({
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
      if (error.status === 404) {
        return {
          error: "Акаунт з такою поштою не знайдено.",
          fieldErrors: {},
        };
      }

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
