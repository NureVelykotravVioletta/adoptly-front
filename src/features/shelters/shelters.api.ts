import {
  ApiError,
  getApiBaseUrl,
  getApiErrorMessage,
  isRecord,
  normalizeImageUrl,
  safeParseJson,
} from "@/src/lib/api";
import { buildPage, extractPageMeta, paginate } from "@/src/lib/pagination";
import { FALLBACK_SHELTERS } from "@/src/features/shelters/shelters.fallback";
import type {
  ApiPage,
  CreateShelterRequest,
  Shelter,
  ShelterApiImage,
  ShelterApiItem,
  SheltersApiResponse,
  SheltersQuery,
  UpdateShelterRequest,
} from "@/src/types/api";

export type { Shelter };
export type SheltersPageData = ApiPage<Shelter>;
export type GetSheltersParams = SheltersQuery;
export type UpdateShelterPayload = UpdateShelterRequest;
export type CreateShelterPayload = CreateShelterRequest;

export async function getShelters(
  params: GetSheltersParams
): Promise<SheltersPageData> {
  const page = await requestSheltersPage(params);

  if (page) {
    return page;
  }

  return getFallbackShelters(params);
}

export async function getShelter(id: string): Promise<Shelter | null> {
  const shelter = await requestShelter(id);

  if (shelter) {
    return shelter;
  }

  const fallbackShelter = FALLBACK_SHELTERS.find(
    (item) => item.id === id || encodeURIComponent(item.id) === id
  );

  return fallbackShelter ?? null;
}

export async function deleteShelter(token: string, shelterId: string) {
  const endpointCandidates = [
    `/shelters/${encodeURIComponent(shelterId)}`,
    `/shelter/${encodeURIComponent(shelterId)}`,
  ];
  let lastError: ApiError | null = null;

  for (const pathname of endpointCandidates) {
    const response = await fetch(
      new URL(pathname, getApiBaseUrl()).toString(),
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      return;
    }

    const data = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = Array.isArray(data?.message)
      ? data.message.join(" ")
      : data?.message;
    const error = new ApiError(
      message ?? "Не вдалося видалити притулок.",
      response.status
    );

    if (response.status === 404) {
      lastError = error;
      continue;
    }

    throw error;
  }

  throw lastError ?? new ApiError("Не знайдено endpoint для видалення.", 404);
}

export async function createShelter(
  token: string,
  payload: CreateShelterPayload
) {
  const requests = ["/shelters", "/shelter"];
  let lastRouteError: ApiError | null = null;

  for (const pathname of requests) {
    const response = await fetch(new URL(pathname, getApiBaseUrl()), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      body: JSON.stringify(payload),
    });
    const responseText = await response.text().catch(() => "");
    const data = (responseText ? safeParseJson(responseText) : null) as
      | ShelterApiItem
      | Partial<{
          item: ShelterApiItem;
          data: ShelterApiItem;
          shelter: ShelterApiItem;
          message: string | string[];
        }>
      | null;

    if (!response.ok) {
      const error = new ApiError(
        getApiErrorMessage(data, "Не вдалося створити притулок.", {
            responseText,
          }),
        response.status
      );

      if (response.status === 404) {
        lastRouteError = error;
        continue;
      }

      throw error;
    }

    const apiItem =
      data && isRecord(data) && isShelterDetailsResponse(data)
        ? (data.item ?? data.data ?? data.shelter)
        : data;

    return apiItem && isRecord(apiItem) && isShelterItemRecord(apiItem)
      ? normalizeShelter(apiItem)
      : null;
  }

  throw (
    lastRouteError ??
    new ApiError("Не знайдено endpoint для створення притулку.", 404)
  );
}

