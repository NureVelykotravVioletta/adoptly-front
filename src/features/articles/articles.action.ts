"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/src/features/auth/auth.api";
import { isAdminUser } from "@/src/features/auth/auth.roles";
import { getAuthToken, getCurrentUser } from "@/src/features/auth/auth.session";
import {
  createArticle,
  deleteArticle,
  updateArticle,
} from "@/src/features/articles/articles.api";
import type {
  Article,
  CreateArticlePayload,
  UpdateArticlePayload,
} from "@/src/features/articles/articles.api";

export type CreateArticleActionState = {
  article?: Article | null;
  error?: string;
};

export type UpdateArticleActionState = {
  article?: Article | null;
  error?: string;
};

export type DeleteArticleActionState = {
  success?: boolean;
  error?: string;
};

export async function createArticleAction(
  formData: FormData,
): Promise<CreateArticleActionState> {
  const token = await getAuthToken();
  const user = await getCurrentUser();

  if (!token || !isAdminUser(user)) {
    return { error: "Недостатньо прав для створення статті." };
  }

  const payload = getCreateArticlePayload(formData);

  if ("error" in payload) {
    return { error: payload.error };
  }

  try {
    const article = await createArticle(token, payload.data);

    revalidatePath("/articles");

    return { article };
  } catch (error) {
    return {
      error:
        error instanceof ApiError
          ? error.message
          : "Не вдалося створити статтю.",
    };
  }
}

export async function updateArticleAction(
  articleId: string,
  formData: FormData,
): Promise<UpdateArticleActionState> {
  const token = await getAuthToken();
  const user = await getCurrentUser();

  if (!token || !isAdminUser(user)) {
    return { error: "Недостатньо прав для редагування статті." };
  }

  const payload = getUpdateArticlePayload(formData);

  if ("error" in payload) {
    return { error: payload.error };
  }

  if (Object.keys(payload.data).length === 0) {
    return {};
  }

  try {
    const article = await updateArticle(token, articleId, payload.data);

    revalidatePath("/articles");
    revalidatePath(`/articles/${articleId}/edit`);

    return { article };
  } catch (error) {
    return {
      error:
        error instanceof ApiError
          ? error.message
          : "Не вдалося зберегти статтю.",
    };
  }
}

export async function deleteArticleAction(
  articleId: string,
): Promise<DeleteArticleActionState> {
  const token = await getAuthToken();
  const user = await getCurrentUser();

  if (!token || !isAdminUser(user)) {
    return { error: "Недостатньо прав для видалення статті." };
  }

  try {
    await deleteArticle(token, articleId);

    revalidatePath("/articles");
    revalidatePath(`/articles/${articleId}/edit`);

    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof ApiError
          ? error.message
          : "Не вдалося видалити статтю.",
    };
  }
}

function getCreateArticlePayload(
  formData: FormData,
): { data: CreateArticlePayload } | { error: string } {
  const title = getStringValue(formData, "title");
  const content = getStringValue(formData, "content");
  const image = getOptionalImageValue(formData);

  if (!title) {
    return { error: "Заголовок статті не може бути порожнім." };
  }

  if (!content) {
    return { error: "Текст статті не може бути порожнім." };
  }

  return {
    data: {
      title,
      content,
      ...(image === undefined ? {} : { image }),
    },
  };
}

function getUpdateArticlePayload(
  formData: FormData,
): { data: UpdateArticlePayload } | { error: string } {
  const payload: UpdateArticlePayload = {};

  if (formData.has("title")) {
    const title = getStringValue(formData, "title");

    if (!title) {
      return { error: "Заголовок статті не може бути порожнім." };
    }

    payload.title = title;
  }

  if (formData.has("content")) {
    const content = getStringValue(formData, "content");

    if (!content) {
      return { error: "Текст статті не може бути порожнім." };
    }

    payload.content = content;
  }

  if (formData.has("image")) {
    payload.image = getOptionalImageValue(formData);
  }

  return { data: payload };
}

function getStringValue(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

function getOptionalImageValue(formData: FormData) {
  const value = formData.get("image");

  if (value instanceof File) {
    return value.size > 0 ? value : null;
  }

  if (typeof value === "string") {
    return value.trim().length > 0 ? value.trim() : null;
  }

  return undefined;
}
