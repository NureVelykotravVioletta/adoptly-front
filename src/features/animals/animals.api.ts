import { ApiError, getApiBaseUrl } from "@/src/features/auth/auth.api";

export type Animal = {
  id: string;
  name: string;
  category: string;
  age: string;
  gender: string;
  city: string;
  description: string;
  imageUrl: string | null;
  images: string[];
  healthStatus: string;
  shelterId: string | null;
  shelterName: string;
  rating: number;
};

export type AnimalsPageData = {
  items: Animal[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type GetAnimalsParams = {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  gender?: string;
  city?: string;
};

export type CreateAnimalPayload = {
  name: string;
  type: string;
  age: number;
  gender: string;
  shelterId: string;
  breed?: string;
  description?: string;
  healthStatus?: string;
};

type AnimalApiItem = Partial<{
  id: string | number;
  _id: string | number;
  name: string;
  type: string;
  age: string | number;
  breed: string;
  healthStatus: string;
  status: string;
  gender: string;
  city: string;
  description: string;
  imageUrl: string | null;
  image: string | null;
  photoUrl: string | null;
  images: AnimalApiImage[];
  shelterId: string;
  shelter: AnimalApiShelter | null;
}>;

type AnimalApiImage =
  | string
  | null
  | Partial<{
      url: string | null;
      src: string | null;
      imageUrl: string | null;
      secureUrl: string | null;
      path: string | null;
    }>;

type AnimalApiShelter = Partial<{
  id: string | number;
  _id: string | number;
  name: string | null;
  title: string | null;
  city: string | null;
  location: string | null;
}>;

type AnimalsApiResponse = Partial<{
  items: AnimalApiItem[];
  data: AnimalApiItem[] | AnimalApiItem;
  item: AnimalApiItem;
  animal: AnimalApiItem;
  animals: AnimalApiItem[];
  pet: AnimalApiItem;
  pets: AnimalApiItem[];
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
  meta: PaginationMeta;
  pagination: PaginationMeta;
}>;

type LikedAnimalApiItem = Partial<{
  userId: string;
  animalId: string;
  animal: AnimalApiItem | null;
  createdAt: string;
}> &
  AnimalApiItem;

type LikedAnimalsApiResponse =
  | LikedAnimalApiItem[]
  | Partial<{
      items: LikedAnimalApiItem[];
      data: LikedAnimalApiItem[];
      likedAnimals: LikedAnimalApiItem[];
      animals: AnimalApiItem[];
      user: {
        likedAnimals?: unknown[];
      };
    }>;

type PaginationMeta = Partial<{
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
      getAnimalApiErrorMessage(data, "Не вдалося отримати обраних тварин."),
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

export async function createAnimal(
  token: string,
  payload: CreateAnimalPayload,
  image?: File | null
) {
  const endpointCandidates = [
    `/shelters/${encodeURIComponent(payload.shelterId)}/animals`,
    `/shelter/${encodeURIComponent(payload.shelterId)}/animals`,
    "/animals",
    "/pets",
  ];
  let lastRouteError: ApiError | null = null;

  for (const pathname of endpointCandidates) {
    for (const requestPayload of getCreateAnimalPayloadCandidates(
      payload,
      pathname
    )) {
      const result = image
        ? await requestCreateAnimalWithImage(
            token,
            pathname,
            requestPayload,
            image
          )
        : await requestCreateAnimal(token, pathname, requestPayload);

      if (result.ok) {
        return result.animal;
      }

      if (
        result.error.status === 404 ||
        isUnexpectedUploadFieldError(result.error) ||
        isValidationFailedError(result.error)
      ) {
        lastRouteError = result.error;
        continue;
      }

      throw result.error;
    }
  }

  throw (
    lastRouteError ??
    new ApiError("Не знайдено endpoint для створення тварини.", 404)
  );
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

async function requestCreateAnimalWithImage(
  token: string,
  pathname: string,
  payload: Record<string, string | number>,
  image: File
) {
  const imageFields = ["image", "photo", "file", "images", "photos"];
  let lastError: ApiError | null = null;

  for (const imageField of imageFields) {
    const formData = new FormData();

    Object.entries(payload).forEach(([field, value]) => {
      if (value !== undefined && value !== "") {
        formData.set(field, String(value));
      }
    });
    formData.set(imageField, image);

    const response = await fetch(createApiUrl(pathname), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      body: formData,
    });
    const result = await parseCreateAnimalResponse(response);

    if (result.ok) {
      return result;
    }

    lastError = result.error;

    if (!isUnexpectedUploadFieldError(result.error)) {
      return result;
    }
  }

  return {
    ok: false as const,
    error:
      lastError ?? new ApiError("Не вдалося завантажити фото тварини.", 400),
  };
}

function getCreateAnimalPayloadCandidates(
  payload: CreateAnimalPayload,
  pathname: string
): Record<string, string | number>[] {
  const { shelterId, ...restPayload } = payload;
  const isShelterScopedEndpoint =
    pathname.startsWith("/shelters/") || pathname.startsWith("/shelter/");
  const shelterPayload = isShelterScopedEndpoint ? {} : { shelterId };

  return [
    compactCreateAnimalPayload({
      ...restPayload,
      ...shelterPayload,
    }),
  ];
}

function compactCreateAnimalPayload(
  values: Record<string, string | number | undefined>
) {
  return Object.fromEntries(
    Object.entries(values).filter(
      (entry): entry is [string, string | number] =>
        entry[1] !== undefined && entry[1] !== ""
    )
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
        getAnimalApiErrorMessage(data, "Не вдалося створити тварину."),
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
      getAnimalApiErrorMessage(data, "Не вдалося прибрати тварину з притулку."),
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
      getAnimalApiErrorMessage(
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
  } catch {
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

    if (!response.ok) {
      return null;
    }

    const data = (await response.json().catch(() => null)) as
      | AnimalsApiResponse
      | AnimalApiItem[]
      | null;

    return normalizeAnimalsPage(data, params.page, params.limit);
  } catch {
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
    return paginateAnimals(
      data.map(normalizeAnimal),
      fallbackPage,
      fallbackLimit
    );
  }

  const apiItems =
    data.items ??
    getAnimalApiItemArray(data.data) ??
    data.animals ??
    data.pets ??
    [];
  const meta = data.meta;
  const pagination = data.pagination;
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
    pagination?.lastPage ??
    Math.max(1, Math.ceil((total ?? apiItems.length) / limit));

  return {
    items: apiItems.map(normalizeAnimal),
    page,
    limit,
    total: total ?? apiItems.length,
    totalPages,
  };
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function createApiUrl(pathname: string) {
  return new URL(pathname, getApiBaseUrl()).toString();
}

function safeParseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function isUnexpectedUploadFieldError(error: ApiError) {
  return error.message.toLowerCase().includes("unexpected field");
}

function isValidationFailedError(error: ApiError) {
  return error.message.toLowerCase().includes("validation failed");
}

function getAnimalApiErrorMessage(data: unknown, fallbackMessage: string) {
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

  return paginateAnimals(filtered, params.page, params.limit);
}

function paginateAnimals(
  animals: Animal[],
  page: number,
  limit: number
): AnimalsPageData {
  const totalPages = Math.max(1, Math.ceil(animals.length / limit));
  const normalizedPage = Math.min(page, totalPages);
  const start = (normalizedPage - 1) * limit;

  return {
    items: animals.slice(start, start + limit),
    page: normalizedPage,
    limit,
    total: animals.length,
    totalPages,
  };
}

function normalizeAnimal(animal: AnimalApiItem, index: number): Animal {
  const id = animal.id ?? animal._id ?? `animal-${index}`;
  const category = normalizeCategory(animal.type);
  const gender = normalizeGender(animal.gender);
  const images = getAnimalImageUrls(animal);
  const shelterId =
    animal.shelterId ?? animal.shelter?.id ?? animal.shelter?._id;

  return {
    id: String(id),
    name: animal.name ?? "Без імені",
    category,
    age: formatAge(animal.age),
    gender,
    city: animal.shelter?.city ?? animal.city ?? "Місто не вказано",
    description: animal.description ?? "",
    imageUrl: images[0] ?? null,
    images,
    healthStatus: normalizeHealthStatus(animal.healthStatus ?? animal.status),
    shelterId: shelterId ? String(shelterId) : null,
    shelterName:
      animal.shelter?.name ?? animal.shelter?.title ?? "Притулок не вказано",
    rating: 0,
  };
}

function getAnimalImageUrls(animal: AnimalApiItem) {
  const urls = [
    animal.imageUrl,
    animal.image,
    animal.photoUrl,
    ...getRawAnimalImageUrls(animal.images),
  ];
  const normalizedUrls = urls
    .map((url) => normalizeImageUrl(url))
    .filter((url): url is string => Boolean(url));

  return Array.from(new Set(normalizedUrls));
}

function getRawAnimalImageUrls(images: AnimalApiImage[] | undefined) {
  const urls: string[] = [];

  if (!images) {
    return urls;
  }

  for (const image of images) {
    if (typeof image === "string" && image) {
      urls.push(image);
      continue;
    }

    if (image && typeof image === "object") {
      const url =
        image.url ??
        image.src ??
        image.imageUrl ??
        image.secureUrl ??
        image.path;

      if (url) {
        urls.push(url);
      }
    }
  }

  return urls;
}

function normalizeImageUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  if (/^(https?:|data:|blob:)/.test(url)) {
    return url;
  }

  if (url.startsWith("/")) {
    return new URL(url, getApiBaseUrl()).toString();
  }

  return url;
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

const FALLBACK_ANIMALS: (Animal & {
  categoryCode: string;
  genderCode: string;
})[] = [
  {
    id: "murczyk",
    name: "Мурчик",
    category: "Кіт",
    categoryCode: "CAT",
    age: "3 роки",
    gender: "Самець",
    genderCode: "MALE",
    city: "Київ",
    description: "Дружній, любить гратися та обійматися",
    imageUrl:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=640&q=80",
    images: [
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=900&q=80",
    ],
    healthStatus: "Вакцинований",
    shelterId: "hvostyky",
    shelterName: "Дім Хвостиків",
    rating: 2,
  },
  {
    id: "luna",
    name: "Луна",
    category: "Кіт",
    categoryCode: "CAT",
    age: "1 рік",
    gender: "Самка",
    genderCode: "FEMALE",
    city: "Львів",
    description:
      "Спокійна та лагідна кішка, любить затишок і тихі вечори поруч із господарем.",
    imageUrl:
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=640&q=80",
    images: [
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=900&q=80",
    ],
    healthStatus: "Вакцинована",
    shelterId: "lapky-nadii",
    shelterName: "Лапки Надії",
    rating: 12,
  },
  {
    id: "barni",
    name: "Барні",
    category: "Собака",
    categoryCode: "DOG",
    age: "2 роки",
    gender: "Самець",
    genderCode: "MALE",
    city: "Харків",
    description:
      "Енергійний та відданий пес, чудово підходить для активної родини та прогулянок.",
    imageUrl:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=640&q=80",
    images: [
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80",
    ],
    healthStatus: "Вакцинований",
    shelterId: "druhe-zhyttia",
    shelterName: "Друге Життя",
    rating: 5,
  },
  {
    id: "snizhka",
    name: "Сніжка",
    category: "Кіт",
    categoryCode: "CAT",
    age: "2 роки",
    gender: "Самка",
    genderCode: "FEMALE",
    city: "Одеса",
    description:
      "Ніжна та обережна кішка, яка потребує трохи часу, щоб довіритися, але дуже ласкава.",
    imageUrl:
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=640&q=80",
    images: [
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=900&q=80",
    ],
    healthStatus: "Стерилізована",
    shelterId: "tepli-lapy",
    shelterName: "Теплі Лапи",
    rating: 4,
  },
  {
    id: "richi",
    name: "Річі",
    category: "Кіт",
    categoryCode: "CAT",
    age: "2 роки",
    gender: "Самець",
    genderCode: "MALE",
    city: "Київ",
    description:
      "Активний і допитливий кіт, любить гратися та досліджувати все навколо.",
    imageUrl:
      "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?auto=format&fit=crop&w=640&q=80",
    images: [
      "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?auto=format&fit=crop&w=900&q=80",
    ],
    healthStatus: "Здоровий",
    shelterId: "hvostyky",
    shelterName: "Дім Хвостиків",
    rating: 15,
  },
  {
    id: "bonia",
    name: "Боня",
    category: "Собака",
    categoryCode: "DOG",
    age: "0.5 року",
    gender: "Самка",
    genderCode: "FEMALE",
    city: "Вінниця",
    description:
      "Спокійна та дуже ніжна собака, ідеально підійде для тихого дому та неспішних прогулянок.",
    imageUrl:
      "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?auto=format&fit=crop&w=640&q=80",
    images: [
      "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?auto=format&fit=crop&w=900&q=80",
    ],
    healthStatus: "Вакцинована",
    shelterId: "kotiachyi-svit",
    shelterName: "Котячий Світ",
    rating: 8,
  },
  {
    id: "archie",
    name: "Арчі",
    category: "Собака",
    categoryCode: "DOG",
    age: "4 роки",
    gender: "Самець",
    genderCode: "MALE",
    city: "Дніпро",
    description:
      "Розумний пес із добрим характером, швидко вчиться і цінує увагу.",
    imageUrl:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=640&q=80",
    images: [
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80",
    ],
    healthStatus: "Вакцинований",
    shelterId: "virnyi-druh",
    shelterName: "Вірний Друг",
    rating: 9,
  },
  {
    id: "mila",
    name: "Міла",
    category: "Кіт",
    categoryCode: "CAT",
    age: "1 рік",
    gender: "Самка",
    genderCode: "FEMALE",
    city: "Київ",
    description: "Грайлива кішка з м'яким характером, добре ладнає з людьми.",
    imageUrl:
      "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=640&q=80",
    images: [
      "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=900&q=80",
    ],
    healthStatus: "Здорова",
    shelterId: "hvostyky",
    shelterName: "Дім Хвостиків",
    rating: 7,
  },
];
