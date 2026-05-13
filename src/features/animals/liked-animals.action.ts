"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/src/features/auth/auth.api";
import { getAuthToken } from "@/src/features/auth/auth.session";
import { setLikedAnimal } from "@/src/features/animals/animals.api";

export type ToggleLikedAnimalActionState = {
  liked: boolean;
  error?: string;
};

export async function toggleLikedAnimalAction({
  animalId,
  liked,
}: {
  animalId: string;
  liked: boolean;
}): Promise<ToggleLikedAnimalActionState> {
  const token = await getAuthToken();

  if (!token) {
    return {
      liked: !liked,
      error: "Потрібно увійти в акаунт, щоб додавати тварин в обрані.",
    };
  }

  try {
    await setLikedAnimal(token, animalId, liked);

    revalidatePath("/animals");
    revalidatePath(`/animals/${animalId}`);
    revalidatePath("/profile");

    return { liked };
  } catch (error) {
    return {
      liked: !liked,
      error:
        error instanceof ApiError
          ? error.message
          : "Не вдалося оновити обрані тварини.",
    };
  }
}
