"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/src/features/auth/auth.api";
import { isAdminUser } from "@/src/features/auth/auth.roles";
import { getAuthToken, getCurrentUser } from "@/src/features/auth/auth.session";
import {
  createAnimal,
  deleteAnimalPhoto,
  deleteAnimal,
  removeAnimalFromShelter,
  updateAnimal,
  uploadAnimalPhoto,
} from "@/src/features/animals/animals.api";
import type {
  Animal,
  CreateAnimalPayload,
  UpdateAnimalPayload,
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

export type UpdateAnimalActionState = {
  animal?: Animal | null;
  error?: string;
};

export type UploadAnimalPhotoActionState = {
  animal?: Animal | null;
  error?: string;
};

export type DeleteAnimalPhotoActionState = {
  success?: boolean;
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

export async function updateAnimalAction(
  animalId: string,
  formData: FormData
): Promise<UpdateAnimalActionState> {
  const token = await getAuthToken();
  const user = await getCurrentUser();

  if (!token || !isAdminUser(user)) {
    return { error: "Недостатньо прав для редагування тварини." };
  }

  const payload = getUpdateAnimalPayload(formData);

  if ("error" in payload) {
    return { error: payload.error };
  }

  if (Object.keys(payload.data).length === 0) {
    return {};
  }

  try {
    const animal = await updateAnimal(token, animalId, payload.data);

    revalidatePath("/animals");
    revalidatePath(`/animals/${animalId}`);
    revalidatePath(`/animals/${animalId}/edit`);

    return { animal };
  } catch (error) {
    return {
      error:
        error instanceof ApiError
          ? error.message
          : "Не вдалося зберегти зміни тварини.",
    };
  }
}

export async function uploadAnimalPhotoAction(
  animalId: string,
  formData: FormData
): Promise<UploadAnimalPhotoActionState> {
  const token = await getAuthToken();
  const user = await getCurrentUser();

  if (!token || !isAdminUser(user)) {
    return { error: "Недостатньо прав для додавання фото тварини." };
  }

  const image = getOptionalImage(formData);

  if ("error" in image) {
    return { error: image.error };
  }

  if (!image.file) {
    return { error: "Оберіть фото для завантаження." };
  }

  try {
    const animal = await uploadAnimalPhoto(token, animalId, image.file);

    revalidatePath("/animals");
    revalidatePath(`/animals/${animalId}`);
    revalidatePath(`/animals/${animalId}/edit`);

    return { animal };
  } catch (error) {
    return {
      error:
        error instanceof ApiError
          ? error.message
          : "Не вдалося завантажити фото тварини.",
    };
  }
}

export async function deleteAnimalPhotoAction(
  animalId: string,
  photoUrl: string
): Promise<DeleteAnimalPhotoActionState> {
  const token = await getAuthToken();
  const user = await getCurrentUser();

  if (!token || !isAdminUser(user)) {
    return { error: "Недостатньо прав для видалення фото тварини." };
  }

  try {
    await deleteAnimalPhoto(token, animalId, photoUrl);

    revalidatePath("/animals");
    revalidatePath(`/animals/${animalId}`);
    revalidatePath(`/animals/${animalId}/edit`);

    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof ApiError
          ? error.message
          : "Не вдалося видалити фото тварини.",
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
  const healthStatus = getStringValue(formData, "healthStatus");
  const description = getStringValue(formData, "description");

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

  if (!healthStatus) {
    return { error: "Стан здоровʼя тварини не може бути порожнім." };
  }

  if (!description) {
    return { error: "Опис тварини не може бути порожнім." };
  }

  const payload: CreateAnimalPayload = {
    name,
    type,
    age: numericAge,
    gender,
    shelterId,
    healthStatus,
    description,
  };
  const optionalFields = ["breed"] as const;

  optionalFields.forEach((field) => {
    const value = getStringValue(formData, field);

    if (value) {
      payload[field] = value;
    }
  });

  return { data: payload };
}

function getUpdateAnimalPayload(
  formData: FormData
): { data: UpdateAnimalPayload } | { error: string } {
  const payload: UpdateAnimalPayload = {};

  if (formData.has("name")) {
    const name = getStringValue(formData, "name");

    if (!name) {
      return { error: "Імʼя тварини не може бути порожнім." };
    }

    payload.name = name;
  }

  if (formData.has("type")) {
    const type = getStringValue(formData, "type");

    if (!type) {
      return { error: "Категорія тварини не може бути порожньою." };
    }

    payload.type = type;
  }

  if (formData.has("age")) {
    const age = getStringValue(formData, "age");

    if (!age) {
      return { error: "Вік тварини не може бути порожнім." };
    }

    const numericAge = Number(age);

    if (!Number.isInteger(numericAge) || numericAge < 0) {
      return { error: "Вік має бути числом." };
    }

    payload.age = numericAge;
  }

  if (formData.has("gender")) {
    const gender = getStringValue(formData, "gender");

    if (!gender) {
      return { error: "Стать тварини не може бути порожньою." };
    }

    payload.gender = gender;
  }

  if (formData.has("healthStatus")) {
    const healthStatus = getStringValue(formData, "healthStatus");

    if (!healthStatus) {
      return { error: "Стан здоровʼя тварини не може бути порожнім." };
    }

    payload.healthStatus = healthStatus;
  }

  if (formData.has("description")) {
    const description = getStringValue(formData, "description");

    if (!description) {
      return { error: "Опис тварини не може бути порожнім." };
    }

    payload.description = description;
  }

  if (formData.has("breed")) {
    payload.breed = getStringValue(formData, "breed");
  }

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
