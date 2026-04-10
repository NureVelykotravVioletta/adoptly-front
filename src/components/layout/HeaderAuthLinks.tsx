"use client";

import clsx from "clsx";
import Link from "next/link";

type HeaderAuthLinksProps = {
  isHome?: boolean;
  placement: "desktop" | "sidebar";
  onNavigate?: () => void;
};

export const HeaderAuthLinks = ({
  isHome = false,
  placement,
  onNavigate,
}: HeaderAuthLinksProps) => {
  const isSidebar = placement === "sidebar";

  return (
    <>
      <Link
        href="/login"
        onClick={onNavigate}
        className={clsx(
          "rounded-full transition",
          isSidebar
            ? "flex-1 border border-violet-200 px-4 py-3 text-center text-sm hover:border-violet-500 hover:bg-violet-50"
            : "hidden px-4 py-3 text-xs sm:px-6 sm:text-sm lg:inline-flex lg:px-[35px] lg:py-[15px]",
          !isSidebar &&
            (isHome
              ? "border border-white/40 hover:bg-white/12"
              : "border border-violet-200 hover:border-violet-500 hover:bg-violet-50"),
        )}
      >
        Вхід
      </Link>

      <Link
        href="/register"
        onClick={onNavigate}
        className={clsx(
          "rounded-full font-medium transition",
          isSidebar
            ? "flex-1 bg-[#8456F0] px-4 py-3 text-center text-sm text-white hover:bg-[#7045D1] hover:shadow-[0_12px_24px_rgba(132,86,240,0.24)]"
            : "hidden px-4 py-3 text-xs sm:text-sm lg:inline-flex lg:px-[20px] lg:py-[15px]",
          !isSidebar &&
            (isHome
              ? "bg-[#DACAFF] text-violet-600 hover:bg-white hover:text-[#7045D1]"
              : "bg-[#8456F0] text-white hover:bg-[#7045D1] hover:shadow-[0_12px_24px_rgba(132,86,240,0.24)]"),
        )}
      >
        Реєстрація
      </Link>
    </>
  );
};
