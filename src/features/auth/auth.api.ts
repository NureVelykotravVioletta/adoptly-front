export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

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

const DEFAULT_API_BASE_URL = "http://localhost:3001";

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
