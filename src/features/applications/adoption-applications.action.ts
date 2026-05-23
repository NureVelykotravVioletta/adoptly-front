"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/src/lib/api";
import { getStringValue } from "@/src/lib/action-utils";
import { getAuthToken, getCurrentUser } from "@/src/features/auth/auth.session";
import { createAdoptionApplication } from "@/src/features/applications/applications.api";
import { addLocalAdoptionApplication } from "@/src/features/applications/applications.session";
import type { AdoptionApplication } from "@/src/features/applications/applications.api";

export type SubmitAdoptionApplicationActionState = {
  success?: boolean;
  error?: string;
};

export async function submitAdoptionApplicationAction(
  formData: FormData
): Promise<SubmitAdoptionApplicationActionState> {
  const token = await getAuthToken();

  if (!token) {
    return { error: "Потрібно увійти в акаунт, щоб подати заявку." };
  }

  const user = await getCurrentUser();

  if (!user) {
    return { error: "Потрібно увійти в акаунт, щоб подати заявку." };
  }

  const animalId = getStringValue(formData, "animalId");
  const message = getStringValue(formData, "message");

  if (!animalId) {
    return { error: "Не вдалося визначити тварину для заявки." };
  }

  if (message && message.length > 1000) {
    return { error: "Повідомлення має бути не довше 1000 символів." };
  }

  console.log("[adoption] submitting", { animalId, message });

  try {
    const application = await createAdoptionApplication(token, {
      animalId,
      message: message || undefined,
    });
    const submittedApplication =
      application ??
      createLocalApplication({ animalId, message, userId: user.id });

    await addLocalAdoptionApplication(user.id, submittedApplication);

    revalidatePath("/profile");
    revalidatePath(`/animals/${animalId}`);

    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message };
    }

    return { error: "Сталася непередбачена помилка. Спробуйте ще раз." };
  }
}

function createLocalApplication({
  animalId,
  message,
  userId,
}: {
  animalId: string;
  message: string;
  userId: string;
}): AdoptionApplication {
  const createdAt = new Date().toISOString();

  return {
    id: `local-${animalId}-${createdAt}`,
    message: message || null,
    status: "PENDING",
    userId,
    user: null,
    animalId,
    animal: null,
    createdAt,
    updatedAt: createdAt,
  };
}
