import {
  getAuthToken,
  requireCurrentUser,
} from "@/src/features/auth/auth.session";
import { isAdminUser } from "@/src/features/auth/auth.roles";
import { ProfilePetsPanel } from "@/src/components/profile/ProfilePetsPanel";
import { ProfileSidebar } from "@/src/components/profile/ProfileSidebar";
import {
  getLikedAnimals,
  normalizeLikedAnimalsData,
  type Animal,
} from "@/src/features/animals/animals.api";
import {
  getUserApplications,
  normalizeAdoptionApplicationsData,
  type AdoptionApplication,
} from "@/src/features/applications/applications.api";
import {
  getLocalAdoptionApplications,
  mergeApplications,
} from "@/src/features/applications/applications.session";

export default async function ProfilePage() {
  const user = await requireCurrentUser();
  const isAdmin = isAdminUser(user);

  if (isAdmin) {
    return (
      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#F7F7F7] px-6">
        <div className="mx-auto flex w-full max-w-7xl justify-center">
          <ProfileSidebar user={user} showAdoptedAnimals={false} />
        </div>
      </section>
    );
  }

  const token = await getAuthToken();
  const userLikedAnimals = await normalizeLikedAnimalsData(user.likedAnimals);
  const userApplications = await normalizeAdoptionApplicationsData(user);
  const localApplications = await getLocalAdoptionApplications(user.id);
  const endpointLikedAnimals = token
    ? await getLikedAnimals(token).catch(() =>
        normalizeLikedAnimalsData(user.likedAnimals)
      )
    : [];
  const endpointApplications = token
    ? await getUserApplications(token, user.id).catch(() =>
        normalizeAdoptionApplicationsData(user)
      )
    : [];
  const likedAnimals =
    endpointLikedAnimals.length > 0 ? endpointLikedAnimals : userLikedAnimals;
  const applications = mergeApplications(
    endpointApplications.length > 0 ? endpointApplications : userApplications,
    localApplications
  );
  const adoptedAnimals = getAdoptedAnimals(applications);

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#F7F7F7] px-6">
      <div className="mx-auto grid w-full max-w-7xl items-start justify-items-center gap-8 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:justify-items-stretch">
        <ProfileSidebar user={user} adoptedAnimals={adoptedAnimals} />

        <ProfilePetsPanel
          likedAnimals={likedAnimals}
          applications={applications}
        />
      </div>
    </section>
  );
}

function getAdoptedAnimals(applications: AdoptionApplication[]) {
  const adoptedAnimalsById = new Map<string, Animal>();

  applications.forEach((application) => {
    const normalizedStatus = application.status.trim().toUpperCase();

    if (!isAdoptedStatus(normalizedStatus) || !application.animal) {
      return;
    }

    adoptedAnimalsById.set(application.animal.id, application.animal);
  });

  return Array.from(adoptedAnimalsById.values());
}

function isAdoptedStatus(status: string) {
  return status === "APPROVED" || status === "ADOPTED";
}
