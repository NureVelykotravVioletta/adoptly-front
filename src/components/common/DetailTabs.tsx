"use client";

import clsx from "clsx";

type DetailTabsProps<TTab extends string> = {
  tabs: readonly TTab[];
  activeTab: TTab;
  onTabChange?: (tab: TTab) => void;
  className?: string;
};

export function DetailTabs<TTab extends string>({
  tabs,
  activeTab,
  onTabChange,
  className,
}: DetailTabsProps<TTab>) {
  return (
    <div
      className={clsx("flex flex-wrap justify-center gap-3", className)}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab === activeTab;

        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange?.(tab)}
            className={
              isActive
                ? "h-12 cursor-default rounded-full bg-[#8456F0] px-7 text-sm font-semibold text-white"
                : "h-12 cursor-pointer rounded-full border border-[#8456F0] bg-white px-7 text-sm font-semibold text-[#262626] transition hover:bg-[#F4EEFF] hover:text-[#8456F0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
            }
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
