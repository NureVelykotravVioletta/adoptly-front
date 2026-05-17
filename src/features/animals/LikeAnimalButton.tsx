"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { AuthRequiredDialog } from "@/src/components/auth/AuthRequiredDialog";
import { LoadingOverlay } from "@/src/components/common/LoadingOverlay";
import { toggleLikedAnimalAction } from "@/src/features/animals/liked-animals.action";

type LikeAnimalButtonProps = {
  animalId: string;
  animalName: string;
  initialLiked: boolean;
  isAuthenticated: boolean;
  variant?: "card" | "details" | "profile";
  onUnliked?: (animalId: string) => void;
};

export function LikeAnimalButton({
  animalId,
  animalName,
  initialLiked,
  isAuthenticated,
  variant = "card",
  onUnliked,
}: LikeAnimalButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [error, setError] = useState("");
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleToggle() {
    if (!isAuthenticated) {
      setIsAuthDialogOpen(true);
      return;
    }

    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setError("");

    startTransition(async () => {
      const result = await toggleLikedAnimalAction({
        animalId,
        liked: nextLiked,
      });

      if (result.error) {
        setIsLiked(result.liked);
        setError(result.error);
        return;
      }

      setIsLiked(result.liked);
      router.refresh();

      if (!result.liked) {
        onUnliked?.(animalId);
      }
    });
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={
          isLiked
            ? `Прибрати ${animalName} з обраних`
            : `Додати ${animalName} в обрані`
        }
        aria-pressed={isLiked}
        disabled={isPending}
        onClick={handleToggle}
        className={clsx(
          "flex shrink-0 cursor-pointer items-center justify-center rounded-full text-[#8456F0] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0] disabled:cursor-wait disabled:opacity-70",
          variant === "details" && "h-12 w-12 bg-[#D8C3FB] hover:bg-[#C7A9FA]",
          variant === "card" && "h-11 w-11 bg-[#F4EEFF] hover:bg-[#E8DBFF]",
          variant === "profile" && "h-10 w-10 bg-[#D8C3FB] hover:bg-[#C7A9FA]"
        )}
      >
        <HeartGlyph filled={isLiked} />
      </button>

      {isPending ? <LoadingOverlay label="Оновлення обраного" /> : null}

      {error ? (
        <span className="sr-only" role="status">
          {error}
        </span>
      ) : null}

      <AuthRequiredDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        title="Зареєструйтеся, щоб додати в обране"
        description={`Створіть акаунт або увійдіть, щоб зберегти ${animalName} в обраних.`}
      />
    </span>
  );
}

function HeartGlyph({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 18 18"
      aria-hidden="true"
      className="h-[18px] w-[18px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.6301 3.45753C15.247 3.07428 14.7922 2.77026 14.2916 2.56284C13.791 2.35542 13.2545 2.24866 12.7126 2.24866C12.1707 2.24866 11.6342 2.35542 11.1336 2.56284C10.633 2.77026 10.1782 3.07428 9.79509 3.45753L9.00009 4.25253L8.20509 3.45753C7.43132 2.68376 6.38186 2.24906 5.28759 2.24906C4.19331 2.24906 3.14386 2.68376 2.37009 3.45753C1.59632 4.2313 1.16162 5.28075 1.16162 6.37503C1.16162 7.4693 1.59632 8.51876 2.37009 9.29253L3.16509 10.0875L9.00009 15.9225L14.8351 10.0875L15.6301 9.29253C16.0133 8.90946 16.3174 8.45464 16.5248 7.95404C16.7322 7.45345 16.839 6.91689 16.839 6.37503C16.839 5.83316 16.7322 5.2966 16.5248 4.79601C16.3174 4.29542 16.0133 3.84059 15.6301 3.45753Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
