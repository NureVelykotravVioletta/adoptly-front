import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, getMe } from "@/src/features/auth/auth.api";
import type { AuthResponse, AuthUser } from "@/src/features/auth/auth.api";

const AUTH_TOKEN_COOKIE = "auth_token";
const USER_ROLE_COOKIE = "user_role";
const AUTH_USER_COOKIE = "auth_user";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

export async function getAuthToken() {
  const cookieStore = await cookies();

  return cookieStore.get(AUTH_TOKEN_COOKIE)?.value ?? null;
}

export async function setAuthSession(response: AuthResponse) {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_TOKEN_COOKIE, response.token, sessionCookieOptions);
  cookieStore.set(USER_ROLE_COOKIE, response.user.role, sessionCookieOptions);
  cookieStore.set(
    AUTH_USER_COOKIE,
    serializeSessionUser(response.user),
    sessionCookieOptions,
  );
}

export async function clearAuthSession() {
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_TOKEN_COOKIE);
  cookieStore.delete(USER_ROLE_COOKIE);
  cookieStore.delete(AUTH_USER_COOKIE);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getAuthToken();

  if (!token) {
    return null;
  }

  try {
    return await getMe(token);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401 || error.status === 403) {
        return null;
      }

      return getSessionUser();
    }

    throw error;
  }
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(AUTH_USER_COOKIE)?.value;

  if (!cookieValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(cookieValue, "base64url").toString("utf8"),
    ) as Partial<AuthUser>;

    if (
      typeof parsed.id !== "string" ||
      typeof parsed.name !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.role !== "string"
    ) {
      return null;
    }

    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      phone: typeof parsed.phone === "string" ? parsed.phone : null,
      avatarUrl:
        typeof parsed.avatarUrl === "string" ? parsed.avatarUrl : null,
      role: parsed.role,
    };
  } catch {
    return null;
  }
}

function serializeSessionUser(user: AuthUser) {
  return Buffer.from(JSON.stringify(user), "utf8").toString("base64url");
}
