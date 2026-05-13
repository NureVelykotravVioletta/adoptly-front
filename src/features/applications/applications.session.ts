import { cookies } from "next/headers";
import type { AdoptionApplication } from "@/src/features/applications/applications.api";
import { normalizeAdoptionApplicationsData } from "@/src/features/applications/applications.api";

const LOCAL_APPLICATIONS_COOKIE = "local_adoption_applications";
const LOCAL_APPLICATIONS_MAX_AGE = 60 * 60 * 24 * 7;
const MAX_LOCAL_APPLICATIONS = 20;

const localApplicationsCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: LOCAL_APPLICATIONS_MAX_AGE,
};

type LocalApplicationsPayload = {
  userId: string;
  applications: AdoptionApplication[];
};

export async function getLocalAdoptionApplications(userId: string) {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCAL_APPLICATIONS_COOKIE)?.value;

  if (!cookieValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(cookieValue, "base64url").toString("utf8")
    ) as Partial<LocalApplicationsPayload>;

    if (parsed.userId !== userId || !Array.isArray(parsed.applications)) {
      return [];
    }

    return normalizeAdoptionApplicationsData(parsed.applications);
  } catch {
    return [];
  }
}

export async function addLocalAdoptionApplication(
  userId: string,
  application: AdoptionApplication
) {
  const cookieStore = await cookies();
  const currentApplications = await getLocalAdoptionApplications(userId);
  const applications = mergeApplications([application], currentApplications)
    .slice(0, MAX_LOCAL_APPLICATIONS)
    .map((currentApplication) => ({
      ...currentApplication,
      userId,
    }));
  const payload: LocalApplicationsPayload = {
    userId,
    applications,
  };

  cookieStore.set(
    LOCAL_APPLICATIONS_COOKIE,
    Buffer.from(JSON.stringify(payload), "utf8").toString("base64url"),
    localApplicationsCookieOptions
  );
}

export function mergeApplications(
  primaryApplications: AdoptionApplication[],
  fallbackApplications: AdoptionApplication[]
) {
  const mergedApplications: AdoptionApplication[] = [];

  for (const application of [...primaryApplications, ...fallbackApplications]) {
    const alreadyAdded = mergedApplications.some(
      (currentApplication) =>
        currentApplication.id === application.id ||
        (currentApplication.animalId.length > 0 &&
          currentApplication.animalId === application.animalId)
    );

    if (!alreadyAdded) {
      mergedApplications.push(application);
    }
  }

  return mergedApplications;
}
