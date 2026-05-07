export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type UpdateProfilePayload = Partial<{
  name: string;
  email: string;
  phone: string | null;
}>;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
};

export type AuthResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const DEFAULT_API_BASE_URL = "http://localhost:5001";

export function getApiBaseUrl() {
  return (
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    DEFAULT_API_BASE_URL
  );
}

function createApiUrl(pathname: string) {
  return new URL(pathname, getApiBaseUrl()).toString();
}

export async function register(payload: RegisterPayload) {
  const response = await fetch(createApiUrl("/auth/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as
    | AuthResponse
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new ApiError(
      data?.message ?? "Не вдалося завершити реєстрацію",
      response.status,
    );
  }

  return data as AuthResponse;
}

export async function login(payload: LoginPayload) {
  const response = await fetch(createApiUrl("/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as
    | AuthResponse
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new ApiError(
      data?.message ?? "Не вдалося виконати вхід",
      response.status,
    );
  }

  return data as AuthResponse;
}

export async function getMe(token: string) {
  const response = await fetch(createApiUrl("/auth/me"), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as
    | AuthUser
    | { user?: AuthUser; message?: string }
    | null;

  if (!response.ok) {
    throw new ApiError(
      data && "message" in data && data.message
        ? data.message
        : "Не вдалося отримати дані користувача",
      response.status,
    );
  }

  if (data && "user" in data && data.user) {
    return data.user;
  }

  return data as AuthUser;
}

export async function updateProfile(
  token: string,
  payload: UpdateProfilePayload,
) {
  const requests = [
    { method: "PATCH", pathname: "/users/me" },
    { method: "PUT", pathname: "/users/me" },
    { method: "PATCH", pathname: "/auth/me" },
    { method: "PUT", pathname: "/auth/me" },
  ];
  let lastRouteError: ApiError | null = null;

  for (const request of requests) {
    try {
      return await requestUpdateProfile(token, payload, request);
    } catch (error) {
      if (error instanceof ApiError && isRouteNotFoundError(error)) {
        lastRouteError = error;
        continue;
      }

      throw error;
    }
  }

  throw (
    lastRouteError ??
    new ApiError("Не знайдено endpoint для оновлення профілю.", 404)
  );
}

async function requestUpdateProfile(
  token: string,
  payload: UpdateProfilePayload,
  request: { method: string; pathname: string },
) {
  const response = await fetch(createApiUrl(request.pathname), {
    method: request.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  const responseText = await response.text().catch(() => "");
  const data = (responseText ? safeParseJson(responseText) : null) as
    | AuthUser
    | { user?: AuthUser; message?: string }
    | null;

  if (!response.ok) {
    const errorMessage = getApiErrorMessage(
      data,
      responseText,
      response.status,
      "Не вдалося зберегти зміни.",
    );

    throw new ApiError(errorMessage, response.status);
  }

  if (data && "user" in data && data.user) {
    return data.user;
  }

  return data as AuthUser;
}

export async function uploadAvatar(token: string, file: File) {
  const formData = new FormData();
  formData.set("image", file);

  const response = await fetch(createApiUrl("/users/me/avatar"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
    body: formData,
  });

  const responseText = await response.text().catch(() => "");
  const data = (responseText ? safeParseJson(responseText) : null) as
    | AuthUser
    | { user?: AuthUser; avatarUrl?: string; message?: string }
    | null;

  if (!response.ok) {
    throw new ApiError(
      getApiErrorMessage(
        data,
        responseText,
        response.status,
        "Не вдалося завантажити фото.",
      ),
      response.status,
    );
  }

  if (data && "user" in data && data.user) {
    return data.user;
  }

  if (data && "avatarUrl" in data && typeof data.avatarUrl === "string") {
    return { avatarUrl: data.avatarUrl };
  }

  throw new ApiError("Бекенд не повернув посилання на фото", response.status);
}

function safeParseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function getApiErrorMessage(
  data: unknown,
  responseText: string,
  status: number,
  fallbackMessage: string,
) {
  const message =
    data && typeof data === "object" && "message" in data
      ? data.message
      : null;

  if (typeof message === "string" && message.length > 0) {
    return message;
  }

  if (Array.isArray(message) && message.length > 0) {
    return message.join(", ");
  }

  if (
    responseText.length > 0 &&
    responseText.length < 160 &&
    !isHtmlResponse(responseText)
  ) {
    return responseText;
  }

  return `${fallbackMessage} Статус відповіді: ${status}.`;
}

function isHtmlResponse(responseText: string) {
  return /<(!doctype|html|head|body|pre)\b/i.test(responseText);
}

function isRouteNotFoundError(error: ApiError) {
  return (
    error.status === 404 &&
    (error.message.includes("Cannot PATCH") ||
      error.message.includes("Cannot PUT") ||
      error.message.includes("Cannot POST") ||
      error.message.includes("Не вдалося зберегти зміни. Статус відповіді: 404."))
  );
}
