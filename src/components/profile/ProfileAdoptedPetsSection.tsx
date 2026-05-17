"use client";

import { useState } from "react";
import clsx from "clsx";
import type { Animal } from "@/src/features/animals/animals.api";
import TrashIcon from "@/src/assets/icons/TrashIcon.svg";

type ProfileAdoptedPetsSectionProps = {
  animals: Animal[];
};

export function ProfileAdoptedPetsSection({
  animals,
}: ProfileAdoptedPetsSectionProps) {
  const [hiddenAnimalIds, setHiddenAnimalIds] = useState<string[]>([]);
  const visibleAnimals = animals.filter(
    (animal) => !hiddenAnimalIds.includes(animal.id)
  );

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold">Адаптовані тварини</h2>

      {visibleAnimals.length > 0 ? (
        <div className="mt-8 space-y-4">
          {visibleAnimals.map((animal) => (
            <AdoptedAnimalCard
              key={animal.id}
              animal={animal}
              onRemove={() =>
                setHiddenAnimalIds((currentIds) => [...currentIds, animal.id])
              }
            />
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm leading-6 text-[#8E8E8E]">
          Тут автоматично зʼявляться тварини після схвалення заявки.
        </p>
      )}
    </section>
  );
}

function AdoptedAnimalCard({
  animal,
  onRemove,
}: {
  animal: Animal;
  onRemove: () => void;
}) {
  return (
    <article className="flex min-w-0 items-center gap-5 rounded-[28px] border border-[#E2E2E2] bg-white px-5 py-5">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-[#D9D9D9]">
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

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-bold text-[#262626]">
          {animal.name}
        </h3>

        <dl className="mt-4 grid grid-cols-3 gap-4 text-sm leading-5">
          <AdoptedAnimalMeta label="Категорія" value={animal.category} />
          <AdoptedAnimalMeta label="Вік" value={animal.age} />
          <AdoptedAnimalMeta label="Стать" value={animal.gender} />
        </dl>
      </div>

      <button
        type="button"
        aria-label={`Прибрати ${animal.name} зі списку адаптованих тварин`}
        onClick={onRemove}
        className={clsx(
          "flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full",
          "bg-[#DACAFF] text-[#8456F0] transition hover:bg-[#c7adff]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
        )}
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </article>
  );
}

function AdoptedAnimalMeta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-xs text-[#8E8E8E]">{label}</dt>
      <dd className="truncate text-sm font-medium text-[#262626]">{value}</dd>
    </div>
  );
}
