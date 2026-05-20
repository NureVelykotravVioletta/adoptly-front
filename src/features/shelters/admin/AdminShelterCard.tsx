import { AdminListItemCard } from "@/src/components/common/AdminListItemCard";
import type { Shelter } from "@/src/features/shelters/shelters.api";
import { getAnimalsWord } from "@/src/lib/format";

type AdminShelterCardProps = {
  shelter: Shelter;
  onDelete: () => void;
};

export function AdminShelterCard({
  shelter,
  onDelete,
}: AdminShelterCardProps) {
  return (
    <AdminListItemCard
      imageUrl={shelter.imageUrl}
      title={shelter.name}
      subtitle={shelter.city}
      description={shelter.description || "Опис притулку поки не додано."}
      meta={[
        { label: "Адреса", value: shelter.address || "-" },
        { label: "Телефон", value: shelter.phone || "-" },
        { label: "Email", value: shelter.email || "-" },
        {
          label: "Тварини",
          value: `${shelter.animalsCount} ${getAnimalsWord(shelter.animalsCount)}`,
        },
      ]}
      editHref={`/shelters/${encodeURIComponent(shelter.id)}/edit`}
      editAriaLabel={`Редагувати ${shelter.name}`}
      deleteAriaLabel={`Видалити ${shelter.name}`}
      onDelete={onDelete}
    />
  );
}
