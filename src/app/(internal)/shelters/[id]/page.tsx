import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/src/components/common/Breadcrumbs";
import {
  getLikedAnimals,
  getShelterAnimals,
  normalizeLikedAnimalsData,
} from "@/src/features/animals/animals.api";
import { getAuthToken, getCurrentUser } from "@/src/features/auth/auth.session";
import { ShelterDetailsPanel } from "@/src/features/shelters/ShelterDetailsPanel";
import { ShelterGallery } from "@/src/features/shelters/ShelterGallery";
import { getShelter } from "@/src/features/shelters/shelters.api";

type ShelterDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ShelterDetailsPage({
  params,
}: ShelterDetailsPageProps) {
  const { id } = await params;
  const shelter = await getShelter(id);

  if (!shelter) {
    notFound();
  }

  const images = shelter.images.length > 0 ? shelter.images : [];
  const shelterAnimals = await getShelterAnimals({
    shelterId: shelter.id,
    shelterName: shelter.name,
  });
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
  const likedAnimalIds = likedAnimals.map((animal) => animal.id);

  return (
    <div className="pb-10">
      <Breadcrumbs
        items={[
          { label: "Притулки", href: "/shelters" },
          { label: shelter.name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(300px,520px)_minmax(0,1fr)] lg:items-start">
        <ShelterGallery images={images} shelterName={shelter.name} />

        <ShelterDetailsPanel
          shelter={shelter}
          animals={shelterAnimals}
          likedAnimalIds={likedAnimalIds}
        />
      </div>
    </div>
  );
}
