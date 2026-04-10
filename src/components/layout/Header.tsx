"use client";
import { useEffect, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { HeaderAuthLinks } from "@/src/components/layout/HeaderAuthLinks";
import { HeaderSidebar } from "@/src/components/layout/HeaderSidebar";
import Logo from "../../assets/icons/Logo.svg";
import MenuIcon from "../../assets/icons/MenuIcon.svg";

const navItems = [
  { href: "/articles", label: "Поради" },
  { href: "/animals", label: "Знайти улюбленця" },
  { href: "/shelters", label: "Притулки" },
];

type HeaderProps = {
  variant?: "home" | "default";
};

export const Header = ({ variant = "default" }: HeaderProps) => {
  const isHome = variant === "home";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="mx-auto w-full px-6 pt-4 sm:px-6 sm:pt-6">
        <div
          className={clsx(
            "flex items-center justify-between rounded-t-[30px] rounded-b-none px-5 py-4 md:rounded-t-[60px] lg:px-[64px] md:px-8",
            isHome
              ? "bg-[#8456F0] text-white"
              : "border-x border-t border-violet-100 bg-white text-slate-900",
          )}
        >
          <Link href="/" className="flex items-center gap-2">
            <Logo
              className={clsx(
                "h-7 w-auto sm:h-8",
                isHome ? "text-white" : "text-[#8456F0]",
              )}
            />
          </Link>

          <nav className="hidden gap-4 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-[30px] px-[20px] py-[15px] text-sm transition",
                  isHome
                    ? "border border-white/40 hover:bg-white/12"
                    : "border border-violet-200 bg-violet-50/50 hover:border-violet-500 hover:bg-violet-100",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <HeaderAuthLinks
              isHome={isHome}
              placement="desktop"
              onNavigate={() => setIsMenuOpen(false)}
            />

            <button
              type="button"
              aria-label="Відкрити меню"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full transition lg:hidden"
            >
              <MenuIcon className="text-white w-9 h-9" />
            </button>
          </div>
        </div>
      </header>

      <HeaderSidebar
        isOpen={isMenuOpen}
        navItems={navItems}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
};
