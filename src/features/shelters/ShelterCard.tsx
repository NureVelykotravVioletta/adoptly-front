import Link from "next/link";
import type { Shelter } from "@/src/features/shelters/shelters.api";
import { getAnimalsWord } from "@/src/lib/format";

type ShelterCardProps = {
  shelter: Shelter;
};

export function ShelterCard({ shelter }: ShelterCardProps) {
  return (
    <article className="flex min-w-0 flex-col rounded-lg bg-white p-6 shadow-[0_8px_24px_rgba(38,38,38,0.04)]">
      <div className="mb-5 aspect-[1.78] overflow-hidden rounded-lg bg-[#D9D9D9]">
        {shelter.imageUrl ? (
          <img
            src={shelter.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="mb-1.5 flex items-start justify-between gap-3">
        <h2 className="min-w-0 text-[18px] leading-6 font-bold text-[#262626]">
          {shelter.name}
        </h2>
      </div>

      <p className="mb-3 flex items-center gap-1.5 text-[12px] leading-4 text-[#8E8E8E]">
        <span className="text-[#E84545]" aria-hidden="true">
          📍
        </span>
        {shelter.city}
      </p>

      <p className="mb-6 min-h-10 overflow-hidden text-[14px] leading-5 text-[#262626] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
        {shelter.description}
      </p>

      <div className="mt-auto">
        <p className="mb-4 flex items-center gap-1.5 text-[16px] leading-5 font-bold text-[#262626]">
          <span aria-hidden="true">🐾</span>
          {shelter.animalsCount} {getAnimalsWord(shelter.animalsCount)}
        </p>

        <Link
          href={`/shelters/${encodeURIComponent(shelter.id)}`}
          className="block w-full cursor-pointer rounded-full bg-[#8456F0] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#7045D1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
        >
          Переглянути
        </Link>
      </div>
    </article>
  );
}
