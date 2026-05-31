export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getApiBaseUrl() {
  return (
    process.env.API_BASE_URL
  );
}

export function createApiUrl(pathname: string) {
  return new URL(pathname, getApiBaseUrl()).toString();
}

export function safeParseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizeImageUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  if (/^(https?:|data:|blob:)/.test(url)) {
    return url;
  }

  if (url.startsWith("/")) {
    return new URL(url, getApiBaseUrl()).toString();
  }

  return url;
}

export function getApiErrorMessage(
  data: unknown,
  fallbackMessage: string,
  options?: { responseText?: string; status?: number },
) {
  const message =
    data && typeof data === "object" && "message" in data ? data.message : null;

  if (typeof message === "string" && message.length > 0) {
    return message;
  }

  if (Array.isArray(message) && message.length > 0) {
    return message.join(", ");
  }

  const responseText = options?.responseText;

  if (
    responseText &&
    responseText.length > 0 &&
    responseText.length < 160 &&
    !isHtmlResponse(responseText)
  ) {
    return responseText;
  }

  if (options?.status !== undefined) {
    return `${fallbackMessage} Статус відповіді: ${options.status}.`;
  }

  return fallbackMessage;
}

function isHtmlResponse(responseText: string) {
  return /<(!doctype|html|head|body|pre)\b/i.test(responseText);
}
