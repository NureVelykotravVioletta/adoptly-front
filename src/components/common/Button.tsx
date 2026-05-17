"use client";

import { type ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "danger" | "neutral" | "icon";
type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#8456F0] text-white hover:bg-[#7045D1] disabled:bg-[#DACAFF] disabled:text-[#8456F0]",
  secondary:
    "bg-[#DACAFF] text-[#262626] hover:bg-[#c7adff] disabled:bg-[#E9DFFF] disabled:text-[#8456F0]",
  danger:
    "bg-[#E22F2F] text-white hover:bg-[#C92424] disabled:bg-[#FFDADA] disabled:text-[#E22F2F]",
  neutral: "bg-[#F4F4F4] text-[#262626] hover:bg-[#E8E8E8] disabled:opacity-70",
  icon: "bg-[#DACAFF] hover:bg-[#c7adff]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-12 px-7 text-sm",
  md: "h-12 px-7 text-base",
  lg: "h-15 w-full text-lg",
  icon: "h-9 w-9",
};

export function Button({
  variant = "primary",
  size = "sm",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex cursor-pointer items-center justify-center rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}
