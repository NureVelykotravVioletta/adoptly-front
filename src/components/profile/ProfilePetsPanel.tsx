"use client";

import { useState } from "react";
import clsx from "clsx";
import { ProfileApplicationCard } from "@/src/components/profile/ProfileApplicationCard";
import { ProfileFavoriteAnimalCard } from "@/src/components/profile/ProfileFavoriteAnimalCard";
import type { AdoptionApplication } from "@/src/features/applications/applications.api";
import type { Animal } from "@/src/features/animals/animals.api";

const tabs = [
  {
    id: "favorites",
    label: "Обрані тварини",
    emptyText: (
      <>
        Ой,{" "}
        <span className="text-[#8456F0]">
          схоже, на цій сторінці ще немає пухнастиків.
        </span>{" "}
        Не хвилюйтеся! Перегляньте своїх улюбленців на сторінці «Знайти
        улюбленця» та додайте їх до обраного.
      </>
    ),
  },
  {
    id: "applications",
    label: "Подані заявки",
    emptyText: (
      <>
        Ой,{" "}
        <span className="text-[#8456F0]">схоже, ви ще не подавали заявки.</span>{" "}
        Коли ви подасте заявку на адопцію, вона зʼявиться тут.
      </>
    ),
  },
] as const;

type ProfilePetsTab = (typeof tabs)[number]["id"];

type ProfilePetsPanelProps = {
  likedAnimals: Animal[];
  applications: AdoptionApplication[];
};

export function ProfilePetsPanel({
  likedAnimals,
  applications,
}: ProfilePetsPanelProps) {
  const [activeTab, setActiveTab] = useState<ProfilePetsTab>("favorites");
  const [visibleLikedAnimals, setVisibleLikedAnimals] = useState(likedAnimals);
  const activeTabContent = tabs.find((tab) => tab.id === activeTab);
  const hasFavoriteAnimals =
    activeTab === "favorites" && visibleLikedAnimals.length > 0;
  const hasApplications =
    activeTab === "applications" && applications.length > 0;

  return (
    <div className="flex w-full min-h-130 flex-col lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto lg:pr-2">
      <div
        className="sticky top-0 z-10 flex justify-center gap-2 bg-[#F7F7F7] py-4 lg:justify-start"
        role="tablist"
        aria-label="Списки профілю"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "cursor-pointer rounded-full px-6 py-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]",
                isActive
                  ? "bg-[#8456F0] text-white hover:bg-[#7045D1]"
                  : "bg-white text-[#262626] hover:bg-[#DACAFF] hover:text-[#8456F0]",
                tab.id === "applications" && "px-10"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {hasFavoriteAnimals ? (
        <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),320px))] justify-center gap-8 lg:justify-start">
          {visibleLikedAnimals.map((animal) => (
            <ProfileFavoriteAnimalCard
              key={animal.id}
              animal={animal}
              onUnliked={(animalId) =>
                setVisibleLikedAnimals((currentAnimals) =>
                  currentAnimals.filter(
                    (currentAnimal) => currentAnimal.id !== animalId
                  )
                )
              }
            />
          ))}
        </div>
      ) : hasApplications ? (
        <div className="mt-8 flex w-full flex-col items-center gap-4 lg:items-stretch">
          {applications.map((application) => (
            <ProfileApplicationCard
              key={application.id}
              application={application}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center px-4 text-center">
          <p className="max-w-115 text-base leading-6 text-[#262626]">
            {activeTabContent?.emptyText}
          </p>
        </div>
      )}
    </div>
  );
}
