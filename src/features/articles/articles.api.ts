import { ApiError, getApiBaseUrl } from "@/src/features/auth/auth.api";
import type {
  ApiPage,
  Article,
  ArticleApiItem,
  ArticlesApiResponse,
  ArticlesQuery,
  CreateArticleRequest,
  UpdateArticleRequest,
} from "@/src/types/api";

export type { Article };
export type ArticlesPageData = ApiPage<Article>;
export type CreateArticlePayload = CreateArticleRequest;
export type UpdateArticlePayload = UpdateArticleRequest;

type GetArticlesParams = ArticlesQuery;

export async function getArticles({
  page,
  limit,
  search,
}: GetArticlesParams): Promise<ArticlesPageData> {
  if (search) {
    return getFilteredArticles({ page, limit, search });
  }

  return requestArticlesPage({ page, limit });
}

export async function getArticle(id: string): Promise<Article | null> {
  const response = await fetch(
    new URL(`/articles/${encodeURIComponent(id)}`, getApiBaseUrl()),
    { cache: "no-store" },
  ).catch(() => null);

  if (!response || !response.ok) {
    return null;
  }

  const data = (await response.json().catch(() => null)) as
    | ArticlesApiResponse
    | ArticleApiItem
    | null;

  return normalizeArticleDetails(data);
}

export async function createArticle(token: string, payload: CreateArticlePayload) {
  const response = await requestArticleMutation(token, {
    method: "POST",
    pathname: "/articles",
    payload,
  });

  return parseArticleMutationResponse(
    response,
    "Не вдалося створити статтю.",
  );
}

export async function updateArticle(
  token: string,
  articleId: string,
  payload: UpdateArticlePayload,
) {
  const requests = [
    { method: "PATCH", pathname: `/articles/${encodeURIComponent(articleId)}` },
    { method: "PUT", pathname: `/articles/${encodeURIComponent(articleId)}` },
  ];
  let lastRouteError: ApiError | null = null;

  for (const request of requests) {
    const response = await requestArticleMutation(token, {
      method: request.method,
      pathname: request.pathname,
      payload,
    });

    if (response.status === 404) {
      const data = (await response.json().catch(() => null)) as {
        message?: string | string[];
      } | null;
      lastRouteError = new ApiError(
        getArticleApiErrorMessage(data, "Не знайдено endpoint для редагування статті."),
        response.status,
      );
      continue;
    }

    return parseArticleMutationResponse(
      response,
      "Не вдалося зберегти статтю.",
    );
  }

  throw (
    lastRouteError ??
    new ApiError("Не знайдено endpoint для редагування статті.", 404)
  );
}

async function requestArticleMutation(
  token: string,
  request: {
    method: string;
    pathname: string;
    payload: CreateArticlePayload | UpdateArticlePayload;
  },
) {
  const hasFileImage = request.payload.image instanceof File;

  if (hasFileImage) {
    const formData = new FormData();

    Object.entries(request.payload).forEach(([field, value]) => {
      if (value === undefined) {
        return;
      }

      if (field === "image" && value instanceof File) {
        formData.set(field, value);
        return;
      }

      formData.set(field, value ?? "");
    });

    return fetch(new URL(request.pathname, getApiBaseUrl()), {
      method: request.method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      body: formData,
    });
  }

  return fetch(new URL(request.pathname, getApiBaseUrl()), {
    method: request.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
    body: JSON.stringify(request.payload),
  });
}

export async function deleteArticle(token: string, articleId: string) {
  const response = await fetch(
    new URL(`/articles/${encodeURIComponent(articleId)}`, getApiBaseUrl()),
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );
  const data = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;

  if (!response.ok) {
    throw new ApiError(
      getArticleApiErrorMessage(data, "Не вдалося видалити статтю."),
      response.status,
    );
  }
}

async function parseArticleMutationResponse(
  response: Response,
  fallbackMessage: string,
) {
  const responseText = await response.text().catch(() => "");
  const data = (responseText ? safeParseJson(responseText) : null) as
    | ArticlesApiResponse
    | ArticleApiItem
    | { message?: string | string[] }
    | null;

  if (!response.ok) {
    throw new ApiError(
      getArticleApiErrorMessage(data, fallbackMessage),
      response.status,
    );
  }

  const articleData =
    data && isRecord(data) && "message" in data
      ? null
      : (data as ArticlesApiResponse | ArticleApiItem | null);

  return normalizeArticleDetails(articleData);
}

async function getFilteredArticles({
  page,
  limit,
  search,
}: Required<GetArticlesParams>): Promise<ArticlesPageData> {
  const firstPage = await requestArticlesPage({ page: 1, limit });
  const totalLimit = Math.max(firstPage.total, limit);
  const fullPage =
    totalLimit > firstPage.items.length
      ? await requestArticlesPage({ page: 1, limit: totalLimit })
      : firstPage;
  const normalizedSearch = search.toLocaleLowerCase("uk-UA");
  const filteredItems = fullPage.items.filter((article) =>
    `${article.title} ${article.text}`
      .toLocaleLowerCase("uk-UA")
      .includes(normalizedSearch),
  );
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / limit));
  const normalizedPage = Math.min(page, totalPages);
  const start = (normalizedPage - 1) * limit;

  return {
    items: filteredItems.slice(start, start + limit),
    page: normalizedPage,
    limit,
    total: filteredItems.length,
    totalPages,
  };
}

