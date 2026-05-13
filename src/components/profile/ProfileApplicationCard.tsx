"use client";

import Link from "next/link";
import clsx from "clsx";
import type { AdoptionApplication } from "@/src/features/applications/applications.api";

type ProfileApplicationCardProps = {
  application: AdoptionApplication;
};

const statusLabels: Record<string, string> = {
  PENDING: "На розгляді",
  APPROVED: "Схвалено",
  REJECTED: "Відхилено",
};

const statusClassNames: Record<string, string> = {
  PENDING: "bg-[#FFF2D8] text-[#F3A51B]",
  APPROVED: "bg-[#DDFBDF] text-[#26C94E]",
  REJECTED: "bg-[#FFDADA] text-[#E22F2F]",
};

export function ProfileApplicationCard({
  application,
}: ProfileApplicationCardProps) {
  const animal = application.animal;
  const normalizedStatus = application.status.toUpperCase();
  const statusLabel = statusLabels[normalizedStatus] ?? application.status;
  const statusClassName =
    statusClassNames[normalizedStatus] ?? "bg-[#F0F0F0] text-[#5F5F5F]";
  const animalMeta = animal
    ? [
        { label: "Категорія", value: animal.category },
        { label: "Вік", value: animal.age },
        { label: "Стать", value: animal.gender },
      ]
    : [];

  return (
    <article className="grid w-full min-w-0 items-center justify-items-center gap-5 overflow-hidden rounded-[28px] bg-white px-5 py-7 shadow-[0_8px_24px_rgba(38,38,38,0.04)] sm:px-6 lg:grid-cols-[128px_minmax(0,1fr)_minmax(132px,160px)] lg:justify-items-stretch lg:gap-6 lg:px-7 lg:py-8 xl:grid-cols-[144px_minmax(0,1fr)_176px] xl:gap-8 xl:px-9 xl:py-9">
      <div className="h-20 w-32 overflow-hidden rounded-3xl bg-[#D9D9D9] lg:h-[84px] lg:w-32 lg:self-center xl:h-[92px] xl:w-36">
        {animal?.imageUrl ? (
          <img
            src={animal.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="min-w-0 text-center lg:text-left">
        {animal ? (
          <Link
            href={`/animals/${encodeURIComponent(animal.id)}`}
            className="block truncate text-2xl leading-8 font-bold text-[#262626] transition hover:text-[#8456F0]"
          >
            {animal.name}
          </Link>
        ) : (
          <h2 className="text-2xl leading-8 font-bold text-[#262626]">
            Тварину не знайдено
          </h2>
        )}

        {animal ? (
          <dl className="mt-4 grid grid-cols-3 gap-3 text-sm leading-5 xl:text-base xl:leading-6">
            {animalMeta.map((meta) => (
              <div key={meta.label} className="min-w-0">
                <dt className="truncate text-[#8E8E8E]">{meta.label}</dt>
                <dd className="truncate font-medium text-[#262626]">
                  {meta.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-4 text-base leading-6 text-[#8E8E8E]">
            Дані про тварину недоступні
          </p>
        )}
      </div>

      <span
        className={clsx(
          "inline-flex h-12 w-full max-w-48 shrink-0 items-center justify-center rounded-full px-4 text-base leading-5 font-medium lg:max-w-40 xl:h-13 xl:max-w-44",
          statusClassName
        )}
      >
        {statusLabel}
      </span>
    </article>
  );
}
