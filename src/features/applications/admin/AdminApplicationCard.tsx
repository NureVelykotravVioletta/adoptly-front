"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";
import { updateApplicationStatusAction } from "@/src/features/applications/applications.action";
import type {
  AdoptionApplication,
  AdoptionApplicationStatus,
} from "@/src/features/applications/applications.api";

type AdminApplicationCardProps = {
  application: AdoptionApplication;
};

const statusLabels: Record<string, string> = {
  PENDING: "На розгляді",
  APPROVED: "Схвалено",
  REJECTED: "Відхилено",
};

const statusClassNames: Record<string, string> = {
  PENDING: "bg-[#FFF2D8] text-[#F3A51B]",
  APPROVED: "bg-[#DDFBDF] text-[#26C94E]",
  REJECTED: "bg-[#FFDADA] text-[#E22F2F]",
};

export function AdminApplicationCard({
  application,
}: AdminApplicationCardProps) {
  const [currentApplication, setCurrentApplication] = useState(application);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const animal = currentApplication.animal;
  const user = currentApplication.user;
  const normalizedStatus = currentApplication.status.toUpperCase();
  const statusLabel =
    statusLabels[normalizedStatus] ?? currentApplication.status;
  const statusClassName =
    statusClassNames[normalizedStatus] ?? "bg-[#F0F0F0] text-[#5F5F5F]";
  const canModerate = normalizedStatus === "PENDING";

  function handleStatusChange(nextStatus: AdoptionApplicationStatus) {
    if (isPending) {
      return;
    }

    setError("");

    startTransition(async () => {
      const result = await updateApplicationStatusAction(
        currentApplication.id,
        nextStatus
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      setCurrentApplication((currentValue) => ({
        ...currentValue,
        ...(result.application ?? {}),
        status: result.application?.status ?? nextStatus,
      }));
    });
  }

  return (
    <article className="grid w-full min-w-0 gap-5 rounded-[28px] bg-white px-5 py-5 text-[#262626] shadow-[0_8px_24px_rgba(38,38,38,0.04)] md:grid-cols-[132px_minmax(0,1fr)] md:px-7 lg:grid-cols-[132px_minmax(0,1fr)_minmax(220px,280px)]">
      <div className="h-28 w-full overflow-hidden rounded-[22px] bg-[#D9D9D9] md:h-24 md:w-33">
        {animal?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={animal.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h2 className="truncate text-xl leading-7 font-bold">
            {animal?.name ?? "Тварину не знайдено"}
          </h2>
          <span
            className={clsx(
              "inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold",
              statusClassName
            )}
          >
            {statusLabel}
          </span>
        </div>

        <div className="mt-4 flex min-w-0 items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#D9D9D9]">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">
              {user?.name ?? "Користувач"}
            </p>
            {currentApplication.message ? (
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#5F5F5F]">
                {currentApplication.message}
              </p>
            ) : (
              <p className="mt-1 text-sm leading-5 text-[#8E8E8E]">
                Повідомлення не додано.
              </p>
            )}
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
      </div>

      {canModerate ? (
        <div className="flex gap-3 self-end lg:flex-col lg:self-center">
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleStatusChange("APPROVED")}
            className="h-11 flex-1 cursor-pointer rounded-full bg-[#26C94E] px-5 text-sm font-semibold text-white transition hover:bg-[#1EA73F] disabled:cursor-not-allowed disabled:opacity-60 lg:flex-none"
          >
            {isPending ? "Оновлення..." : "Прийняти"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleStatusChange("REJECTED")}
            className="h-11 flex-1 cursor-pointer rounded-full bg-[#E22F2F] px-5 text-sm font-semibold text-white transition hover:bg-[#C92424] disabled:cursor-not-allowed disabled:opacity-60 lg:flex-none"
          >
            Відхилити
          </button>
        </div>
      ) : null}
    </article>
  );
}
