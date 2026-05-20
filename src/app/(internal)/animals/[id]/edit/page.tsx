import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/src/components/common/Breadcrumbs";
import { AdminAnimalEditView } from "@/src/features/animals/admin/edit/AdminAnimalEditView";
import { getAnimal } from "@/src/features/animals/animals.api";
import { isAdminUser } from "@/src/features/auth/auth.roles";
import { getCurrentUser } from "@/src/features/auth/auth.session";

type AnimalEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AnimalEditPage({ params }: AnimalEditPageProps) {
  const currentUser = await getCurrentUser();

  if (!isAdminUser(currentUser)) {
    notFound();
  }

  const { id } = await params;
  const animal = await getAnimal(id);

  if (!animal) {
    notFound();
  }

  return (
    <div className="pb-8">
      <Breadcrumbs
        items={[
          { label: "Тварини", href: "/animals" },
          { label: animal.name },
        ]}
      />

      <AdminAnimalEditView animal={animal} />
    </div>
  );
}
