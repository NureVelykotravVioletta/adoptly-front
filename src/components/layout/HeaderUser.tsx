"use client";

import clsx from "clsx";
import Link from "next/link";
import { LogoutConfirmDialog } from "@/src/components/auth/LogoutConfirmDialog";
import type { AuthUser } from "@/src/features/auth/auth.api";
import UserIcon from "../../assets/icons/UserIcon.svg";

type HeaderUserProps = {
  user: AuthUser;
  isHome?: boolean;
  placement: "desktop" | "sidebar";
  onNavigate?: () => void;
};

export function HeaderUser({
  user,
  isHome = false,
  placement,
  onNavigate,
}: HeaderUserProps) {
  const isSidebar = placement === "sidebar";

  return (
    <div
      className={clsx(
        "items-center",
        isSidebar ? "flex w-full flex-col gap-3" : "hidden gap-4 lg:flex",
      )}
    >
      <LogoutConfirmDialog
        triggerWrapperClassName={isSidebar ? "w-full" : ""}
        triggerClassName={clsx(
          "cursor-pointer rounded-full text-sm font-semibold uppercase transition",
          clsx(
            isSidebar
              ? "w-full px-5 py-3"
              : "min-w-21.5 px-7 py-4 leading-none",
            isHome
              ? "bg-[#DACAFF] text-[#8456F0] hover:bg-white"
              : "bg-[#8456F0] text-white hover:bg-[#7045D1]",
          ),
        )}
      />

      <Link
        href="/profile"
        onClick={onNavigate}
        className={clsx(
          "flex items-center gap-2.5 rounded-full transition",
          isSidebar ? "w-full px-4 py-3 hover:bg-violet-50" : "py-1",
        )}
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#DACAFF] bg-cover bg-center"
          style={
            user.avatarUrl
              ? { backgroundImage: `url(${user.avatarUrl})` }
              : undefined
          }
          aria-hidden
        >
          {user.avatarUrl ? null : (
            <UserIcon className="block h-5 text-[#8456F0]" />
          )}
        </span>
        <span
          className={clsx(
            "max-w-37.5 truncate text-sm font-semibold",
            isHome && !isSidebar ? "text-white" : "text-[#262626]",
          )}
        >
          {user.name}
        </span>
      </Link>
    </div>
  );
}
