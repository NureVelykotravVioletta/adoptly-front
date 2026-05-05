"use client";

import type { ReactNode } from "react";
import { useActionState, useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { loginAction } from "@/src/features/auth/login/login.action";
import { useLoginViewModel } from "@/src/features/auth/login/login.viewmodel";
import EyeOffIcon from "@/src/assets/icons/EyeOffIcon.svg";
import EyeOnIcon from "@/src/assets/icons/EyeOnIcon.svg";
import CrossIcon from "@/src/assets/icons/CrossIcon.svg";
import LoginImage from "@/src/assets/images/LoginImage.png";
import LoginImageMobile from "@/src/assets/images/LoginImageMobile.png";
import LoginImageTablet from "@/src/assets/images/LoginImageTablet.png";
import {
  type LoginFieldName,
  initialLoginActionState,
} from "@/src/features/auth/login/login.types";

function SubmitButton() {
  return (
    <button
      type="submit"
      className="w-full rounded-[999px] bg-[#8456F0] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#7045D1]"
    >
      Вхід
    </button>
  );
}

type FieldProps = {
  label: string;
  name: LoginFieldName;
  placeholder: string;
  error?: string;
  type?: "email" | "password" | "text";
  trailingIcon?: ReactNode;
  inputProps: {
    name: LoginFieldName;
    type: "text" | "email" | "password";
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
  };
};

function Field({
  label,
  name,
  placeholder,
  error,
  trailingIcon,
  inputProps,
}: FieldProps) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <div className="relative">
        <input
          {...inputProps}
          placeholder={placeholder}
          required
          className={clsx(
            "w-full rounded-[999px] border bg-[#FFFFFF] px-5 py-4 text-base text-[#262626] outline-none transition placeholder:text-[rgba(38,38,38,0.5)] focus:ring-4",
            trailingIcon ? "pr-14" : "",
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
              : "border-[rgba(38,38,38,0.15)] focus:border-[#8456F0] focus:ring-[rgba(132,86,240,0.14)]",
          )}
        />
        {trailingIcon ? (
          <span className="absolute inset-y-0 right-5 flex items-center">
            {trailingIcon}
          </span>
        ) : null}
      </div>
      {error ? (
        <p id={`${name}-error`} className="mt-2 text-sm text-rose-600">
          {error}
        </p>
      ) : null}
    </label>
  );
}

export function LoginForm() {
  const [actionState, formAction] = useActionState(
    loginAction,
    initialLoginActionState,
  );
  const [showPassword, setShowPassword] = useState(false);
  const { displayedErrors, handleSubmit, getInputProps } =
    useLoginViewModel(actionState);

  const getEmailIcon = () =>
    displayedErrors.email ? (
      <CrossIcon className="h-[22px] w-[22px] text-[#EF2447]" aria-hidden />
    ) : null;

  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="overflow-hidden rounded-[36px] shadow-[0_24px_80px_rgba(34,28,56,0.12)] lg:hidden">
        <Image
          src={LoginImageMobile}
          alt="Pets waiting for adoption"
          className="h-full w-full object-cover md:hidden"
          priority
        />
        <Image
          src={LoginImageTablet}
          alt="Pets waiting for adoption"
          className="hidden h-full w-full object-cover md:block"
          priority
        />
      </section>

      <section className="hidden overflow-hidden rounded-[36px] shadow-[0_24px_80px_rgba(34,28,56,0.12)] lg:block">
        <Image
          src={LoginImage}
          alt="Pets waiting for adoption"
          className="h-full w-full object-cover"
          priority
        />
      </section>

      <section className="rounded-[36px] bg-[#FFFFFF] px-6 pt-[60px] pb-8 sm:px-10 sm:pt-[70px] sm:pb-10 lg:pt-[118px] lg:pb-10">
        <div className="mx-auto max-w-[335px] md:max-w-[704px] lg:max-w-[560px]">
          <div className="mb-8">
            <h1 className="text-[38px] leading-none font-bold text-[#262626] sm:text-[54px]">
              Вхід
            </h1>
            <p className="mt-4 text-base leading-7 font-medium text-[#262626] sm:text-[18px]">
              Ласкаво просимо! Будь ласка, введіть свої облікові дані для входу
              на платформу:
            </p>
          </div>

          <form
            action={formAction}
            className="space-y-4"
            noValidate
            onSubmit={handleSubmit}
          >
            <Field
              label="Пошта"
              name="email"
              placeholder="Пошта"
              error={displayedErrors.email}
              trailingIcon={getEmailIcon()}
              inputProps={getInputProps("email", "email")}
            />

            <Field
              label="Пароль"
              name="password"
              placeholder="Пароль"
              error={displayedErrors.password}
              trailingIcon={
                <button
                  type="button"
                  className="flex h-[22px] w-[22px] items-center justify-center text-[#8456F0]"
                  aria-label={showPassword ? "Приховати пароль" : "Показати пароль"}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? (
                    <EyeOnIcon className="h-[22px] w-[22px]" aria-hidden />
                  ) : (
                    <EyeOffIcon className="h-[22px] w-[22px]" aria-hidden />
                  )}
                </button>
              }
              inputProps={getInputProps(
                "password",
                showPassword ? "text" : "password",
              )}
            />

            <div className="pt-6 sm:pt-12 lg:pt-12">
              {actionState.error ? (
                <div className="mb-4 rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {actionState.error}
                </div>
              ) : null}
              <SubmitButton />
              <p className="mt-4 text-center text-[14px] text-[rgba(38,38,38,0.8)]">
                Ще не маєте акаунту?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-[#8456F0] transition hover:opacity-80"
                >
                  Зареєструватися
                </Link>
              </p>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
