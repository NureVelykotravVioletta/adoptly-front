import type { ApiPage, ApiPaginationMeta } from "@/src/types/api";

export function paginate<T>(
  items: T[],
  page: number,
  limit: number,
): ApiPage<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / limit));
  const normalizedPage = Math.min(page, totalPages);
  const start = (normalizedPage - 1) * limit;

  return {
    items: items.slice(start, start + limit),
    page: normalizedPage,
    limit,
    total: items.length,
    totalPages,
  };
}

type RawPageMeta = Partial<{
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
  meta: ApiPaginationMeta;
  pagination: ApiPaginationMeta;
}>;

export function extractPageMeta(
  data: RawPageMeta,
  fallbackPage: number,
  fallbackLimit: number,
) {
  const { meta, pagination } = data;

  const total =
    data.total ??
    data.totalItems ??
    data.totalCount ??
    data.count ??
    meta?.total ??
    meta?.totalItems ??
    meta?.totalCount ??
    meta?.count ??
    pagination?.total ??
    pagination?.totalItems ??
    pagination?.totalCount ??
    pagination?.count;

  const page =
    data.page ??
    data.currentPage ??
    meta?.page ??
    meta?.currentPage ??
    pagination?.page ??
    pagination?.currentPage ??
    fallbackPage;

  const limit = data.limit ?? meta?.limit ?? pagination?.limit ?? fallbackLimit;

  const totalPages =
    data.totalPages ??
    data.pages ??
    data.lastPage ??
    meta?.totalPages ??
    meta?.pages ??
    meta?.lastPage ??
    pagination?.totalPages ??
    pagination?.pages ??
    pagination?.lastPage;

  return { total, page, limit, totalPages };
}

export function buildPage<T>(
  items: T[],
  rawItems: unknown[],
  meta: ReturnType<typeof extractPageMeta>,
): ApiPage<T> {
  const total = meta.total ?? rawItems.length;
  const totalPages =
    meta.totalPages ?? Math.max(1, Math.ceil(total / meta.limit));

  return {
    items,
    page: meta.page,
    limit: meta.limit,
    total,
    totalPages,
  };
}
