"use server";

import { ApiError } from "@/src/lib/api";
import { createDonationCheckout } from "@/src/features/donations/donations.api";

export type CreateDonationCheckoutActionState = {
  url?: string;
  error?: string;
};

export async function createDonationCheckoutAction(
  shelterId: string,
  amount: number
): Promise<CreateDonationCheckoutActionState> {
  if (!shelterId.trim()) {
    return { error: "Не вдалося визначити притулок." };
  }

  if (!Number.isInteger(amount) || amount < 10) {
    return { error: "Сума має бути цілим числом не менше 10 ₴." };
  }

  try {
    const url = await createDonationCheckout({ shelterId, amount });

    return { url };
  } catch (error) {
    return {
      error:
        error instanceof ApiError
          ? error.message
          : "Не вдалося створити платіж.",
    };
  }
}
