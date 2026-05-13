"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import TrashIcon from "@/src/assets/icons/TrashIcon.svg";

type ClearFiltersButtonProps = {
  className?: string;
};

export function ClearFiltersButton({ className }: ClearFiltersButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasFilters = searchParams.toString().length > 0;

  function clearFilters() {
    router.push(pathname);
  }

  return (
    <button
      type="button"
      aria-label="Очистити всі фільтри"
      disabled={!hasFilters}
      onClick={clearFilters}
      className={
        className ??
        "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-[#8456F0] transition hover:bg-[#F4EEFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0] disabled:cursor-not-allowed disabled:text-[#B6B6B6] disabled:opacity-70"
      }
    >
      <TrashIcon className="h-4.5 w-4.5" aria-hidden="true" />
    </button>
  );
}
