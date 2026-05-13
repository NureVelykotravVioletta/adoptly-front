import { ApiError, getApiBaseUrl } from "@/src/features/auth/auth.api";
import {
  getAnimal,
  normalizeLikedAnimalsData,
} from "@/src/features/animals/animals.api";
import type { Animal } from "@/src/features/animals/animals.api";

export type AdoptionApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | string;

export type AdoptionApplication = {
  id: string;
  message: string | null;
  status: AdoptionApplicationStatus;
  userId: string | null;
  animalId: string;
  animal: Animal | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type AdoptionApplicationApiItem = Partial<{
  id: string | number;
  _id: string | number;
  message: string | null;
  status: AdoptionApplicationStatus;
  userId: string;
  animalId: string | number;
  animal: unknown;
  pet: unknown;
  createdAt: string;
  updatedAt: string;
}>;

type ApplicationsApiResponse =
  | AdoptionApplicationApiItem[]
  | Partial<{
      items: AdoptionApplicationApiItem[];
      data: AdoptionApplicationApiItem[];
      applications: AdoptionApplicationApiItem[];
      adoptionApplications: AdoptionApplicationApiItem[];
      user: {
        applications?: unknown[];
        adoptionApplications?: unknown[];
      };
      message: string | string[];
    }>;

type CreateAdoptionApplicationPayload = {
  animalId: string;
  message?: string;
};

const USER_APPLICATION_ENDPOINTS = [
  "/applications/my",
  "/users/me?include=applications",
  "/users/me?relations=applications",
  "/users/me",
  "/auth/me?include=applications",
  "/auth/me?relations=applications",
  "/auth/me",
  "/users/me/applications",
  "/adoption-applications/me",
  "/adoption-applications",
  "/adoption-application/me",
  "/adoption-application",
  "/adoption/application/me",
  "/adoption/applications/me",
  "/adoption/applications",
  "/applications/me",
  "/applications",
  "/application/me",
  "/application",
] as const;

export async function getUserApplications(
  token: string,
  userId?: string
): Promise<AdoptionApplication[]> {
  let lastRouteError: ApiError | null = null;
  let emptyResult: AdoptionApplication[] | null = null;

  for (const pathname of getUserApplicationEndpoints(userId)) {
    try {
      const response = await fetch(createApiUrl(pathname), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = (await response
        .json()
        .catch(() => null)) as ApplicationsApiResponse | null;

      console.log("[applications] GET response", {
        endpoint: pathname,
        status: response.status,
        data,
      });

      if (!response.ok) {
        const error = new ApiError(
          getApplicationApiErrorMessage(
            data,
            "Не вдалося отримати подані заявки."
          ),
          response.status
        );

        if (isRouteNotFoundError(error)) {
          lastRouteError = error;
          continue;
        }

        throw error;
      }

      const applications = await normalizeAdoptionApplicationsData(data);
      const userApplications = userId
        ? applications.filter(
            (application) =>
              !application.userId || application.userId === userId
          )
        : applications;

      if (userApplications.length > 0) {
        return userApplications;
      }

      emptyResult ??= userApplications;
    } catch (error) {
      if (error instanceof ApiError && isRouteNotFoundError(error)) {
        lastRouteError = error;
        continue;
      }

      throw error;
    }
  }

  if (emptyResult) {
    return emptyResult;
  }

  throw (
    lastRouteError ??
    new ApiError("Не знайдено endpoint для отримання заявок.", 404)
  );
}

export async function createAdoptionApplication(
  token: string,
  payload: CreateAdoptionApplicationPayload
) {
  const requests = [
    {
      pathname: "/adoption-applications",
      body: { animalId: payload.animalId, message: payload.message },
    },
    {
      pathname: "/adoption-application",
      body: { animalId: payload.animalId, message: payload.message },
    },
    {
      pathname: "/adoption/applications",
      body: { animalId: payload.animalId, message: payload.message },
    },
    {
      pathname: "/applications",
      body: { animalId: payload.animalId, message: payload.message },
    },
    {
      pathname: "/application",
      body: { animalId: payload.animalId, message: payload.message },
    },
    {
      pathname: "/users/me/applications",
      body: { animalId: payload.animalId, message: payload.message },
    },
    {
      pathname: `/animals/${encodeURIComponent(payload.animalId)}/applications`,
      body: { message: payload.message },
    },
    {
      pathname: `/pets/${encodeURIComponent(payload.animalId)}/applications`,
      body: { message: payload.message },
    },
  ];
  let lastRouteError: ApiError | null = null;

  for (const request of requests) {
    try {
      const response = await fetch(createApiUrl(request.pathname), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        body: JSON.stringify(request.body),
      });

      const data = (await response
        .json()
        .catch(() => null)) as ApplicationsApiResponse | null;

      console.log("[applications] POST response", {
        endpoint: request.pathname,
        status: response.status,
        data,
      });

      if (!response.ok) {
        const error = new ApiError(
          getApplicationApiErrorMessage(data, "Не вдалося подати заявку."),
          response.status
        );

        if (isRouteNotFoundError(error)) {
          lastRouteError = error;
          continue;
        }

        throw error;
      }

      return normalizeAdoptionApplicationData(data, payload.animalId);
    } catch (error) {
      if (error instanceof ApiError && isRouteNotFoundError(error)) {
        lastRouteError = error;
        continue;
      }

      throw error;
    }
  }

  throw (
    lastRouteError ??
    new ApiError("Не знайдено endpoint для подачі заявки.", 404)
  );
}

export async function updateAdoptionApplicationStatus(
  token: string,
  applicationId: string,
  status: AdoptionApplicationStatus
) {
  const response = await fetch(
    createApiUrl(`/applications/${encodeURIComponent(applicationId)}/status`),
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      body: JSON.stringify({ status }),
    }
  );
  const data = (await response
    .json()
    .catch(() => null)) as ApplicationsApiResponse | null;

  if (!response.ok) {
    throw new ApiError(
      getApplicationApiErrorMessage(data, "Не вдалося оновити статус заявки."),
      response.status
    );
  }

  return normalizeAdoptionApplicationData(data, applicationId);
}

