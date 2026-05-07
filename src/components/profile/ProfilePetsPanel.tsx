"use client";

import { useState } from "react";
import clsx from "clsx";

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
        <span className="text-[#8456F0]">
          схоже, ви ще не подавали заявки.
        </span>{" "}
        Коли ви подасте заявку на адопцію, вона зʼявиться тут.
      </>
    ),
  },
] as const;

type ProfilePetsTab = (typeof tabs)[number]["id"];

export function ProfilePetsPanel() {
  const [activeTab, setActiveTab] = useState<ProfilePetsTab>("favorites");
  const activeTabContent = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="flex min-h-130 flex-col">
      <div className="flex gap-2" role="tablist" aria-label="Списки профілю">
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
                tab.id === "applications" && "px-10",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-1 items-center justify-center px-4 text-center">
        <p className="max-w-115 text-base leading-6 text-[#262626]">
          {activeTabContent?.emptyText}
        </p>
      </div>
    </div>
  );
}
