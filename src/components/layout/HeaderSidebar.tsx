"use client";

import clsx from "clsx";
import Link from "next/link";
import { HeaderAuthLinks } from "@/src/components/layout/HeaderAuthLinks";
import CloseIcon from "../../assets/icons/CloseIcon.svg";

type NavItem = {
  href: string;
  label: string;
};

type HeaderSidebarProps = {
  isOpen: boolean;
  navItems: NavItem[];
  onClose: () => void;
};

export const HeaderSidebar = ({
  isOpen,
  navItems,
  onClose,
}: HeaderSidebarProps) => {
  return (
    <div
      className={clsx(
        "fixed inset-0 z-40 transition lg:hidden",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Закрити меню"
        onClick={onClose}
        className={clsx(
          "absolute inset-0 transition-opacity border-none",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />

      <aside
        className={clsx(
          "absolute right-0 top-0 flex h-full w-full max-w-[320px] flex-col bg-white transition-transform duration-300 sm:max-w-[360px]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-full flex-col px-6 py-4 text-slate-900 sm:px-8 sm:py-6">
          <div className="flex items-start justify-end">
            <button
              type="button"
              aria-label="Закрити меню"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full text-[#262626] transition-colors hover:text-black"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>

          <nav className="mt-8 flex flex-1 flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  "rounded-[28px] px-5 py-4 text-base transition",
                  "border border-violet-200 bg-violet-50/50 hover:border-violet-500 hover:bg-violet-100",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-6 flex items-center gap-3">
            <HeaderAuthLinks placement="sidebar" onNavigate={onClose} />
          </div>
        </div>
      </aside>
    </div>
  );
};
