"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ApiError,
  updateProfile,
  uploadAvatar,
} from "@/src/features/auth/auth.api";
import type { UpdateProfilePayload } from "@/src/features/auth/auth.api";
import {
  clearAuthSession,
  getAuthToken,
} from "@/src/features/auth/auth.session";

export type UploadAvatarActionState = {
  avatarUrl?: string;
  error?: string;
};

export type UpdateProfileActionState = {
  error?: string;
};

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export async function logoutAction() {
  await clearAuthSession();

  redirect("/login");
}

export async function uploadAvatarAction(
  formData: FormData,
): Promise<UploadAvatarActionState> {
  const token = await getAuthToken();

  if (!token) {
    return { error: "Потрібно увійти в акаунт." };
  }

  const file =
    formData.get("image") ??
    formData.get("avatarUrl") ??
    formData.get("file") ??
    formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Оберіть фото для завантаження." };
  }

  if (!file.type.startsWith("image/")) {
    return { error: "Файл має бути зображенням." };
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return { error: "Фото має бути не більше 5MB." };
  }

  try {
    const result = await uploadAvatar(token, file);

    revalidatePath("/profile");

    return { avatarUrl: result.avatarUrl ?? undefined };
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message };
    }

    return { error: "Сталася непередбачена помилка. Спробуйте ще раз." };
  }
}

export async function updateProfileAction(
  formData: FormData,
): Promise<UpdateProfileActionState> {
  const token = await getAuthToken();

  if (!token) {
    return { error: "Потрібно увійти в акаунт." };
  }

  const payload: UpdateProfilePayload = {};
  const name = getOptionalStringValue(formData, "name");
  const email = getOptionalStringValue(formData, "email");
  const phone = getOptionalStringValue(formData, "phone");

  if (name !== null) {
    if (name.length === 0) {
      return { error: "Імʼя не може бути порожнім." };
    }

    payload.name = name;
  }

  if (email !== null) {
    if (email.length === 0) {
      return { error: "Пошта не може бути порожньою." };
    }

    payload.email = email;
  }

  if (phone !== null) {
    payload.phone = phone.length > 0 ? phone : null;
  }

  if (Object.keys(payload).length === 0) {
    return {};
  }

  try {
    await updateProfile(token, payload);
    revalidatePath("/profile");

    return {};
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message };
    }

    return { error: "Сталася непередбачена помилка. Спробуйте ще раз." };
  }
}

function getOptionalStringValue(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : null;
}
