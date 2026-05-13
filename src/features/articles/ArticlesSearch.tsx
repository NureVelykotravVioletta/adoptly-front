import { ClearFiltersButton } from "@/src/components/common/ClearFiltersButton";
import { SearchControl } from "@/src/components/common/SearchControl";

type ArticlesSearchProps = {
  initialSearch?: string;
};

export function ArticlesSearch({ initialSearch = "" }: ArticlesSearchProps) {
  return (
    <div className="flex w-full gap-3 sm:max-w-[286px]">
      <SearchControl
        initialSearch={initialSearch}
        className="min-w-0 flex-1"
        ariaLabel="Пошук статей"
      />
      <ClearFiltersButton />
    </div>
  );
}
