"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/src/features/auth/auth.api";
import { isAdminUser } from "@/src/features/auth/auth.roles";
import { getAuthToken, getCurrentUser } from "@/src/features/auth/auth.session";
import {
  updateAdoptionApplicationStatus,
  type AdoptionApplication,
  type AdoptionApplicationStatus,
} from "@/src/features/applications/applications.api";

export type UpdateApplicationStatusActionState = {
  application?: AdoptionApplication | null;
  error?: string;
};

export async function updateApplicationStatusAction(
  applicationId: string,
  status: AdoptionApplicationStatus
): Promise<UpdateApplicationStatusActionState> {
  const token = await getAuthToken();
  const user = await getCurrentUser();

  if (!token || !isAdminUser(user)) {
    return { error: "Недостатньо прав для зміни статусу заявки." };
  }

  try {
    const application = await updateAdoptionApplicationStatus(
      token,
      applicationId,
      status
    );

    revalidatePath("/applications");

    return { application };
  } catch (error) {
    return {
      error:
        error instanceof ApiError
          ? error.message
          : "Не вдалося змінити статус заявки.",
    };
  }
}
