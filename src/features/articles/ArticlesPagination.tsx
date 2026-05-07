"use client";

import Link from "next/link";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import ArrowIcon from "@/src/assets/icons/ArrowIcon.svg";

const PAGINATION_ITEM_SIZE = 40;
const PAGINATION_GAP = 8;
const PAGINATION_CONTROLS_COUNT = 4;

type ArticlesPaginationProps = {
  currentPage: number;
  totalPages: number;
  search?: string;
};

export function ArticlesPagination({
  currentPage,
  totalPages,
  search,
}: ArticlesPaginationProps) {
  const navRef = useRef<HTMLElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  const fullPages = useMemo(() => getFullVisiblePages(totalPages), [totalPages]);
  const defaultPages = getDefaultVisiblePages(currentPage, totalPages);
  const compactPages = getCompactVisiblePages(currentPage, totalPages);
  const visiblePages = getAdaptiveVisiblePages({
    containerWidth,
    fullPages,
    defaultPages,
    compactPages,
  });
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  useEffect(() => {
    const navElement = navRef.current;

    if (!navElement) {
      return;
    }

    const updateWidth = () => {
      setContainerWidth(navElement.getBoundingClientRect().width);
    };
    const resizeObserver = new ResizeObserver(updateWidth);

    updateWidth();
    resizeObserver.observe(navElement);

    return () => resizeObserver.disconnect();
  }, []);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      ref={navRef}
      className="mt-16 flex items-center justify-center gap-2"
      aria-label="Пагінація статей"
    >
      <PaginationLink
        href={createArticlesHref(1, search)}
        ariaLabel="Перша сторінка"
        disabled={isFirstPage}
      >
        <DoubleArrow direction="left" />
      </PaginationLink>
      <PaginationLink
        href={createArticlesHref(currentPage - 1, search)}
        ariaLabel="Попередня сторінка"
        disabled={isFirstPage}
      >
        <SingleArrow direction="left" />
      </PaginationLink>

      <PaginationPages
        pages={visiblePages}
        currentPage={currentPage}
        search={search}
      />

      <PaginationLink
        href={createArticlesHref(currentPage + 1, search)}
        ariaLabel="Наступна сторінка"
        disabled={isLastPage}
      >
        <SingleArrow direction="right" />
      </PaginationLink>
      <PaginationLink
        href={createArticlesHref(totalPages, search)}
        ariaLabel="Остання сторінка"
        disabled={isLastPage}
      >
        <DoubleArrow direction="right" />
      </PaginationLink>
    </nav>
  );
}

function PaginationPages({
  pages,
  currentPage,
  search,
}: {
  pages: readonly (number | "ellipsis")[];
  currentPage: number;
  search?: string;
}) {
  return (
    <span className="flex items-center gap-2">
      {pages.map((page, index) =>
        page === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-10 w-10 items-center justify-center text-sm text-[#8E8E8E]"
          >
            ...
          </span>
        ) : (
          <PaginationLink
            key={page}
            href={createArticlesHref(page, search)}
            isActive={page === currentPage}
            ariaLabel={`Сторінка ${page}`}
          >
            {page}
          </PaginationLink>
        ),
      )}
    </span>
  );
}

function SingleArrow({ direction }: { direction: "left" | "right" }) {
  return (
    <ArrowIcon
      aria-hidden="true"
      className={clsx(
        "h-5 w-5 [&_path]:fill-current",
        direction === "left" && "rotate-180",
      )}
    />
  );
}

function DoubleArrow({ direction }: { direction: "left" | "right" }) {
  return (
    <span
      className={clsx(
        "flex items-center",
        direction === "left" && "rotate-180",
      )}
      aria-hidden="true"
    >
      <ArrowIcon className="h-4 w-4 [&_path]:fill-current" />
      <ArrowIcon className="-ml-2 h-4 w-4 [&_path]:fill-current" />
    </span>
  );
}

function PaginationLink({
  href,
  children,
  ariaLabel,
  isActive = false,
  disabled = false,
}: {
  href: string;
  children: React.ReactNode;
  ariaLabel: string;
  isActive?: boolean;
  disabled?: boolean;
}) {
  const className = clsx(
    "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition",
    isActive
      ? "border-[#8456F0] bg-[#8456F0] text-white"
      : "border-[#E2E2E2] bg-white text-[#262626] hover:border-[#8456F0] hover:text-[#8456F0]",
    disabled && "pointer-events-none opacity-45",
  );

  if (disabled) {
    return (
      <span className={className} aria-label={ariaLabel} aria-disabled="true">
        {children}
      </span>
    );
  }

  return (
    <Link className={className} href={href} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

function createArticlesHref(page: number, search?: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));

  if (search) {
    params.set("search", search);
  }

  return `/articles?${params.toString()}`;
}

function getFullVisiblePages(totalPages: number) {
  return Array.from({ length: totalPages }, (_, index) => index + 1);
}

function getDefaultVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 4) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "ellipsis"] as const;
  }

  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages] as const;
  }

  return [1, "ellipsis", currentPage, "ellipsis", totalPages] as const;
}

function getCompactVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 3) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 2) {
    return [1, 2, "ellipsis"] as const;
  }

  if (currentPage >= totalPages - 1) {
    return ["ellipsis", totalPages - 1, totalPages] as const;
  }

  return ["ellipsis", currentPage, "ellipsis"] as const;
}

function getAdaptiveVisiblePages({
  containerWidth,
  fullPages,
  defaultPages,
  compactPages,
}: {
  containerWidth: number | null;
  fullPages: readonly number[];
  defaultPages: readonly (number | "ellipsis")[];
  compactPages: readonly (number | "ellipsis")[];
}) {
  if (containerWidth === null) {
    return defaultPages;
  }

  if (getPaginationWidth(fullPages.length) <= containerWidth) {
    return fullPages;
  }

  if (getPaginationWidth(defaultPages.length) <= containerWidth) {
    return defaultPages;
  }

  return compactPages;
}

function getPaginationWidth(pagesCount: number) {
  const itemsCount = PAGINATION_CONTROLS_COUNT + pagesCount;
  return (
    itemsCount * PAGINATION_ITEM_SIZE + (itemsCount - 1) * PAGINATION_GAP
  );
}
