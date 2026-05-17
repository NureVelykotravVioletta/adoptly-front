"use client";

import Link from "next/link";
import { LikeAnimalButton } from "@/src/features/animals/LikeAnimalButton";
import type { Animal } from "@/src/features/animals/animals.api";

type ProfileFavoriteAnimalCardProps = {
  animal: Animal;
  onUnliked: (animalId: string) => void;
};

export function ProfileFavoriteAnimalCard({
  animal,
  onUnliked,
}: ProfileFavoriteAnimalCardProps) {
  return (
    <article className="flex w-full max-w-80 min-w-0 flex-col rounded-lg bg-white p-5 shadow-[0_8px_24px_rgba(38,38,38,0.04)]">
      <div className="mb-5 aspect-[1.78] overflow-hidden rounded-lg bg-[#D9D9D9]">
        {animal.imageUrl ? (
          <img
            src={animal.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="mb-2 flex items-start justify-between gap-3">
        <h2 className="min-w-0 text-[18px] leading-6 font-bold text-[#262626]">
          {animal.name}
        </h2>
      </div>

      <dl className="mb-3 grid grid-cols-3 gap-3 text-[11px] leading-4">
        <AnimalMeta label="Категорія" value={animal.category} />
        <AnimalMeta label="Вік" value={animal.age} />
        <AnimalMeta label="Стать" value={animal.gender} />
      </dl>

      <p className="mb-6 min-h-10 overflow-hidden text-[14px] leading-5 text-[#262626] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
        {animal.description}
      </p>

      <div className="mt-auto flex items-center gap-3">
        <Link
          href={`/animals/${encodeURIComponent(animal.id)}`}
          className="min-w-0 flex-1 cursor-pointer rounded-full bg-[#8456F0] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#7045D1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
        >
          Дізнатися більше
        </Link>
        <LikeAnimalButton
          animalId={animal.id}
          animalName={animal.name}
          initialLiked
          isAuthenticated
          variant="profile"
          onUnliked={onUnliked}
        />
      </div>
    </article>
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
