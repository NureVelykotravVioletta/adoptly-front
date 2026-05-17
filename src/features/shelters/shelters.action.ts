"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/src/features/auth/auth.api";
import { isAdminUser } from "@/src/features/auth/auth.roles";
import { getAuthToken, getCurrentUser } from "@/src/features/auth/auth.session";
import {
  deleteShelter,
  updateShelter,
  uploadShelterPhoto,
} from "@/src/features/shelters/shelters.api";
import type {
  Shelter,
  UpdateShelterPayload,
} from "@/src/features/shelters/shelters.api";

export type DeleteShelterActionState = {
  success?: boolean;
  error?: string;
};

export type UpdateShelterActionState = {
  shelter?: Shelter | null;
  error?: string;
};

export type UploadShelterPhotoActionState = {
  shelter?: Shelter | null;
  error?: string;
};

const MAX_SHELTER_PHOTO_SIZE = 5 * 1024 * 1024;

export async function deleteShelterAction(
  shelterId: string
): Promise<DeleteShelterActionState> {
  const token = await getAuthToken();
  const user = await getCurrentUser();

  if (!token || !isAdminUser(user)) {
    return { error: "Недостатньо прав для видалення притулку." };
  }

  try {
    await deleteShelter(token, shelterId);

    revalidatePath("/shelters");
    revalidatePath(`/shelters/${shelterId}`);

    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof ApiError
          ? error.message
          : "Не вдалося видалити притулок.",
    };
  }
}

export async function updateShelterAction(
  shelterId: string,
  formData: FormData
): Promise<UpdateShelterActionState> {
  const token = await getAuthToken();
  const user = await getCurrentUser();

  if (!token || !isAdminUser(user)) {
    return { error: "Недостатньо прав для редагування притулку." };
  }

  const payload = getUpdateShelterPayload(formData);

  if ("error" in payload) {
    return { error: payload.error };
  }

  if (Object.keys(payload.data).length === 0) {
    return {};
  }

  try {
    const shelter = await updateShelter(token, shelterId, payload.data);

    revalidatePath("/shelters");
    revalidatePath(`/shelters/${shelterId}`);

    return { shelter };
  } catch (error) {
    return {
      error:
        error instanceof ApiError
          ? error.message
          : "Не вдалося зберегти зміни притулку.",
    };
  }
}

export async function uploadShelterPhotoAction(
  shelterId: string,
  formData: FormData
): Promise<UploadShelterPhotoActionState> {
  const token = await getAuthToken();
  const user = await getCurrentUser();

  if (!token || !isAdminUser(user)) {
    return { error: "Недостатньо прав для додавання фото притулку." };
  }

  const file = formData.get("image") ?? formData.get("file") ?? formData.get("photo");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Оберіть фото для завантаження." };
  }

  if (!file.type.startsWith("image/")) {
    return { error: "Файл має бути зображенням." };
  }

  if (file.size > MAX_SHELTER_PHOTO_SIZE) {
    return { error: "Фото має бути не більше 5MB." };
  }

  try {
    const shelter = await uploadShelterPhoto(token, shelterId, file);

    revalidatePath("/shelters");
    revalidatePath(`/shelters/${shelterId}`);
    revalidatePath(`/shelters/${shelterId}/edit`);

    return { shelter };
  } catch (error) {
    return {
      error:
        error instanceof ApiError
          ? error.message
          : "Не вдалося завантажити фото притулку.",
    };
  }
}

function getUpdateShelterPayload(
  formData: FormData
): { data: UpdateShelterPayload } | { error: string } {
  const payload: UpdateShelterPayload = {};
  const stringFields = [
    "name",
    "city",
    "address",
    "description",
    "phone",
    "email",
    "workingHours",
    "foundedAt",
  ] as const;

  stringFields.forEach((field) => {
    const value = getOptionalStringValue(formData, field);

    if (value !== null) {
      payload[field] = value;
    }
  });

  const imageUrl = getOptionalStringValue(formData, "imageUrl");

  if (imageUrl !== null) {
    payload.imageUrl = imageUrl.length > 0 ? imageUrl : null;
  }

  const images = formData
    .getAll("images")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);

  if (formData.has("images")) {
    payload.images = images;
    payload.imageUrl = images[0] ?? null;
  }

  if (payload.name !== undefined && payload.name.length === 0) {
    return { error: "Назва притулку не може бути порожньою." };
  }

  if (payload.city !== undefined && payload.city.length === 0) {
    return { error: "Місто не може бути порожнім." };
  }

  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return { error: "Введіть коректну пошту притулку." };
  }

  return { data: payload };
}

function getOptionalStringValue(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : null;
}
