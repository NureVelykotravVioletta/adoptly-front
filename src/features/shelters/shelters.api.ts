import { ApiError, getApiBaseUrl } from "@/src/features/auth/auth.api";

export type Shelter = {
  id: string;
  name: string;
  city: string;
  address: string;
  description: string;
  imageUrl: string | null;
  images: string[];
  animalsCount: number;
  rating: number;
  phone: string;
  email: string;
  workingHours: string;
  foundedAt: string;
};

export type SheltersPageData = {
  items: Shelter[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type GetSheltersParams = {
  page: number;
  limit: number;
  search?: string;
  city?: string;
};

export type UpdateShelterPayload = Partial<{
  name: string;
  city: string;
  address: string;
  description: string;
  imageUrl: string | null;
  images: string[];
  animalsCount: number;
  phone: string;
  email: string;
  workingHours: string;
  foundedAt: string;
}>;

type ShelterApiItem = Partial<{
  id: string | number;
  _id: string | number;
  name: string;
  title: string;
  city: string;
  location: string;
  address: string;
  phone: string;
  phoneNumber: string;
  contactPhone: string;
  email: string;
  contactEmail: string;
  workingHours: string;
  workHours: string;
  hours: string;
  schedule: string;
  foundedAt: string;
  foundedYear: string | number;
  createdAt: string;
  description: string;
  about: string;
  imageUrl: string | null;
  image: string | null;
  photoUrl: string | null;
  coverUrl: string | null;
  images: ShelterApiImage[];
  rating: number;
  stars: number;
  animalsCount: number;
  animalCount: number;
  petsCount: number;
  petCount: number;
  animals: unknown[];
  pets: unknown[];
}>;

type ShelterApiImage =
  | string
  | null
  | Partial<{
      url: string | null;
      src: string | null;
      imageUrl: string | null;
      secureUrl: string | null;
      path: string | null;
    }>;

type SheltersApiResponse = Partial<{
  items: ShelterApiItem[];
  data: ShelterApiItem[];
  shelters: ShelterApiItem[];
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
    const response = await fetch(new URL(pathname, getApiBaseUrl()).toString(), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return;
    }

    const data = (await response.json().catch(() => null)) as
      | { message?: string | string[] }
      | null;
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
      getShelterApiErrorMessage(
        data,
        responseText,
        "Не вдалося зберегти зміни притулку."
      ),
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
  let lastRouteError: ApiError | null = null;

  for (const pathname of requests) {
    const formData = new FormData();
    formData.set("image", file);
    formData.set("file", file);
    formData.set("photo", file);

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
        getShelterApiErrorMessage(
          data,
          responseText,
          "Не вдалося завантажити фото притулку."
        ),
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
    new ApiError("Не знайдено endpoint для завантаження фото.", 404)
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
    return paginateShelters(
      data.map(normalizeShelter),
      fallbackPage,
      fallbackLimit
    );
  }

  const apiItems = data.items ?? data.data ?? data.shelters ?? [];
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
    items: apiItems.map(normalizeShelter),
    page,
    limit,
    total: total ?? apiItems.length,
    totalPages,
  };
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

  return paginateShelters(filtered, params.page, params.limit);
}

function paginateShelters(
  shelters: Shelter[],
  page: number,
  limit: number
): SheltersPageData {
  const totalPages = Math.max(1, Math.ceil(shelters.length / limit));
  const normalizedPage = Math.min(page, totalPages);
  const start = (normalizedPage - 1) * limit;

  return {
    items: shelters.slice(start, start + limit),
    page: normalizedPage,
    limit,
    total: shelters.length,
    totalPages,
  };
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
      shelter.city ?? shelter.location ?? shelter.address ?? "Місто не вказано",
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

function safeParseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function getShelterApiErrorMessage(
  data: unknown,
  responseText: string,
  fallback: string
) {
  if (isRecord(data)) {
    const message = data.message;

    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }

    if (Array.isArray(message)) {
      const joinedMessage = message
        .filter((item): item is string => typeof item === "string")
        .join(" ");

      if (joinedMessage.length > 0) {
        return joinedMessage;
      }
    }
  }

  if (responseText.trim().length > 0) {
    return responseText;
  }

  return fallback;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

const FALLBACK_SHELTERS: Shelter[] = [
  {
    id: "hvostyky",
    name: "Дім Хвостиків",
    city: "Київ",
    address: "вул. Добра, 12",
    description:
      "Затишний притулок для котів і собак, де кожна тварина отримує турботу та увагу.",
    imageUrl:
      "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?auto=format&fit=crop&w=720&q=80",
    images: [
      "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&w=900&q=80",
    ],
    animalsCount: 32,
    rating: 2,
    phone: "0965433456",
    email: "dim.hvostykiv@gmail.com",
    workingHours: "Пн-Сб 8:00-18:00",
    foundedAt: "2018",
  },
  {
    id: "lapky-nadii",
    name: "Лапки Надії",
    city: "Львів",
    address: "вул. Надії, 8",
    description:
      "Притулок, що спеціалізується на порятунку покинутих та травмованих тварин.",
    imageUrl:
      "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=720&q=80",
    images: [
      "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80",
    ],
    animalsCount: 18,
    rating: 6,
    phone: "0671234567",
    email: "lapky.nadii@gmail.com",
    workingHours: "Пн-Пт 9:00-18:00",
    foundedAt: "2020",
  },
  {
    id: "druhe-zhyttia",
    name: "Друге Життя",
    city: "Харків",
    address: "просп. Турботи, 4",
    description:
      "Тут тварини отримують шанс почати все знову. Команда волонтерів дбає про здоров'я та адаптацію.",
    imageUrl:
      "https://images.unsplash.com/photo-1551730459-92db2a308d6a?auto=format&fit=crop&w=720&q=80",
    images: [
      "https://images.unsplash.com/photo-1551730459-92db2a308d6a?auto=format&fit=crop&w=900&q=80",
    ],
    animalsCount: 27,
    rating: 11,
    phone: "0507654321",
    email: "druhe.zhyttia@gmail.com",
    workingHours: "Пн-Сб 8:00-18:00",
    foundedAt: "2018",
  },
  {
    id: "tepli-lapy",
    name: "Теплі Лапи",
    city: "Одеса",
    address: "вул. Морська, 21",
    description:
      "Невеликий, але дуже дружній притулок, де кожна тварина має свою історію та підтримку.",
    imageUrl:
      "https://images.unsplash.com/photo-1563460716037-460a3ad24ba9?auto=format&fit=crop&w=720&q=80",
    images: [
      "https://images.unsplash.com/photo-1563460716037-460a3ad24ba9?auto=format&fit=crop&w=900&q=80",
    ],
    animalsCount: 18,
    rating: 4,
    phone: "0931112233",
    email: "tepli.lapy@gmail.com",
    workingHours: "Щодня 10:00-17:00",
    foundedAt: "2019",
  },
  {
    id: "virnyi-druh",
    name: "Вірний Друг",
    city: "Дніпро",
    address: "вул. Дружби, 15",
    description:
      "Притулок для собак, які залишилися без дому. Тут їх готують до життя в сім'ї.",
    imageUrl:
      "https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&w=720&q=80",
    images: [
      "https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&w=900&q=80",
    ],
    animalsCount: 31,
    rating: 23,
    phone: "0972223344",
    email: "virnyi.druh@gmail.com",
    workingHours: "Пн-Пт 9:00-18:00",
    foundedAt: "2017",
  },
  {
    id: "kotiachyi-svit",
    name: "Котячий Світ",
    city: "Вінниця",
    address: "вул. Котяча, 6",
    description:
      "Притулок, що опікується котами різного віку. Особлива увага приділяється комфортному утриманню.",
    imageUrl:
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=720&q=80",
    images: [
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=80",
    ],
    animalsCount: 26,
    rating: 1,
    phone: "0669876543",
    email: "kotiachyi.svit@gmail.com",
    workingHours: "Вт-Нд 10:00-18:00",
    foundedAt: "2021",
  },
];
