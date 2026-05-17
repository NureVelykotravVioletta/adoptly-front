import { SheltersFilters } from "@/src/features/shelters/SheltersFilters";
import { SheltersList } from "@/src/features/shelters/SheltersList";
import { SheltersPagination } from "@/src/features/shelters/SheltersPagination";
import { isAdminUser } from "@/src/features/auth/auth.roles";
import { getCurrentUser } from "@/src/features/auth/auth.session";
import { AdminSheltersHeader } from "@/src/features/shelters/admin/AdminSheltersHeader";
import { AdminSheltersList } from "@/src/features/shelters/admin/AdminSheltersList";
import { getShelters } from "@/src/features/shelters/shelters.api";

const SHELTERS_LIMIT = 6;

type SheltersPageProps = {
  searchParams: Promise<{
    page?: string | string[];
    search?: string | string[];
    city?: string | string[];
  }>;
};

export default async function SheltersPage({
  searchParams,
}: SheltersPageProps) {
  const params = await searchParams;
  const page = getPageParam(params.page);
  const search = getStringParam(params.search);
  const city = getStringParam(params.city);
  const currentUser = await getCurrentUser();
  const isAdmin = isAdminUser(currentUser);
  const sheltersPage = await getShelters({
    page,
    limit: SHELTERS_LIMIT,
    search,
    city,
  });

  return (
    <div className="pb-8">
      {isAdmin ? (
        <div className="mb-10 space-y-8">
          <AdminSheltersHeader />
          <SheltersFilters
            key={`${search}-${city}`}
            search={search}
            city={city}
          />
        </div>
      ) : (
        <div className="mb-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] lg:items-start">
          <h1 className="text-4xl leading-tight font-bold text-[#262626] sm:text-5xl">
            Притулки
          </h1>
          <SheltersFilters
            key={`${search}-${city}`}
            search={search}
            city={city}
          />
        </div>
      )}

      {sheltersPage.items.length > 0 ? (
        isAdmin ? (
          <AdminSheltersList shelters={sheltersPage.items} />
        ) : (
          <SheltersList shelters={sheltersPage.items} />
        )
      ) : (
        <div className="flex min-h-80 items-center justify-center text-center text-base text-[#8E8E8E]">
          Притулків за цими параметрами не знайдено.
        </div>
      )}

      <SheltersPagination
        currentPage={sheltersPage.page}
        totalPages={sheltersPage.totalPages}
        search={search}
        city={city}
      />
    </div>
  );
}

function getPageParam(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const page = Number(rawValue);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

function getStringParam(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  return rawValue?.trim() ?? "";
}
