"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/src/features/auth/auth.api";
import { isAdminUser } from "@/src/features/auth/auth.roles";
import { getAuthToken, getCurrentUser } from "@/src/features/auth/auth.session";
import {
  createAnimal,
  deleteAnimal,
  removeAnimalFromShelter,
} from "@/src/features/animals/animals.api";
import type {
  Animal,
  CreateAnimalPayload,
} from "@/src/features/animals/animals.api";

export type DeleteAnimalActionState = {
  success?: boolean;
  error?: string;
};

export type CreateAnimalActionState = {
  success?: boolean;
  animal?: Animal | null;
  error?: string;
};

export type RemoveShelterAnimalActionState = {
  success?: boolean;
  error?: string;
};

const MAX_ANIMAL_PHOTO_SIZE = 5 * 1024 * 1024;

export async function createAnimalAction(
  formData: FormData
): Promise<CreateAnimalActionState> {
  const token = await getAuthToken();
  const user = await getCurrentUser();

  if (!token || !isAdminUser(user)) {
    return { error: "Недостатньо прав для створення тварини." };
  }

  const payload = getCreateAnimalPayload(formData);

  if ("error" in payload) {
    return { error: payload.error };
  }

  const image = getOptionalImage(formData);

  if ("error" in image) {
    return { error: image.error };
  }

  try {
    const animal = await createAnimal(token, payload.data, image.file);

    revalidatePath("/animals");
    revalidatePath(`/shelters/${payload.data.shelterId}`);
    revalidatePath(`/shelters/${payload.data.shelterId}/edit`);

    return { success: true, animal };
  } catch (error) {
    return {
      error:
        error instanceof ApiError
          ? error.message
          : "Не вдалося створити тварину.",
    };
  }
}

export async function deleteAnimalAction(
  animalId: string,
  shelterId?: string | null
): Promise<DeleteAnimalActionState> {
  const token = await getAuthToken();
  const user = await getCurrentUser();

  if (!token || !isAdminUser(user)) {
    return { error: "Недостатньо прав для видалення тварини." };
  }

  try {
    await deleteAnimal(token, animalId);

    revalidatePath("/animals");
    revalidatePath(`/animals/${animalId}`);

    if (shelterId) {
      revalidatePath(`/shelters/${shelterId}`);
      revalidatePath(`/shelters/${shelterId}/edit`);
    }

    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof ApiError
          ? error.message
          : "Не вдалося видалити тварину.",
    };
  }
}

function getCreateAnimalPayload(
  formData: FormData
): { data: CreateAnimalPayload } | { error: string } {
  const name = getStringValue(formData, "name");
  const type = getStringValue(formData, "type");
  const age = getStringValue(formData, "age");
  const gender = getStringValue(formData, "gender");
  const shelterId = getStringValue(formData, "shelterId");

  if (!name) {
    return { error: "Імʼя тварини не може бути порожнім." };
  }

  if (!type) {
    return { error: "Категорія тварини не може бути порожньою." };
  }

  if (!age) {
    return { error: "Вік тварини не може бути порожнім." };
  }

  const numericAge = Number(age);

  if (!Number.isInteger(numericAge) || numericAge < 0) {
    return { error: "Вік має бути числом." };
  }

  if (!gender) {
    return { error: "Стать тварини не може бути порожньою." };
  }

  if (!shelterId) {
    return { error: "Не вдалося визначити притулок для тварини." };
  }

  const payload: CreateAnimalPayload = {
    name,
    type,
    age: numericAge,
    gender,
    shelterId,
  };
  const optionalFields = ["breed", "description", "healthStatus"] as const;

  optionalFields.forEach((field) => {
    const value = getStringValue(formData, field);

    if (value) {
      payload[field] = value;
    }
  });

  return { data: payload };
}

function getOptionalImage(
  formData: FormData
): { file: File | null } | { error: string } {
  const file =
    formData.get("image") ??
    formData.get("photo") ??
    formData.get("file") ??
    formData.get("photos") ??
    formData.get("images");

  if (!(file instanceof File) || file.size === 0) {
    return { file: null };
  }

  if (!file.type.startsWith("image/")) {
    return { error: "Файл має бути зображенням." };
  }

  if (file.size > MAX_ANIMAL_PHOTO_SIZE) {
    return { error: "Фото має бути не більше 5MB." };
  }

  return { file };
}

function getStringValue(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

export async function removeShelterAnimalAction(
  shelterId: string,
  animalId: string
): Promise<RemoveShelterAnimalActionState> {
  const token = await getAuthToken();
  const user = await getCurrentUser();

  if (!token || !isAdminUser(user)) {
    return { error: "Недостатньо прав для видалення тварини з притулку." };
  }

  try {
    await removeAnimalFromShelter(token, shelterId, animalId);

    revalidatePath("/animals");
    revalidatePath(`/animals/${animalId}`);
    revalidatePath(`/shelters/${shelterId}`);
    revalidatePath(`/shelters/${shelterId}/edit`);

    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof ApiError
          ? error.message
          : "Не вдалося прибрати тварину з притулку.",
    };
  }
}
