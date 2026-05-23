import { isAdminUser } from "@/src/features/auth/auth.roles";
import { getAuthToken, getCurrentUser } from "@/src/features/auth/auth.session";

export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

export function getStringValue(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

export function getOptionalStringValue(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : null;
}

const IMAGE_FIELD_NAMES = ["image", "photo", "file", "photos", "images"];

export function validateImageFile(
  formData: FormData,
): { file: File | null } | { error: string } {
  let file: FormDataEntryValue | null = null;

  for (const field of IMAGE_FIELD_NAMES) {
    file = formData.get(field);

    if (file instanceof File && file.size > 0) {
      break;
    }
  }

  if (!(file instanceof File) || file.size === 0) {
    return { file: null };
  }

  if (!file.type.startsWith("image/")) {
    return { error: "Файл має бути зображенням." };
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return { error: "Фото має бути не більше 5MB." };
  }

  return { file };
}

export async function requireAdmin(): Promise<
  { token: string } | { error: string }
> {
  const token = await getAuthToken();
  const user = await getCurrentUser();

  if (!token || !isAdminUser(user)) {
    return { error: "Недостатньо прав для цієї дії." };
  }

  return { token };
}