export async function updateShelter(
  token: string,
  shelterId: string,
  payload: UpdateShelterPayload
) {
  const requests = [
    { method: "PATCH", pathname: `/shelters/${encodeURIComponent(shelterId)}` },
    { method: "PUT", pathname: `/shelters/${encodeURIComponent(shelterId)}` },
    { method: "PATCH", pathname: `/shelter/${encodeURIComponent(shelterId)}` },
    { method: "PUT", pathname: `/shelter/${encodeURIComponent(shelterId)}` },
  ];
  let lastRouteError: ApiError | null = null;

  for (const request of requests) {
    try {
      return await requestUpdateShelter(token, payload, request);
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
    new ApiError("Не знайдено endpoint для оновлення притулку.", 404)
  );
}

async function requestUpdateShelter(
  token: string,
  payload: UpdateShelterPayload,
  request: { method: string; pathname: string }
) {
  const response = await fetch(new URL(request.pathname, getApiBaseUrl()), {
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
    | ShelterApiItem
    | Partial<{
        item: ShelterApiItem;
        data: ShelterApiItem;
        shelter: ShelterApiItem;
        message: string | string[];
      }>
    | null;

  if (!response.ok) {
    throw new ApiError(
      getApiErrorMessage(data, "Не вдалося зберегти зміни притулку.", {
        responseText,
      }),
      response.status
    );
  }

  const apiItem =
    data && isRecord(data) && isShelterDetailsResponse(data)
      ? (data.item ?? data.data ?? data.shelter)
      : data;

  return apiItem && isRecord(apiItem) && isShelterItemRecord(apiItem)
    ? normalizeShelter(apiItem)
    : null;
}

export async function uploadShelterPhoto(
  token: string,
  shelterId: string,
  file: File
) {
  const requests = [
    `/shelters/${encodeURIComponent(shelterId)}/images`,
    `/shelters/${encodeURIComponent(shelterId)}/photos`,
    `/shelters/${encodeURIComponent(shelterId)}/image`,
    `/shelters/${encodeURIComponent(shelterId)}/photo`,
    `/shelter/${encodeURIComponent(shelterId)}/images`,
    `/shelter/${encodeURIComponent(shelterId)}/photos`,
    `/shelter/${encodeURIComponent(shelterId)}/image`,
    `/shelter/${encodeURIComponent(shelterId)}/photo`,
  ];
  const fileFields = ["image", "photo", "file", "photos", "images"];
  let lastRouteError: ApiError | null = null;

  for (const pathname of requests) {
    for (const field of fileFields) {
      const formData = new FormData();
      formData.set(field, file);

      const response = await fetch(new URL(pathname, getApiBaseUrl()), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        body: formData,
      });
      const responseText = await response.text().catch(() => "");
      const data = (responseText ? safeParseJson(responseText) : null) as
        | ShelterApiItem
        | Partial<{
            item: ShelterApiItem;
            data: ShelterApiItem;
            shelter: ShelterApiItem;
            message: string | string[];
          }>
        | null;

      if (!response.ok) {
        const error = new ApiError(
          getApiErrorMessage(data, "Не вдалося завантажити фото притулку.", {
              responseText,
            }),
          response.status
        );

        if (response.status === 404 || isUnexpectedUploadFieldError(error)) {
          lastRouteError = error;
          continue;
        }

        throw error;
      }

      const apiItem =
        data && isRecord(data) && isShelterDetailsResponse(data)
          ? (data.item ?? data.data ?? data.shelter)
          : data;

      return apiItem && isRecord(apiItem) && isShelterItemRecord(apiItem)
        ? normalizeShelter(apiItem)
        : null;
    }
  }

  throw (
    lastRouteError ??
    new ApiError("Не знайдено endpoint для завантаження фото.", 404)
  );
}

function isUnexpectedUploadFieldError(error: ApiError) {
  return error.message.toLowerCase().includes("unexpected field");
}

export async function deleteShelterPhoto(
  token: string,
  shelterId: string,
  photoUrl: string
) {
  const response = await fetch(
    new URL(
      `/shelter/${encodeURIComponent(shelterId)}/photo/${encodeURIComponent(
        photoUrl
      )}`,
      getApiBaseUrl()
    ),
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (response.ok) {
    return;
  }

  const responseText = await response.text().catch(() => "");
  const data = (responseText ? safeParseJson(responseText) : null) as {
    message?: string | string[];
  } | null;

  throw new ApiError(
    getApiErrorMessage(data, "Не вдалося видалити фото притулку.", {
      responseText,
    }),
    response.status
  );
}

async function requestShelter(id: string): Promise<Shelter | null> {
  const endpointCandidates = [
    `/shelters/${encodeURIComponent(id)}`,
    `/shelter/${encodeURIComponent(id)}`,
  ];

  for (const pathname of endpointCandidates) {
    const url = new URL(pathname, getApiBaseUrl());

    try {
      const response = await fetch(url.toString(), { cache: "no-store" });

      if (!response.ok) {
        continue;
      }

      const data = (await response.json().catch(() => null)) as
        | ShelterApiItem
        | Partial<{
            item: ShelterApiItem;
            data: ShelterApiItem;
            shelter: ShelterApiItem;
          }>
        | null;
      const apiItem =
        data && isRecord(data) && isShelterDetailsResponse(data)
          ? (data.item ?? data.data ?? data.shelter)
          : data;

      if (apiItem && isRecord(apiItem)) {
        return normalizeShelter(apiItem);
      }
    } catch {
      continue;
    }
  }

  return null;
}

async function requestSheltersPage(
  params: GetSheltersParams
): Promise<SheltersPageData | null> {
  const url = new URL("/shelters", getApiBaseUrl());
  url.searchParams.set("page", String(params.page));
  url.searchParams.set("limit", String(params.limit));

  if (params.search) {
    url.searchParams.set("search", params.search);
  }

  if (params.city) {
    url.searchParams.set("city", params.city);
  }

  try {
    const response = await fetch(url.toString(), { cache: "no-store" });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json().catch(() => null)) as
      | SheltersApiResponse
      | ShelterApiItem[]
      | null;

    return normalizeSheltersPage(data, params.page, params.limit);
  } catch {
    return null;
  }
}

function normalizeSheltersPage(
  data: SheltersApiResponse | ShelterApiItem[] | null,
  fallbackPage: number,
  fallbackLimit: number
): SheltersPageData | null {
  if (!data) {
    return null;
  }

  if (Array.isArray(data)) {
    return paginate(data.map(normalizeShelter), fallbackPage, fallbackLimit);
  }

  const apiItems = data.items ?? data.data ?? data.shelters ?? [];
  const meta = extractPageMeta(data, fallbackPage, fallbackLimit);

  return buildPage(apiItems.map(normalizeShelter), apiItems, meta);
}

function getFallbackShelters(params: GetSheltersParams) {
  const normalizedSearch = params.search?.toLocaleLowerCase("uk-UA") ?? "";
  const filtered = FALLBACK_SHELTERS.filter((shelter) => {
    const matchesSearch =
      !normalizedSearch ||
      `${shelter.name} ${shelter.description} ${shelter.city}`
        .toLocaleLowerCase("uk-UA")
        .includes(normalizedSearch);
    const matchesCity = !params.city || shelter.city === params.city;

    return matchesSearch && matchesCity;
  });

  return paginate(filtered, params.page, params.limit);
}

function normalizeShelter(shelter: ShelterApiItem, index = 0): Shelter {
  const id = shelter.id ?? shelter._id ?? `shelter-${index}`;
  const animalsCount =
    shelter.animalsCount ??
    shelter.animalCount ??
    shelter.petsCount ??
    shelter.petCount ??
    shelter.animals?.length ??
    shelter.pets?.length ??
    0;

  const images = getShelterImageUrls(shelter);

  return {
    id: String(id),
    name: shelter.name ?? shelter.title ?? "Без назви",
    city:
      normalizeCityRef(shelter.city) ||
      (shelter.location ?? shelter.address ?? "Місто не вказано"),
    address: shelter.address ?? "",
    description: shelter.description ?? shelter.about ?? "",
    imageUrl: images[0] ?? null,
    images,
    animalsCount,
    rating: shelter.rating ?? shelter.stars ?? 0,
    phone: shelter.phone ?? shelter.phoneNumber ?? shelter.contactPhone ?? "",
    email: shelter.email ?? shelter.contactEmail ?? "",
    workingHours:
      shelter.workingHours ??
      shelter.workHours ??
      shelter.hours ??
      shelter.schedule ??
      "",
    foundedAt: formatFoundedAt(
      shelter.foundedAt ?? shelter.foundedYear ?? shelter.createdAt
    ),
  };
}

function getShelterImageUrls(shelter: ShelterApiItem) {
  return [
    shelter.imageUrl,
    shelter.image,
    shelter.photoUrl,
    shelter.coverUrl,
    ...getRawShelterImageUrls(shelter.images),
  ]
    .map(normalizeImageUrl)
    .filter((url): url is string => Boolean(url));
}

function getRawShelterImageUrls(images: ShelterApiImage[] | undefined) {
  if (!images) {
    return [];
  }

  return images
    .map((image) => {
      if (typeof image === "string") {
        return image;
      }

      if (image && typeof image === "object") {
        return (
          image.url ??
          image.src ??
          image.imageUrl ??
          image.secureUrl ??
          image.path
        );
      }

      return null;
    })
    .filter((url): url is string => Boolean(url));
}

function formatFoundedAt(value: string | number | undefined) {
  if (!value) {
    return "";
  }

  if (typeof value === "number") {
    return String(value);
  }

  const year = new Date(value).getFullYear();
  return Number.isNaN(year) ? value : String(year);
}

function normalizeCityRef(
  value: string | { name?: string } | null | undefined,
): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.name ?? "";
}

function isShelterDetailsResponse(
  data: Record<string, unknown>
): data is Partial<{
  item: ShelterApiItem;
  data: ShelterApiItem;
  shelter: ShelterApiItem;
}> {
  return "item" in data || "data" in data || "shelter" in data;
}

function isShelterItemRecord(
  data: Record<string, unknown>
): data is ShelterApiItem {
  return (
    "id" in data ||
    "_id" in data ||
    "name" in data ||
    "title" in data ||
    "city" in data ||
    "address" in data
  );
}