async function requestArticlesPage({
  page,
  limit,
}: Omit<GetArticlesParams, "search">): Promise<ArticlesPageData> {
  const url = new URL("/articles", getApiBaseUrl());
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  try {
    const response = await fetch(url.toString(), { cache: "no-store" });

    if (!response.ok) {
      return createEmptyArticlesPage(page, limit);
    }

    const data = (await response.json().catch(() => null)) as
      | ArticlesApiResponse
      | ArticleApiItem[]
      | null;

    return normalizeArticlesPage(data, page, limit);
  } catch {
    return createEmptyArticlesPage(page, limit);
  }
}

function normalizeArticlesPage(
  data: ArticlesApiResponse | ArticleApiItem[] | null,
  fallbackPage: number,
  fallbackLimit: number,
): ArticlesPageData {
  if (Array.isArray(data)) {
    return {
      items: data.map(normalizeArticle),
      page: fallbackPage,
      limit: fallbackLimit,
      total: data.length,
      totalPages: Math.max(1, Math.ceil(data.length / fallbackLimit)),
    };
  }

  const apiItems =
    data?.items ?? getArticleApiItemArray(data?.data) ?? data?.articles ?? [];
  const meta = data?.meta;
  const pagination = data?.pagination;
  const total =
    data?.total ??
    data?.totalItems ??
    data?.totalCount ??
    data?.count ??
    meta?.total ??
    meta?.totalItems ??
    meta?.totalCount ??
    meta?.count ??
    pagination?.total ??
    pagination?.totalItems ??
    pagination?.totalCount ??
    pagination?.count;
  const page =
    data?.page ??
    data?.currentPage ??
    meta?.page ??
    meta?.currentPage ??
    pagination?.page ??
    pagination?.currentPage ??
    fallbackPage;
  const limit = data?.limit ?? meta?.limit ?? pagination?.limit ?? fallbackLimit;
  const totalPages =
    data?.totalPages ??
    data?.pages ??
    data?.lastPage ??
    meta?.totalPages ??
    meta?.pages ??
    meta?.lastPage ??
    pagination?.totalPages ??
    pagination?.pages ??
    pagination?.lastPage ??
    Math.max(1, Math.ceil((total ?? apiItems.length) / limit));

  return {
    items: apiItems.map(normalizeArticle),
    page,
    limit,
    total: total ?? apiItems.length,
    totalPages,
  };
}

function normalizeArticleDetails(
  data: ArticlesApiResponse | ArticleApiItem | null,
): Article | null {
  if (!data) {
    return null;
  }

  const apiItem = isArticlesApiResponse(data)
    ? (data.item ??
      data.article ??
      getFirstArticleApiItem(data.data) ??
      data.items?.[0] ??
      data.articles?.[0])
    : data;

  return apiItem ? normalizeArticle(apiItem, 0) : null;
}

function getFirstArticleApiItem(
  data: ArticleApiItem | ArticleApiItem[] | undefined,
) {
  return Array.isArray(data) ? data[0] : data;
}

function getArticleApiItemArray(
  data: ArticleApiItem | ArticleApiItem[] | undefined,
) {
  if (!data) {
    return undefined;
  }

  return Array.isArray(data) ? data : [data];
}

function normalizeArticle(article: ArticleApiItem, index: number): Article {
  const id = article.id ?? article._id ?? `article-${index}`;

  return {
    id: String(id),
    title: article.title ?? article.name ?? "Без назви",
    text: article.text ?? article.content ?? article.description ?? "",
    imageUrl: article.imageUrl ?? article.image ?? article.photoUrl ?? null,
    createdAt: article.createdAt ?? article.date ?? article.updatedAt ?? "",
  };
}

function createEmptyArticlesPage(page: number, limit: number): ArticlesPageData {
  return {
    items: [],
    page,
    limit,
    total: 0,
    totalPages: 1,
  };
}

function isArticlesApiResponse(
  data: ArticlesApiResponse | ArticleApiItem,
): data is ArticlesApiResponse {
  return (
    "items" in data ||
    "data" in data ||
    "article" in data ||
    "articles" in data ||
    "item" in data
  );
}

function getArticleApiErrorMessage(data: unknown, fallbackMessage: string) {
  const message =
    data && typeof data === "object" && "message" in data ? data.message : null;

  if (typeof message === "string" && message.length > 0) {
    return message;
  }

  if (Array.isArray(message) && message.length > 0) {
    return message.join(", ");
  }

  return fallbackMessage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function safeParseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}
