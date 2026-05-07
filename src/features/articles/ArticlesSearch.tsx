"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SearchIcon from "@/src/assets/icons/SearchIcon.svg";

type ArticlesSearchProps = {
  initialSearch?: string;
};

export function ArticlesSearch({ initialSearch = "" }: ArticlesSearchProps) {
  const [value, setValue] = useState(initialSearch);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateSearch = useCallback(
    (searchValue: string, mode: "push" | "replace" = "push") => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmedValue = searchValue.trim();

      if (trimmedValue === (searchParams.get("search") ?? "")) {
        return;
      }

      params.set("page", "1");

      if (trimmedValue) {
        params.set("search", trimmedValue);
      } else {
        params.delete("search");
      }

      const query = params.toString();
      const href = query ? `${pathname}?${query}` : pathname;

      if (mode === "replace") {
        router.replace(href);
      } else {
        router.push(href);
      }
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      updateSearch(value, "replace");
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [updateSearch, value]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateSearch(value);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full sm:max-w-[230px]"
      role="search"
    >
      <input
        type="search"
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          setValue(nextValue);

          if (!nextValue) {
            updateSearch("");
          }
        }}
        placeholder="Пошук"
        className="h-10 w-full rounded-full border border-[#E2E2E2] bg-white pr-11 pl-4 text-sm text-[#262626] outline-none transition placeholder:text-[#B6B6B6] focus:border-[#8456F0]"
      />
      <button
        type="submit"
        aria-label="Шукати"
        className="absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#262626] transition hover:text-[#8456F0]"
      >
        <SearchIcon className="h-4 w-4" />
      </button>
    </form>
  );
}
