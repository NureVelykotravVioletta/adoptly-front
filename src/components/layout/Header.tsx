"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "../../assets/logo.svg";

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
      <header className="mx-auto w-full px-4 pt-4 sm:px-6 sm:pt-6">
      <div
        className={[
          "flex items-center justify-between rounded-t-[60px] rounded-b-none px-4 py-4 sm:px-6 lg:px-[64px]",
          isHome
            ? "bg-[#8456F0] text-white"
            : "border border-violet-100 bg-white text-slate-900 shadow-[0_18px_45px_rgba(109,84,190,0.08)]",
        ].join(" ")}
      >
        <Link href="/" className="flex items-center gap-2">
          <Logo
            className={isHome ? "h-7 w-auto text-white sm:h-8" : "h-7 w-auto text-[#8456F0] sm:h-8"}
          />
        </Link>

        <nav className="hidden gap-4 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "rounded-[30px] px-[20px] py-[15px] text-sm transition",
                isHome
                  ? "border border-white/40 hover:bg-white/12"
                  : "border border-violet-200 bg-violet-50/50 hover:border-violet-500 hover:bg-violet-100",
              ].join(" ")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className={[
              "rounded-full px-4 py-3 text-xs transition sm:px-6 sm:text-sm lg:px-[35px] lg:py-[15px]",
              isHome
                ? "border border-white/40  hover:bg-white/12"
                : "border border-violet-200 hover:border-violet-500 hover:bg-violet-50",
            ].join(" ")}
          >
            Вхід
          </Link>

          <Link
            href="/register"
            className={[
              "rounded-full px-4 py-3 text-xs font-medium transition sm:text-sm lg:px-[20px] lg:py-[15px]",
              isHome
                ? "bg-[#DACAFF] text-violet-600 hover:bg-white hover:text-[#7045D1]"
                : "bg-[#8456F0] text-white hover:bg-[#7045D1] hover:shadow-[0_12px_24px_rgba(132,86,240,0.24)]",
            ].join(" ")}
          >
            Реєстрація
          </Link>

          <button
            type="button"
            aria-label="Відкрити меню"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
            className={[
              "flex h-11 w-11 items-center justify-center rounded-full transition lg:hidden",
              isHome
                ? "border border-white/40 hover:bg-white/12"
                : "border border-violet-200 bg-violet-50/50 hover:border-violet-500 hover:bg-violet-100",
            ].join(" ")}
          >
            <span className="flex flex-col gap-1.5">
              <span className={isHome ? "block h-0.5 w-5 bg-white" : "block h-0.5 w-5 bg-[#8456F0]"} />
              <span className={isHome ? "block h-0.5 w-5 bg-white" : "block h-0.5 w-5 bg-[#8456F0]"} />
              <span className={isHome ? "block h-0.5 w-5 bg-white" : "block h-0.5 w-5 bg-[#8456F0]"} />
            </span>
          </button>
        </div>
      </div>
      </header>

      <div
        className={[
          "fixed inset-0 z-40 transition lg:hidden",
          isMenuOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        aria-hidden={!isMenuOpen}
      >
        <button
          type="button"
          aria-label="Закрити меню"
          onClick={() => setIsMenuOpen(false)}
          className={[
            "absolute inset-0 bg-slate-950/35 transition-opacity",
            isMenuOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />

        <aside
          className={[
            "absolute right-0 top-0 flex h-full w-full max-w-[320px] flex-col p-4 transition-transform duration-300 sm:max-w-[360px] sm:p-6",
            isMenuOpen ? "translate-x-0" : "translate-x-full",
          ].join(" ")}
        >
          <div
            className={[
              "flex h-full flex-col rounded-[32px] p-6 sm:p-8",
              isHome
                ? "bg-[#8456F0] text-white"
                : "border border-violet-100 bg-white text-slate-900 shadow-[0_18px_45px_rgba(109,84,190,0.12)]",
            ].join(" ")}
          >
            <div className="flex items-start justify-end">
              <button
                type="button"
                aria-label="Закрити меню"
                onClick={() => setIsMenuOpen(false)}
                className={[
                  "flex h-11 w-11 items-center justify-center rounded-full transition",
                  isHome
                    ? "border border-white/40 hover:bg-white/12"
                    : "border border-violet-200 bg-violet-50/50 hover:border-violet-500 hover:bg-violet-100",
                ].join(" ")}
              >
                <span className="relative block h-4 w-4">
                  <span
                    className={[
                      "absolute left-1/2 top-1/2 block h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45",
                      isHome ? "bg-white" : "bg-[#8456F0]",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "absolute left-1/2 top-1/2 block h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 -rotate-45",
                      isHome ? "bg-white" : "bg-[#8456F0]",
                    ].join(" ")}
                  />
                </span>
              </button>
            </div>

            <nav className="mt-8 flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={[
                    "rounded-[28px] px-5 py-4 text-base transition",
                    isHome
                      ? "border border-white/40 hover:bg-white/12"
                      : "border border-violet-200 bg-violet-50/50 hover:border-violet-500 hover:bg-violet-100",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
      </div>
    </>
  );
};
