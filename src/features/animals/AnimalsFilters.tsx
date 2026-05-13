"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ClearFiltersButton } from "@/src/components/common/ClearFiltersButton";
import { FilterSelect } from "@/src/components/common/FilterSelect";
import { SearchControl } from "@/src/components/common/SearchControl";
import { cityOptions } from "@/src/components/common/filterOptions";

type AnimalsFiltersProps = {
  search?: string;
  category?: string;
  gender?: string;
  city?: string;
};

const genderOptions = [
  { value: "", label: "Показати всі" },
  { value: "FEMALE", label: "Самка" },
  { value: "MALE", label: "Самець" },
];

const categoryOptions = [
  { value: "", label: "Показати всі" },
  { value: "CAT", label: "Кіт" },
  { value: "DOG", label: "Собака" },
];

export function AnimalsFilters({
  search = "",
  category = "",
  gender = "",
  city = "",
}: AnimalsFiltersProps) {
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_1.15fr_auto]">
        <SearchControl
          key={search}
          initialSearch={search}
          ariaLabel="Пошук тварин"
          inputClassName="border-transparent"
        />
        <FilterSelect
          value={gender}
          ariaLabel="Фільтр за статтю"
          placeholder="Стать"
          options={genderOptions}
          onChange={(value) => updateFilter("gender", value)}
        />
        <FilterSelect
          value={category}
          ariaLabel="Фільтр за категорією"
          placeholder="Категорія"
          options={categoryOptions}
          onChange={(value) => updateFilter("category", value)}
        />
        <FilterSelect
          value={city}
          ariaLabel="Фільтр за містом"
          placeholder="Місто"
          options={cityOptions}
          onChange={(value) => updateFilter("city", value)}
        />
        <ClearFiltersButton className="flex h-10 w-full shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-[#8456F0] transition hover:bg-[#F4EEFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0] disabled:cursor-not-allowed disabled:text-[#B6B6B6] disabled:opacity-70 lg:w-10" />
      </div>
    </div>
  );
}
