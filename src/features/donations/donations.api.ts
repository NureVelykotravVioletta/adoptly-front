import {
  ApiError,
  createApiUrl,
  getApiErrorMessage,
  isRecord,
  safeParseJson,
} from "@/src/lib/api";

export type CreateDonationCheckoutPayload = {
  shelterId: string;
  amount: number;
};

export async function createDonationCheckout(
  payload: CreateDonationCheckoutPayload
): Promise<string> {
  let response: Response;

  try {
    response = await fetch(createApiUrl("/donations/checkout"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("[donations] checkout fetch failed:", error);
    throw new ApiError(
      "Не вдалося з'єднатися із сервером оплати. Спробуйте пізніше.",
      0
    );
  }

  const responseText = await response.text().catch(() => "");
  const data = responseText ? safeParseJson(responseText) : null;

  if (!response.ok) {
    console.error(
      "[donations] checkout responded with",
      response.status,
      responseText
    );
    throw new ApiError(
      getApiErrorMessage(data, "Не вдалося створити платіж.", {
        responseText,
        status: response.status,
      }),
      response.status
    );
  }

  if (
    !isRecord(data) ||
    typeof data.url !== "string" ||
    data.url.length === 0
  ) {
    console.error(
      "[donations] checkout returned unexpected payload:",
      responseText
    );
    throw new ApiError(
      "Сервер не повернув посилання на оплату.",
      response.status
    );
  }

  return data.url;
}
