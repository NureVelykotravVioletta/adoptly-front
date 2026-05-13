"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { DetailTabs } from "@/src/components/common/DetailTabs";
import { AnimalCard } from "@/src/features/animals/AnimalCard";
import type { Animal } from "@/src/features/animals/animals.api";
import type { Shelter } from "@/src/features/shelters/shelters.api";
import { getAnimalsWord, getDescriptionParagraphs } from "@/src/lib/format";

const tabs = ["Про притулок", "Тварини", "Допомога"] as const;

type ShelterDetailsTab = (typeof tabs)[number];

type ShelterDetailsPanelProps = {
  shelter: Shelter;
  animals: Animal[];
  likedAnimalIds?: string[];
};

export function ShelterDetailsPanel({
  shelter,
  animals,
  likedAnimalIds = [],
}: ShelterDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<ShelterDetailsTab>("Допомога");
  const likedAnimalIdsSet = new Set(likedAnimalIds);

  return (
    <div className="min-w-0 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto lg:pr-3">
      <DetailTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="sticky top-0 z-10 bg-[#F7F7F7] py-4"
      />

      {activeTab === "Про притулок" ? <ShelterAbout shelter={shelter} /> : null}

      {activeTab === "Тварини" ? (
        animals.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-7 rounded-[44px] bg-white p-6 shadow-[0_8px_24px_rgba(38,38,38,0.04)] sm:rounded-[54px] sm:p-10">
            {animals.map((animal) => (
              <AnimalCard
                key={animal.id}
                animal={animal}
                isLiked={likedAnimalIdsSet.has(animal.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-80 items-center justify-center rounded-[44px] bg-white px-6 py-8 text-center text-base text-[#8E8E8E] shadow-[0_8px_24px_rgba(38,38,38,0.04)] sm:rounded-[54px]">
            У цього притулку поки немає доступних тварин.
          </div>
        )
      ) : null}

      {activeTab === "Допомога" ? <ShelterHelp /> : null}
    </div>
  );
}

function ShelterHelp() {
  return (
    <article className="rounded-[44px] bg-white px-6 py-8 shadow-[0_8px_24px_rgba(38,38,38,0.04)] sm:rounded-[54px] sm:px-10 lg:px-14 lg:py-12">
      <h1 className="mb-3 text-3xl leading-tight font-bold text-[#262626] sm:text-4xl">
        Допомога притулку
      </h1>
      <p className="max-w-150 text-base leading-7 text-[#262626]">
        Притулок існує завдяки небайдужим людям. Ви можете підтримати тварин та
        допомогти їм знайти новий дім.
      </p>

      <div className="mt-6 border-t border-[#E2E2E2]" />

      <div className="flex min-h-60 items-center justify-center px-4 text-center text-base leading-6 text-[#8E8E8E]">
        Інформацію про допомогу буде додано пізніше.
      </div>
    </article>
  );
}

function ShelterAbout({ shelter }: { shelter: Shelter }) {
  return (
    <article className="rounded-[44px] bg-white px-6 py-8 shadow-[0_8px_24px_rgba(38,38,38,0.04)] sm:rounded-[54px] sm:px-10 lg:px-14 lg:py-12">
      <h1 className="mb-7 text-3xl leading-tight font-bold text-[#262626] sm:text-4xl">
        {shelter.name}
      </h1>

      <div className="mb-8 flex flex-wrap items-center gap-4">
        <span className="flex items-center gap-1.5 text-base leading-6 font-bold text-[#262626]">
          <span className="text-[#E84545]" aria-hidden="true">
            📍
          </span>
          {shelter.city}
        </span>
        <ShelterBadge>
          <span aria-hidden="true">🐾</span>
          {shelter.animalsCount} {getAnimalsWord(shelter.animalsCount)}
        </ShelterBadge>
      </div>

      <section className="mb-7">
        <h2 className="mb-3 text-2xl leading-8 font-bold text-[#262626]">
          Про притулок:
        </h2>
        <div className="space-y-5 text-base leading-7 text-[#262626]">
          {getDescriptionParagraphs(
            shelter.description,
            "Опис притулку поки не додано."
          ).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>

      <dl className="space-y-3 text-base leading-6 text-[#262626]">
        {shelter.foundedAt ? (
          <ShelterInfoItem
            icon="📅"
            label="Працює з"
            value={`${shelter.foundedAt} року`}
          />
        ) : null}
        {shelter.phone ? (
          <ShelterInfoItem icon="📞" label="Телефон" value={shelter.phone} />
        ) : null}
        {shelter.email ? (
          <ShelterInfoItem icon="✉️" label="Email" value={shelter.email} />
        ) : null}
        {shelter.address ? (
          <ShelterInfoItem icon="📌" label="Адреса" value={shelter.address} />
        ) : null}
      </dl>

      {shelter.workingHours ? (
        <p className="mt-8 text-2xl leading-8 font-bold text-[#262626]">
          Години роботи:{" "}
          <span className="font-medium">{shelter.workingHours}</span>
        </p>
      ) : null}
    </article>
  );
}

function ShelterBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#8456F0] px-5 text-sm leading-4 font-semibold text-[#262626]">
      {children}
    </span>
  );
}

function ShelterInfoItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <dt className="sr-only">{label}</dt>
      <span aria-hidden="true">{icon}</span>
      <dd>{value}</dd>
    </div>
  );
}
