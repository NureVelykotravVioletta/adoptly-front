import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/src/components/common/Breadcrumbs";
import { isAdminUser } from "@/src/features/auth/auth.roles";
import { getCurrentUser } from "@/src/features/auth/auth.session";
import { getShelterAnimals } from "@/src/features/animals/animals.api";
import { AdminShelterEditView } from "@/src/features/shelters/admin/edit/AdminShelterEditView";
import { getShelter } from "@/src/features/shelters/shelters.api";

type ShelterEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ShelterEditPage({
  params,
}: ShelterEditPageProps) {
  const currentUser = await getCurrentUser();

  if (!isAdminUser(currentUser)) {
    notFound();
  }

  const { id } = await params;
  const shelter = await getShelter(id);

  if (!shelter) {
    notFound();
  }

  const animals = await getShelterAnimals({
    shelterId: shelter.id,
  });

  return (
    <div className="pb-8">
      <Breadcrumbs
        items={[
          { label: "Притулки", href: "/shelters" },
          { label: shelter.name },
        ]}
      />

      <AdminShelterEditView shelter={shelter} animals={animals} />
    </div>
  );
}
