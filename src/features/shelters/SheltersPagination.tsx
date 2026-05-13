import { Pagination } from "@/src/components/common/Pagination";

type SheltersPaginationProps = {
  currentPage: number;
  totalPages: number;
  search?: string;
  city?: string;
};

export function SheltersPagination({
  currentPage,
  totalPages,
  search,
  city,
}: SheltersPaginationProps) {
  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      basePath="/shelters"
      query={{ search, city }}
      ariaLabel="Пагінація притулків"
    />
  );
}
