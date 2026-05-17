"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/src/features/auth/auth.api";
import { isAdminUser } from "@/src/features/auth/auth.roles";
import { getAuthToken, getCurrentUser } from "@/src/features/auth/auth.session";
import { deleteAnimal } from "@/src/features/animals/animals.api";

export type DeleteAnimalActionState = {
  success?: boolean;
  error?: string;
};

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
