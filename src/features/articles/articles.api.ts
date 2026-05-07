import { getApiBaseUrl } from "@/src/features/auth/auth.api";

export type Article = {
  id: string;
  title: string;
  text: string;
  imageUrl: string | null;
  createdAt: string;
};

export type ArticlesPageData = {
  items: Article[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ArticleApiItem = Partial<{
  id: string | number;
  _id: string | number;
  title: string;
  name: string;
  text: string;
  content: string;
  description: string;
  imageUrl: string | null;
  image: string | null;
  photoUrl: string | null;
  createdAt: string;
  date: string;
  updatedAt: string;
}>;

type ArticlesApiResponse = Partial<{
  items: ArticleApiItem[];
  data: ArticleApiItem[];
  articles: ArticleApiItem[];
  page: number;
  currentPage: number;
  limit: number;
  total: number;
  totalItems: number;
  totalCount: number;
  count: number;
  totalPages: number;
  pages: number;
  lastPage: number;
  meta: Partial<{
    page: number;
    currentPage: number;
    limit: number;
    total: number;
    totalItems: number;
    totalCount: number;
    count: number;
    totalPages: number;
    pages: number;
    lastPage: number;
  }>;
  pagination: Partial<{
    page: number;
    currentPage: number;
    limit: number;
    total: number;
    totalItems: number;
    totalCount: number;
    count: number;
    totalPages: number;
    pages: number;
    lastPage: number;
  }>;
}>;

type GetArticlesParams = {
  page: number;
  limit: number;
  search?: string;
};

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

  const apiItems = data?.items ?? data?.data ?? data?.articles ?? [];
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