export async function normalizeAdoptionApplicationsData(
  data: unknown
): Promise<AdoptionApplication[]> {
  const items = getApplicationItems(data);
  const applications = await Promise.all(
    items.map((item, index) =>
      normalizeAdoptionApplicationData(item, "", index)
    )
  );

  return applications.filter(
    (application): application is AdoptionApplication => Boolean(application)
  );
}

async function normalizeAdoptionApplicationData(
  data: unknown,
  fallbackAnimalId: string,
  index = 0
): Promise<AdoptionApplication | null> {
  const item = getApplicationItem(data);

  if (!item) {
    return null;
  }

  const rawAnimal = item.animal ?? item.pet ?? null;
  const normalizedAnimals = rawAnimal
    ? await normalizeLikedAnimalsData([rawAnimal])
    : [];
  const animalId =
    item.animalId ??
    (normalizedAnimals[0] ? normalizedAnimals[0].id : fallbackAnimalId);
  const animal =
    normalizedAnimals[0] ??
    (animalId ? await getAnimal(String(animalId)) : null);

  return {
    id: String(item.id ?? item._id ?? `application-${index}`),
    message: typeof item.message === "string" ? item.message : null,
    status: item.status ?? "PENDING",
    userId: item.userId ? String(item.userId) : null,
    animalId: animalId ? String(animalId) : (animal?.id ?? ""),
    animal,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : null,
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : null,
  };
}

function getApplicationItems(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (!isRecord(data)) {
    return [];
  }

  const user = data.user;
  const nestedData = data.data;

  if (isRecord(user)) {
    const userItems = getApplicationItems(user);

    if (userItems.length > 0) {
      return userItems;
    }
  }

  if (Array.isArray(data.applications)) {
    return data.applications;
  }

  if (Array.isArray(data.adoptionApplications)) {
    return data.adoptionApplications;
  }

  if (Array.isArray(data.adoptionApplication)) {
    return data.adoptionApplication;
  }

  if (Array.isArray(data.requests)) {
    return data.requests;
  }

  if (Array.isArray(data.adoptionRequests)) {
    return data.adoptionRequests;
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  if (isRecord(nestedData)) {
    return getApplicationItems(nestedData);
  }

  if (isRecord(data.application) || isRecord(data.adoptionApplication)) {
    return [data];
  }

  if ("animalId" in data || "animal" in data || "pet" in data) {
    return [data];
  }

  return [];
}

function getApplicationItem(data: unknown): AdoptionApplicationApiItem | null {
  if (!data || Array.isArray(data) || !isRecord(data)) {
    return null;
  }

  if (isRecord(data.application)) {
    return data.application;
  }

  if (isRecord(data.adoptionApplication)) {
    return data.adoptionApplication;
  }

  return data;
}

function createApiUrl(pathname: string) {
  return new URL(pathname, getApiBaseUrl()).toString();
}

function getUserApplicationEndpoints(userId?: string) {
  if (!userId) {
    return [...USER_APPLICATION_ENDPOINTS];
  }

  const encodedUserId = encodeURIComponent(userId);
  const userScopedEndpoints = [
    `/users/${encodedUserId}/applications`,
    `/users/${encodedUserId}/adoption-applications`,
    `/users/${encodedUserId}/adoption-application`,
    `/adoption-applications/user/${encodedUserId}`,
    `/adoption-application/user/${encodedUserId}`,
    `/adoption/applications/user/${encodedUserId}`,
    `/applications/user/${encodedUserId}`,
    `/application/user/${encodedUserId}`,
    `/adoption-applications?userId=${encodedUserId}`,
    `/adoption-application?userId=${encodedUserId}`,
    `/adoption/applications?userId=${encodedUserId}`,
    `/applications?userId=${encodedUserId}`,
    `/application?userId=${encodedUserId}`,
  ];

  return [...USER_APPLICATION_ENDPOINTS, ...userScopedEndpoints];
}

function getApplicationApiErrorMessage(data: unknown, fallbackMessage: string) {
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

function isRouteNotFoundError(error: ApiError) {
  return error.status === 404 || error.status === 405;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
