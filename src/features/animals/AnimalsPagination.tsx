import { Pagination } from "@/src/components/common/Pagination";

type AnimalsPaginationProps = {
  currentPage: number;
  totalPages: number;
  search?: string;
  category?: string;
  gender?: string;
  city?: string;
};

export function AnimalsPagination({
  currentPage,
  totalPages,
  search,
  category,
  gender,
  city,
}: AnimalsPaginationProps) {
  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      basePath="/animals"
      query={{ search, category, gender, city }}
      ariaLabel="Пагінація тварин"
    />
  );
}
