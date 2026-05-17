import type { Animal } from "@/src/features/animals/animals.api";
import TrashIcon from "@/src/assets/icons/TrashIcon.svg";
import { AdminCreateAnimalDialog } from "@/src/features/shelters/admin/edit/AdminCreateAnimalDialog";

type AdminShelterAnimalsSectionProps = {
  shelterId: string;
  animals: Animal[];
  onAnimalCreated: (animal: Animal) => void;
  onRemoveAnimal: (animalId: string) => void;
};

export function AdminShelterAnimalsSection({
  shelterId,
  animals,
  onAnimalCreated,
  onRemoveAnimal,
}: AdminShelterAnimalsSectionProps) {
  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Тварини</h2>
        <AdminCreateAnimalDialog
          shelterId={shelterId}
          onCreated={onAnimalCreated}
        />
      </div>

      {animals.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {animals.map((animal) => (
            <article
              key={animal.id}
              className="group relative flex min-w-0 items-center gap-4 rounded-[24px] border border-[#E2E2E2] bg-white p-4"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[#D9D9D9]">
                {animal.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={animal.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold">{animal.name}</h3>
                <dl className="mt-3 grid grid-cols-3 gap-3 text-xs leading-4">
                  <AnimalMeta label="Категорія" value={animal.category} />
                  <AnimalMeta label="Вік" value={animal.age} />
                  <AnimalMeta label="Стать" value={animal.gender} />
                </dl>
              </div>
              <button
                type="button"
                aria-label={`Видалити ${animal.name}`}
                onClick={() => onRemoveAnimal(animal.id)}
                className="absolute top-4 right-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#FFDADA] text-[#E22F2F] opacity-0 shadow-[0_8px_24px_rgba(38,38,38,0.12)] transition group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E22F2F]"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex min-h-60 items-center justify-center rounded-[28px] bg-[#F7F7F7] px-6 text-center text-sm text-[#8E8E8E]">
          У цього притулку поки немає тварин.
        </div>
      )}
    </section>
  );
}

function AnimalMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-[#8E8E8E]">{label}</dt>
      <dd className="truncate font-medium text-[#262626]">{value}</dd>
    </div>
  );
}
