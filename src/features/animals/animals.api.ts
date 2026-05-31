import {
  ApiError,
  createApiUrl,
  getApiBaseUrl,
  getApiErrorMessage,
  isRecord,
  normalizeImageUrl,
  safeParseJson,
} from "@/src/lib/api";
import { buildPage, extractPageMeta, paginate } from "@/src/lib/pagination";
import { FALLBACK_ANIMALS } from "@/src/features/animals/animals.fallback";
import type {
  Animal,
  AnimalApiItem,
  AnimalsApiResponse,
  AnimalsQuery,
  ApiPage,
  CreateAnimalRequest,
  EntityImage,
  LikedAnimalApiItem,
  LikedAnimalsApiResponse,
  UpdateAnimalRequest,
} from "@/src/types/api";

export type { Animal };
export type AnimalsPageData = ApiPage<Animal>;
export type GetAnimalsParams = AnimalsQuery;
export type CreateAnimalPayload = CreateAnimalRequest;
export type UpdateAnimalPayload = UpdateAnimalRequest;

const ANIMAL_ENDPOINTS = ["/animals", "/pets"] as const;

export async function getAnimals(
  params: GetAnimalsParams
): Promise<AnimalsPageData> {
  for (const pathname of ANIMAL_ENDPOINTS) {
    const page = await requestAnimalsPage(pathname, params);

    if (page) {
      return page;
    }
  }

  return getFallbackAnimals(params);
}

export async function getAnimal(id: string): Promise<Animal | null> {
  for (const pathname of ANIMAL_ENDPOINTS) {
    const animal = await requestAnimal(pathname, id);

    if (animal) {
      return animal;
    }
  }

  for (const pathname of ANIMAL_ENDPOINTS) {
    const page = await requestAnimalsPage(pathname, { page: 1, limit: 100 });
    const animal = page?.items.find((item) => item.id === id);

    if (animal) {
      return animal;
    }
  }

  return FALLBACK_ANIMALS.find((animal) => animal.id === id) ?? null;
}

export async function getShelterAnimals({
  shelterId,
}: {
  shelterId: string;
}): Promise<Animal[]> {
  return (
    (await requestAllShelterAnimals(
      `/shelter/${encodeURIComponent(shelterId)}/animals`
    )) ?? []
  );
}

async function requestAllShelterAnimals(pathname: string) {
  const firstPage = await requestAnimalsPage(pathname, { page: 1, limit: 100 });

  if (!firstPage) {
    return null;
  }

  if (firstPage.totalPages <= 1) {
    return firstPage.items;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      requestAnimalsPage(pathname, { page: index + 2, limit: firstPage.limit })
    )
  );

  return [
    ...firstPage.items,
    ...remainingPages.flatMap((page) => page?.items ?? []),
  ];
}

