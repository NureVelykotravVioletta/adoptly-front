import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/src/components/common/Breadcrumbs";
import { AdoptionApplicationDialog } from "@/src/features/applications/AdoptionApplicationDialog";
import { getUserApplications } from "@/src/features/applications/applications.api";
import {
  getLocalAdoptionApplications,
  mergeApplications,
} from "@/src/features/applications/applications.session";
import { AnimalGallery } from "@/src/features/animals/AnimalGallery";
import { LikeAnimalButton } from "@/src/features/animals/LikeAnimalButton";
import {
  getAnimal,
  getLikedAnimals,
  normalizeLikedAnimalsData,
} from "@/src/features/animals/animals.api";
import { getAuthToken, getCurrentUser } from "@/src/features/auth/auth.session";
import { getDescriptionParagraphs } from "@/src/lib/format";

type AnimalDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AnimalDetailsPage({
  params,
}: AnimalDetailsPageProps) {
  const { id } = await params;
  const animal = await getAnimal(id);

  if (!animal) {
    notFound();
  }

  const images = animal.images.length > 0 ? animal.images : [];
  const token = await getAuthToken();
  const currentUser = token ? await getCurrentUser() : null;
  const userLikedAnimals = await normalizeLikedAnimalsData(
    currentUser?.likedAnimals
  );
  const endpointLikedAnimals = token
    ? await getLikedAnimals(token).catch(() =>
        normalizeLikedAnimalsData(currentUser?.likedAnimals)
      )
    : [];
  const likedAnimals =
    endpointLikedAnimals.length > 0 ? endpointLikedAnimals : userLikedAnimals;
  const isLiked = likedAnimals.some(
    (likedAnimal) => likedAnimal.id === animal.id
  );
  const endpointApplications =
    token && currentUser
      ? await getUserApplications(token, currentUser.id).catch(() => [])
      : [];
  const localApplications = currentUser
    ? await getLocalAdoptionApplications(currentUser.id)
    : [];
  const applications = mergeApplications(
    endpointApplications,
    localApplications
  );
  const hasExistingApplication = applications.some(
    (application) => application.animalId === animal.id
  );

  return (
    <div className="pb-10">
      <Breadcrumbs
        items={[
          { label: "Знайти улюбленця", href: "/animals" },
          { label: animal.name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(300px,520px)_minmax(0,1fr)] lg:items-center">
        <AnimalGallery images={images} animalName={animal.name} />

        <article className="rounded-[44px] bg-white px-6 py-8 shadow-[0_8px_24px_rgba(38,38,38,0.04)] sm:rounded-[54px] sm:px-10 lg:px-14 lg:py-12">
          <div className="mb-5 flex items-start justify-between gap-5">
            <div className="min-w-0">
              <h1 className="mb-4 text-3xl leading-tight font-bold text-[#262626] sm:text-4xl">
                {animal.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <GenderBadge gender={animal.gender} />
                <AnimalBadge>{animal.category}</AnimalBadge>
                <AnimalBadge>{animal.age}</AnimalBadge>
                <AnimalBadge>{animal.healthStatus}</AnimalBadge>
              </div>
            </div>

            <LikeAnimalButton
              animalId={animal.id}
              animalName={animal.name}
              initialLiked={isLiked}
              variant="details"
            />
          </div>

          <section className="mb-20">
            <h2 className="mb-3 text-2xl leading-8 font-bold text-[#262626]">
              Про тварину:
            </h2>
            <div className="space-y-5 text-base leading-7 text-[#262626]">
              {getDescriptionParagraphs(
                animal.description,
                "Опис тварини поки не додано."
              ).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-2xl leading-8 font-bold text-[#262626]">
            <h2>Притулок:</h2>
            <Link
              href={
                animal.shelterId
                  ? `/shelters/${encodeURIComponent(animal.shelterId)}`
                  : `/shelters?search=${encodeURIComponent(animal.shelterName)}`
              }
              className="text-[#8456F0] underline decoration-[#8456F0]/30 underline-offset-4 transition hover:text-[#7045D1]"
            >
              {animal.shelterName}
            </Link>
            <span className="text-base font-semibold text-[#8E8E8E]">|</span>
            <span className="flex items-center gap-1.5 text-base leading-6 font-semibold">
              <span className="text-[#E84545]" aria-hidden="true">
                📍
              </span>
              {animal.city}
            </span>
          </section>

          <div className="flex justify-center">
            <AdoptionApplicationDialog
              animalId={animal.id}
              animalName={animal.name}
              disabled={hasExistingApplication}
            />
          </div>
        </article>
      </div>
    </div>
  );
}

function AnimalBadge({
  children,
  variant = "outline",
}: {
  children: ReactNode;
  variant?: "filled" | "outline";
}) {
  if (variant === "filled") {
    return (
      <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-[#E9F7FF] px-3 text-sm font-semibold text-[#45A7F5]">
        {children}
      </span>
    );
  }

  return (
    <span className="rounded-full border border-[#8456F0] px-5 py-2 text-sm leading-4 font-semibold text-[#262626]">
      {children}
    </span>
  );
}

function GenderBadge({ gender }: { gender: string }) {
  const isFemale = isFemaleGender(gender);

  return (
    <span
      className={
        isFemale
          ? "flex h-9 min-w-9 items-center justify-center rounded-full bg-[#FFEAF4] px-3 text-sm font-semibold text-[#F36BAA]"
          : "flex h-9 min-w-9 items-center justify-center rounded-full bg-[#E9F7FF] px-3 text-sm font-semibold text-[#45A7F5]"
      }
      aria-label={isFemale ? "Самка" : "Самець"}
    >
      {isFemale ? "♀" : "♂"}
    </span>
  );
}

function isFemaleGender(gender: string) {
  const normalizedGender = gender.trim().toLocaleLowerCase("uk-UA");
  return normalizedGender === "female" || normalizedGender === "самка";
}
