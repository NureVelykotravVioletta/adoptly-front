import {
  ApiError,
  getApiBaseUrl,
  getApiErrorMessage,
  isRecord,
} from "@/src/lib/api";
import {
  getAnimal,
  normalizeLikedAnimalsData,
} from "@/src/features/animals/animals.api";
import type {
  AdoptionApplication,
  AdoptionApplicationApiItem,
  AdoptionApplicationApiUser,
  ApplicationsApiResponse,
  ApplicationStatus,
  ApplicationUser,
  CreateApplicationRequest,
} from "@/src/types/api";

export type AdoptionApplicationStatus = ApplicationStatus | string;
export type { AdoptionApplication };
export type AdoptionApplicationUser = ApplicationUser;

type CreateAdoptionApplicationPayload = CreateApplicationRequest;

const USER_APPLICATION_ENDPOINTS = ["/applications/my"] as const;

export async function getUserApplications(
  token: string,
  userId?: string
): Promise<AdoptionApplication[]> {
  let lastRouteError: ApiError | null = null;
  let emptyResult: AdoptionApplication[] | null = null;

  for (const pathname of getUserApplicationEndpoints()) {
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
          getApiErrorMessage(
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

export async function getAdminApplications(
  token: string,
  status?: AdoptionApplicationStatus | ""
): Promise<AdoptionApplication[]> {
  const url = new URL("/applications", getApiBaseUrl());

  if (status) {
    url.searchParams.set("status", status);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  const data = (await response
    .json()
    .catch(() => null)) as ApplicationsApiResponse | null;

  if (!response.ok) {
    throw new ApiError(
      getApiErrorMessage(data, "Не вдалося отримати заявки."),
      response.status
    );
  }

  return normalizeAdoptionApplicationsData(data);
}

export async function createAdoptionApplication(
  token: string,
  payload: CreateAdoptionApplicationPayload
) {
  const response = await fetch(createApiUrl("/applications"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
    body: JSON.stringify({
      animalId: payload.animalId,
      message: payload.message,
    }),
  });

  const data = (await response
    .json()
    .catch(() => null)) as ApplicationsApiResponse | null;

  if (!response.ok) {
    throw new ApiError(
      getApiErrorMessage(data, "Не вдалося подати заявку."),
      response.status,
    );
  }

  return normalizeAdoptionApplicationData(data, payload.animalId);
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
      getApiErrorMessage(data, "Не вдалося оновити статус заявки."),
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
  const user = normalizeApplicationUser(item.user);

  return {
    id: String(item.id ?? item._id ?? `application-${index}`),
    message: typeof item.message === "string" ? item.message : null,
    status: item.status ?? "PENDING",
    userId: item.userId ? String(item.userId) : (user?.id ?? null),
    user,
    animalId: animalId ? String(animalId) : (animal?.id ?? ""),
    animal,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : null,
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : null,
  };
}

function normalizeApplicationUser(
  value: unknown
): AdoptionApplicationUser | null {
  if (!isRecord(value)) {
    return null;
  }

  const user = value as AdoptionApplicationApiUser;
  const id = user.id ?? user._id;
  const name = user.name ?? user.fullName ?? user.email ?? "Користувач";
  const avatarUrl = user.avatarUrl ?? user.avatar ?? user.imageUrl ?? user.photoUrl;

  return {
    id: id ? String(id) : "",
    name,
    avatarUrl: avatarUrl ?? null,
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

function getUserApplicationEndpoints() {
  return USER_APPLICATION_ENDPOINTS;
}

function isRouteNotFoundError(error: ApiError) {
  return error.status === 404 || error.status === 405;
}
