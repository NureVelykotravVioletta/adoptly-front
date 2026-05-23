"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/src/lib/api";
import { requireAdmin } from "@/src/lib/action-utils";
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
  const auth = await requireAdmin();

  if ("error" in auth) {
    return { error: "Недостатньо прав для зміни статусу заявки." };
  }

  const { token } = auth;

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
