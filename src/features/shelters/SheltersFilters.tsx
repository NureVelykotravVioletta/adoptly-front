"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ClearFiltersButton } from "@/src/components/common/ClearFiltersButton";
import { FilterSelect } from "@/src/components/common/FilterSelect";
import { SearchControl } from "@/src/components/common/SearchControl";
import { cityOptions } from "@/src/components/common/filterOptions";

type SheltersFiltersProps = {
  search?: string;
  city?: string;
};

export function SheltersFilters({
  search = "",
  city = "",
}: SheltersFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateFilter(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="rounded-[28px] bg-[#D8C3FB] px-5 py-6 sm:px-9 lg:px-10">
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
        <SearchControl
          key={search}
          initialSearch={search}
          ariaLabel="Пошук притулків"
          inputClassName="border-transparent"
        />
        <FilterSelect
          value={city}
          ariaLabel="Фільтр за містом"
          placeholder="Місто"
          options={cityOptions}
          onChange={(value) => updateFilter("city", value)}
        />
        <ClearFiltersButton className="flex h-10 w-full shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-[#8456F0] transition hover:bg-[#F4EEFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0] disabled:cursor-not-allowed disabled:text-[#B6B6B6] disabled:opacity-70 sm:w-10" />
      </div>
    </div>
  );
}
