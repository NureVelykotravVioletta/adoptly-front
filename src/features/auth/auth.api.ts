import {
  ApiError,
  createApiUrl,
  getApiErrorMessage,
  safeParseJson,
} from "@/src/lib/api";
import type {
  ApiUser,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from "@/src/types/api";

export type RegisterPayload = RegisterRequest;
export type LoginPayload = LoginRequest;
export type UpdateProfilePayload = UpdateProfileRequest;
export type AuthUser = ApiUser;
export type { AuthResponse };

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
      response.status
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
      response.status
    );
  }

  return data as AuthResponse;
}

export async function googleLogin(idToken: string) {
  const response = await fetch(createApiUrl("/auth/google"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({ idToken }),
  });

  const data = (await response.json().catch(() => null)) as
    | AuthResponse
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new ApiError(
      data?.message ?? "Не вдалося увійти через Google",
      response.status,
    );
  }

  return data as AuthResponse;
}

export async function getMe(token: string) {
  const requests = ["/users/me", "/auth/me"];
  let lastRouteError: ApiError | null = null;

  for (const pathname of requests) {
    try {
      return await requestMe(token, pathname);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        lastRouteError = error;
        continue;
      }

      throw error;
    }
  }

  throw (
    lastRouteError ??
    new ApiError("Не знайдено endpoint для отримання користувача.", 404)
  );
}

async function requestMe(token: string, pathname: string) {
  const response = await fetch(createApiUrl(pathname), {
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
      response.status
    );
  }

  if (data && "user" in data && data.user) {
    return data.user;
  }

  return data as AuthUser;
}

export async function updateProfile(
  token: string,
  payload: UpdateProfilePayload
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
  request: { method: string; pathname: string }
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
    const errorMessage = getApiErrorMessage(data, "Не вдалося зберегти зміни.", {
      responseText,
      status: response.status,
    });

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
      getApiErrorMessage(data, "Не вдалося завантажити фото.", {
        responseText,
        status: response.status,
      }),
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

function isRouteNotFoundError(error: ApiError) {
  return (
    error.status === 404 &&
    (error.message.includes("Cannot PATCH") ||
      error.message.includes("Cannot PUT") ||
      error.message.includes("Cannot POST") ||
      error.message.includes("Cannot GET") ||
      error.message.includes(
        "Не вдалося зберегти зміни. Статус відповіді: 404."
      ))
  );
}