export async function getLikedAnimals(token: string): Promise<Animal[]> {
  const response = await fetch(createApiUrl("/users/me/liked-animals"), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = (await response
    .json()
    .catch(() => null)) as LikedAnimalsApiResponse | null;

  if (!response.ok) {
    throw new ApiError(
      getApiErrorMessage(data, "Не вдалося отримати обраних тварин."),
      response.status
    );
  }

  return normalizeLikedAnimalsData(data);
}

export async function deleteAnimal(token: string, animalId: string) {
  const endpointCandidates = [
    `/animals/${encodeURIComponent(animalId)}`,
    `/pets/${encodeURIComponent(animalId)}`,
  ];
  let lastError: ApiError | null = null;

  for (const pathname of endpointCandidates) {
    const response = await fetch(createApiUrl(pathname), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

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
      message ?? "Не вдалося видалити тварину.",
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

export async function updateAnimal(
  token: string,
  animalId: string,
  payload: UpdateAnimalPayload
) {
  const requests = [
    { method: "PATCH", pathname: `/animals/${encodeURIComponent(animalId)}` },
    { method: "PUT", pathname: `/animals/${encodeURIComponent(animalId)}` },
  ];
  let lastRouteError: ApiError | null = null;

  for (const request of requests) {
    const response = await fetch(createApiUrl(request.pathname), {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      body: JSON.stringify(payload),
    });
    const result = await parseCreateAnimalResponse(response);

    if (result.ok) {
      return result.animal;
    }

    if (result.error.status === 404) {
      lastRouteError = result.error;
      continue;
    }

    throw result.error;
  }

  throw (
    lastRouteError ??
    new ApiError("Не знайдено endpoint для редагування тварини.", 404)
  );
}

export async function createAnimal(
  token: string,
  payload: CreateAnimalPayload,
  image?: File | null
) {
  const result = await requestCreateAnimal(token, "/animals", payload);

  if (!result.ok) {
    throw result.error;
  }

  if (image && result.animal) {
    return uploadAnimalPhoto(token, result.animal.id, image);
  }

  return result.animal;
}

async function requestCreateAnimal(
  token: string,
  pathname: string,
  payload: Record<string, string | number>
) {
  const response = await fetch(createApiUrl(pathname), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  return parseCreateAnimalResponse(response);
}

export async function uploadAnimalPhoto(
  token: string,
  animalId: string,
  image: File
) {
  const formData = new FormData();
  formData.set("image", image);

  const response = await fetch(
    createApiUrl(`/animals/${encodeURIComponent(animalId)}/images`),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      body: formData,
    }
  );

  if (!response.ok) {
    const result = await parseCreateAnimalResponse(response);

    if (!result.ok) {
      throw result.error;
    }
  }

  return getAnimal(animalId);
}

export async function deleteAnimalPhoto(
  token: string,
  animalId: string,
  imageId: string
) {
  const response = await fetch(
    createApiUrl(
      `/animals/${encodeURIComponent(animalId)}/images/${encodeURIComponent(
        imageId
      )}`
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
    getApiErrorMessage(data, "Не вдалося видалити фото тварини."),
    response.status
  );
}

async function parseCreateAnimalResponse(response: Response) {
  const responseText = await response.text().catch(() => "");
  const data = (responseText ? safeParseJson(responseText) : null) as
    | AnimalsApiResponse
    | AnimalApiItem
    | { message?: string | string[] }
    | null;

  if (!response.ok) {
    return {
      ok: false as const,
      error: new ApiError(
        getApiErrorMessage(data, "Не вдалося створити тварину."),
        response.status
      ),
    };
  }

  return {
    ok: true as const,
    animal: isAnimalCreateResponse(data) ? normalizeAnimalDetails(data) : null,
  };
}

function isAnimalCreateResponse(
  data:
    | AnimalsApiResponse
    | AnimalApiItem
    | { message?: string | string[] }
    | null
): data is AnimalsApiResponse | AnimalApiItem {
  return Boolean(data && isRecord(data) && !("message" in data));
}

export async function removeAnimalFromShelter(
  token: string,
  shelterId: string,
  animalId: string
) {
  const endpointCandidates = [
    `/shelters/${encodeURIComponent(shelterId)}/animals/${encodeURIComponent(
      animalId
    )}`,
    `/shelters/${encodeURIComponent(shelterId)}/animal/${encodeURIComponent(
      animalId
    )}`,
  ];
  let lastError: ApiError | null = null;

  for (const pathname of endpointCandidates) {
    const response = await fetch(createApiUrl(pathname), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (response.ok) {
      return;
    }

    const data = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const error = new ApiError(
      getApiErrorMessage(data, "Не вдалося прибрати тварину з притулку."),
      response.status
    );

    if (response.status === 404) {
      lastError = error;
      continue;
    }

    throw error;
  }

  throw (
    lastError ??
    new ApiError("Не знайдено endpoint для видалення тварини з притулку.", 404)
  );
}

export async function setLikedAnimal(
  token: string,
  animalId: string,
  liked: boolean
) {
  const response = await fetch(
    createApiUrl(`/users/me/liked-animals/${encodeURIComponent(animalId)}`),
    {
      method: liked ? "POST" : "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const data = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;

  if (!response.ok) {
    throw new ApiError(
      getApiErrorMessage(
        data,
        liked
          ? "Не вдалося додати тварину в обрані."
          : "Не вдалося прибрати тварину з обраних."
      ),
      response.status
    );
  }
}

async function requestAnimal(
  pathname: string,
  id: string
): Promise<Animal | null> {
  const url = new URL(`${pathname}/${encodeURIComponent(id)}`, getApiBaseUrl());

  try {
    const response = await fetch(url.toString(), { cache: "no-store" });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json().catch(() => null)) as
      | AnimalsApiResponse
      | AnimalApiItem
      | null;

    return normalizeAnimalDetails(data);
  } catch (error) {
    console.error("[animals] requestAnimal failed:", error);
    return null;
  }
}

async function requestAnimalsPage(
  pathname: string,
  params: GetAnimalsParams
): Promise<AnimalsPageData | null> {
  const url = new URL(pathname, getApiBaseUrl());
  url.searchParams.set("page", String(params.page));
  url.searchParams.set("limit", String(params.limit));

  if (params.search) {
    url.searchParams.set("search", params.search);
  }

  if (params.category) {
    url.searchParams.set("category", params.category);
  }

  if (params.gender) {
    url.searchParams.set("gender", params.gender);
  }

  if (params.city) {
    url.searchParams.set("city", params.city);
  }

  try {
    const response = await fetch(url.toString(), { cache: "no-store" });

    console.log("[animals] fetch", url.toString(), response.status);

    if (!response.ok) {
      return null;
    }

    const data = (await response.json().catch(() => null)) as
      | AnimalsApiResponse
      | AnimalApiItem[]
      | null;

    console.log("[animals] raw data keys:", data ? Object.keys(data) : null);

    return normalizeAnimalsPage(data, params.page, params.limit);
  } catch (error) {
    console.error("[animals] requestAnimalsPage failed:", error);
    return null;
  }
}

function normalizeAnimalsPage(
  data: AnimalsApiResponse | AnimalApiItem[] | null,
  fallbackPage: number,
  fallbackLimit: number
): AnimalsPageData | null {
  if (!data) {
    return null;
  }

  if (Array.isArray(data)) {
    return paginate(data.map(normalizeAnimal), fallbackPage, fallbackLimit);
  }

  const apiItems =
    data.items ??
    getAnimalApiItemArray(data.data) ??
    data.animals ??
    data.pets ??
    [];
  const meta = extractPageMeta(data, fallbackPage, fallbackLimit);

  return buildPage(apiItems.map(normalizeAnimal), apiItems, meta);
}

function normalizeAnimalDetails(
  data: AnimalsApiResponse | AnimalApiItem | null
): Animal | null {
  if (!data) {
    return null;
  }

  const apiItem = isAnimalsApiResponse(data)
    ? (data.item ??
      data.animal ??
      data.pet ??
      getFirstAnimalApiItem(data.data) ??
      data.items?.[0] ??
      data.animals?.[0] ??
      data.pets?.[0])
    : data;

  return apiItem ? normalizeAnimal(apiItem, 0) : null;
}

function getFirstAnimalApiItem(
  data: AnimalApiItem | AnimalApiItem[] | undefined
) {
  return Array.isArray(data) ? data[0] : data;
}

function getAnimalApiItemArray(
  data: AnimalApiItem | AnimalApiItem[] | undefined
) {
  if (!data) {
    return undefined;
  }

  return Array.isArray(data) ? data : [data];
}

export async function normalizeLikedAnimalsData(
  data: unknown
): Promise<Animal[]> {
  if (!data) {
    return [];
  }

  const items = getLikedAnimalItems(data);
  const animals = await Promise.all(
    items.map(async (item, index) => {
      if (typeof item === "string" || typeof item === "number") {
        return getAnimal(String(item));
      }

      if (!isRecord(item)) {
        return null;
      }

      if (isLikedAnimalJoinItem(item) && item.animal) {
        return normalizeAnimal(item.animal, index);
      }

      if (isLikedAnimalJoinItem(item) && item.animalId) {
        return getAnimal(String(item.animalId));
      }

      return normalizeAnimal(item, index);
    })
  );

  return animals.filter((animal): animal is Animal => Boolean(animal));
}

function isLikedAnimalJoinItem(
  item: Record<string, unknown>
): item is LikedAnimalApiItem {
  return "animal" in item || "animalId" in item || "userId" in item;
}

function getLikedAnimalItems(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (!isRecord(data)) {
    return [];
  }

  const user = data.user;
  const nestedData = data.data;

  if (isRecord(user) && Array.isArray(user.likedAnimals)) {
    return user.likedAnimals;
  }

  if (isRecord(nestedData)) {
    return getLikedAnimalItems(nestedData);
  }

  if (Array.isArray(data.likedAnimals)) {
    return data.likedAnimals;
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  if (Array.isArray(data.animals)) {
    return data.animals;
  }

  return [];
}

function isAnimalsApiResponse(
  data: AnimalsApiResponse | AnimalApiItem
): data is AnimalsApiResponse {
  return (
    "items" in data ||
    "data" in data ||
    "animals" in data ||
    "pets" in data ||
    "item" in data ||
    "animal" in data ||
    "pet" in data
  );
}

function getFallbackAnimals(params: GetAnimalsParams) {
  const normalizedSearch = params.search?.toLocaleLowerCase("uk-UA") ?? "";
  const filtered = FALLBACK_ANIMALS.filter((animal) => {
    const matchesSearch =
      !normalizedSearch ||
      `${animal.name} ${animal.description} ${animal.city}`
        .toLocaleLowerCase("uk-UA")
        .includes(normalizedSearch);
    const matchesCategory =
      !params.category || animal.categoryCode === params.category;
    const matchesGender = !params.gender || animal.genderCode === params.gender;
    const matchesCity = !params.city || animal.city === params.city;

    return matchesSearch && matchesCategory && matchesGender && matchesCity;
  });

  return paginate(filtered, params.page, params.limit);
}

function normalizeAnimal(animal: AnimalApiItem, index: number): Animal {
  const id = animal.id ?? animal._id ?? `animal-${index}`;
  const categoryCode = normalizeCategoryCode(animal.type);
  const category = normalizeCategory(animal.type);
  const genderCode = normalizeGenderCode(animal.gender);
  const gender = normalizeGender(animal.gender);
  const images = normalizeAnimalImages(animal);
  const shelterId =
    animal.shelterId ?? animal.shelter?.id ?? animal.shelter?._id;

  return {
    id: String(id),
    name: animal.name ?? "Без імені",
    category,
    categoryCode,
    age: formatAge(animal.age),
    gender,
    genderCode,
    breed: animal.breed ?? null,
    city:
      animal.shelter?.city ?? animal.city ?? "Місто не вказано",
    description: animal.description ?? "",
    imageUrl: images[0]?.imageUrl ?? null,
    images,
    healthStatus: normalizeHealthStatus(animal.healthStatus ?? animal.status),
    shelterId: shelterId ? String(shelterId) : null,
    shelterName:
      animal.shelter?.name ?? animal.shelter?.title ?? "Притулок не вказано",
    rating: 0,
  };
}

function normalizeAnimalImages(animal: AnimalApiItem): EntityImage[] {
  const items = animal.images ?? [];
  const result: EntityImage[] = [];

  for (const item of items) {
    const url = normalizeImageUrl(item.imageUrl);

    if (url) {
      result.push({ id: item.id, imageUrl: url, publicId: item.publicId });
    }
  }

  return result;
}

function normalizeCategory(value: string | undefined) {
  const normalizedValue = value?.trim().toLocaleUpperCase("uk-UA");

  if (normalizedValue === "CAT" || normalizedValue === "КІТ") {
    return "Кіт";
  }

  if (normalizedValue === "DOG" || normalizedValue === "СОБАКА") {
    return "Собака";
  }

  return value ?? "Тварина";
}

function normalizeCategoryCode(value: string | undefined) {
  const normalizedValue = value?.trim().toLocaleUpperCase("uk-UA");

  if (normalizedValue === "CAT" || normalizedValue === "КІТ") {
    return "CAT";
  }

  if (normalizedValue === "DOG" || normalizedValue === "СОБАКА") {
    return "DOG";
  }

  return normalizedValue ?? "";
}

function normalizeGender(value: string | undefined) {
  const normalizedValue = value?.trim().toLocaleUpperCase("uk-UA");

  if (normalizedValue === "MALE" || normalizedValue === "САМЕЦЬ") {
    return "Самець";
  }

  if (normalizedValue === "FEMALE" || normalizedValue === "САМКА") {
    return "Самка";
  }

  return value ?? "Не вказано";
}

function normalizeGenderCode(value: string | undefined) {
  const normalizedValue = value?.trim().toLocaleUpperCase("uk-UA");

  if (
    normalizedValue === "MALE" ||
    normalizedValue === "САМЕЦЬ" ||
    normalizedValue === "ХЛОПЧИК"
  ) {
    return "MALE";
  }

  if (
    normalizedValue === "FEMALE" ||
    normalizedValue === "САМКА" ||
    normalizedValue === "ДІВЧИНКА"
  ) {
    return "FEMALE";
  }

  return normalizedValue ?? "";
}

function normalizeHealthStatus(value: string | undefined) {
  const normalizedValue = value?.toUpperCase();

  if (normalizedValue === "VACCINATED") {
    return "Вакцинований";
  }

  if (normalizedValue === "STERILIZED") {
    return "Стерилізований";
  }

  if (normalizedValue === "HEALTHY") {
    return "Здоровий";
  }

  if (normalizedValue === "NEEDS_TREATMENT") {
    return "Потребує лікування";
  }

  return value ?? "Стан не вказано";
}

function formatAge(value: string | number | undefined) {
  if (typeof value === "number") {
    return `${value} ${getYearWord(value)}`;
  }

  return value ?? "Не вказано";
}

function getYearWord(value: number) {
  if (value === 1) {
    return "рік";
  }

  if (value > 1 && value < 5) {
    return "роки";
  }

  return "років";
}

