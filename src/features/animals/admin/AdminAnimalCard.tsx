import { AdminListItemCard } from "@/src/components/common/AdminListItemCard";
import type { Animal } from "@/src/features/animals/animals.api";

type AdminAnimalCardProps = {
  animal: Animal;
  onDelete: () => void;
};

export function AdminAnimalCard({ animal, onDelete }: AdminAnimalCardProps) {
  return (
    <AdminListItemCard
      imageUrl={animal.imageUrl}
      title={animal.name}
      subtitle={animal.city}
      description={animal.description || "Опис тварини поки не додано."}
      meta={[
        { label: "Категорія", value: animal.category },
        { label: "Вік", value: animal.age },
        { label: "Стать", value: animal.gender },
        { label: "Стан", value: animal.healthStatus },
      ]}
      editHref={`/animals/${encodeURIComponent(animal.id)}/edit`}
      editAriaLabel={`Редагувати ${animal.name}`}
      deleteAriaLabel={`Видалити ${animal.name}`}
      onDelete={onDelete}
    />
  );
}
