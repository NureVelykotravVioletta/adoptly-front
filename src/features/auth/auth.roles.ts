import type { AuthUser } from "@/src/features/auth/auth.api";

export function isAdminUser(user: AuthUser | null | undefined) {
  return user?.role.trim().toUpperCase() === "ADMIN";
}
