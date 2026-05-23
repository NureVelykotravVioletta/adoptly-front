"use server";

import { ApiError } from "@/src/lib/api";
import { googleLogin } from "@/src/features/auth/auth.api";
import { setAuthSession } from "@/src/features/auth/auth.session";

export type GoogleAuthActionState = {
  success?: boolean;
  error?: string;
};

export async function googleAuthAction(
  idToken: string,
): Promise<GoogleAuthActionState> {
  if (!idToken) {
    return { error: "Не вдалося отримати токен від Google." };
  }

  try {
    const response = await googleLogin(idToken);

    await setAuthSession(response);

    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message };
    }

    return { error: "Не вдалося увійти через Google. Спробуйте ще раз." };
  }
}
