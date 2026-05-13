import clsx from "clsx";
import PawIcon from "@/src/assets/icons/PawIcon.svg";

type PawLoaderProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "gap-0.5",
  md: "gap-1",
  lg: "gap-1.5",
};

const pawSizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-6 w-6",
};

const paws = [
  { className: "rotate-[-18deg]", delay: "0ms" },
  { className: "rotate-[10deg]", delay: "120ms" },
  { className: "rotate-[-8deg]", delay: "240ms" },
  { className: "rotate-[16deg]", delay: "360ms" },
];

export function PawLoader({
  label = "Завантаження",
  size = "md",
  className,
}: PawLoaderProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center text-[#8456F0]",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label={label}
    >
      {paws.map((paw, index) => (
        <PawIcon
          key={index}
          aria-hidden="true"
          className={clsx(
            pawSizeClasses[size],
            paw.className,
            "animate-bounce"
          )}
          style={{ animationDelay: paw.delay }}
        />
      ))}
      <span className="sr-only">{label}</span>
    </span>
  );
}
