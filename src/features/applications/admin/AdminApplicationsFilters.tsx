"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ClearFiltersButton } from "@/src/components/common/ClearFiltersButton";
import { FilterSelect } from "@/src/components/common/FilterSelect";
import type { AdoptionApplicationStatus } from "@/src/features/applications/applications.api";

type AdminApplicationsFiltersProps = {
  status?: AdoptionApplicationStatus | "";
};

const statusOptions = [
  { value: "", label: "Показати всі" },
  { value: "PENDING", label: "На розгляді" },
  { value: "APPROVED", label: "Схвалені" },
  { value: "REJECTED", label: "Відхилені" },
];

export function AdminApplicationsFilters({
  status = "",
}: AdminApplicationsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateStatus(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(220px,360px)_auto]">
      <FilterSelect
        value={status}
        ariaLabel="Фільтр за статусом заявки"
        placeholder="Статус"
        options={statusOptions}
        onChange={updateStatus}
        className="[&_button:first-child]:border-[#8456F0]"
      />
      <ClearFiltersButton className="flex h-10 w-full shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-[#8456F0] transition hover:bg-[#F4EEFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0] disabled:cursor-not-allowed disabled:text-[#B6B6B6] disabled:opacity-70 sm:w-10" />
    </div>
  );
}
