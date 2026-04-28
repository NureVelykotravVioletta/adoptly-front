"use client";

import { useActionState, useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { registerAction } from "@/src/features/auth/register/register.action";
import { useRegisterViewModel } from "@/src/features/auth/register/register.viewmodel";
import CrossIcon from "@/src/assets/icons/CrossIcon.svg";
import EyeOffIcon from "@/src/assets/icons/EyeOffIcon.svg";
import EyeOnIcon from "@/src/assets/icons/EyeOnIcon.svg";
import {
  type RegisterFieldName,
  initialRegisterActionState,
} from "@/src/features/auth/register/register.types";
import RegisterImage from "@/src/assets/images/RegisterImage.png";
import RegistrationImageMobile from "@/src/assets/images/RegistrationImageMobile.png";
import RegistrationImageTablet from "@/src/assets/images/RegistrationImageTablet.png";

function SubmitButton() {
  return (
    <button
      type="submit"
      className="w-full rounded-[999px] bg-[#8456F0] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#7045D1]"
    >
      Зареєструватися
    </button>
  );
}

type FieldProps = {
  label: string;
  name: RegisterFieldName;
  placeholder: string;
  error?: string;
  required?: boolean;
  type?: "text" | "email" | "password";
  trailingIcon?: React.ReactNode;
  inputProps: {
    name: RegisterFieldName;
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
  required = false,
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
          required={required}
          className={clsx(
            "w-full rounded-[999px] border bg-[#FFFFFF] px-5 py-4 text-base text-[#262626] outline-none transition placeholder:text-[rgba(38,38,38,0.5)] focus:ring-4",
            trailingIcon ? "pr-14" : "",
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
              : "border-[rgba(38,38,38,0.15)] focus:border-[#8456F0] focus:ring-[rgba(132,86,240,0.14)]",
          )}
        />
        {trailingIcon ? (
          <span className="pointer-events-none absolute inset-y-0 right-5 flex items-center">
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

export function RegisterForm() {
  const [actionState, formAction] = useActionState(
    registerAction,
    initialRegisterActionState,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { displayedErrors, handleSubmit, getInputProps } =
    useRegisterViewModel(actionState);

  const getTextFieldIcon = (fieldName: "name" | "email") =>
    displayedErrors[fieldName] ? (
      <CrossIcon className="h-[22px] w-[22px] text-[#EF2447]" aria-hidden />
    ) : null;

  const getPasswordIcon = (isVisible: boolean) =>
    isVisible ? (
      <EyeOnIcon className="h-[22px] w-[22px] text-[#8456F0]" aria-hidden />
    ) : (
      <EyeOffIcon className="h-[22px] w-[22px] text-[#8456F0]" aria-hidden />
    );

  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="overflow-hidden rounded-[36px] shadow-[0_24px_80px_rgba(34,28,56,0.12)] lg:hidden">
        <Image
          src={RegistrationImageMobile}
          alt="Pets waiting for adoption"
          className="h-full w-full object-cover md:hidden"
          priority
        />
        <Image
          src={RegistrationImageTablet}
          alt="Pets waiting for adoption"
          className="hidden h-full w-full object-cover md:block"
          priority
        />
      </section>

      <section className="hidden overflow-hidden rounded-[36px] shadow-[0_24px_80px_rgba(34,28,56,0.12)] lg:block">
        <Image
          src={RegisterImage}
          alt="Pets waiting for adoption"
          className="h-full w-full object-cover"
          priority
        />
      </section>

      <section className="rounded-[36px] bg-[#FFFFFF] px-6 py-8 sm:px-10 sm:py-10">
        <div className="mx-auto max-w-[335px] md:max-w-[704px] lg:max-w-[560px]">
          <div className="mb-8">
            <h1 className="text-[38px] leading-none font-bold text-[#262626] sm:text-[54px]">
              Реєстрація
            </h1>
            <p className="mt-4 text-base leading-7 font-medium text-[#262626] sm:text-[18px]">
              Дякуємо за ваш інтерес до нашої платформи.
            </p>
          </div>

          <form
            action={formAction}
            className="space-y-4"
            noValidate
            onSubmit={handleSubmit}
          >
            <Field
              label="Імʼя"
              name="name"
              placeholder="Імʼя"
              error={displayedErrors.name}
              required
              trailingIcon={getTextFieldIcon("name")}
              inputProps={getInputProps("name")}
            />

            <Field
              label="Пошта"
              name="email"
              placeholder="Пошта"
              error={displayedErrors.email}
              required
              trailingIcon={getTextFieldIcon("email")}
              inputProps={getInputProps("email", "email")}
            />

            <Field
              label="Пароль"
              name="password"
              placeholder="Пароль"
              error={displayedErrors.password}
              required
              trailingIcon={
                <button
                  type="button"
                  className="pointer-events-auto flex h-[22px] w-[22px] items-center justify-center text-[#8456F0]"
                  aria-label={showPassword ? "Приховати пароль" : "Показати пароль"}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {getPasswordIcon(showPassword)}
                </button>
              }
              inputProps={getInputProps(
                "password",
                showPassword ? "text" : "password",
              )}
            />

            <Field
              label="Підтвердити пароль"
              name="confirmPassword"
              placeholder="Підтвердити пароль"
              error={displayedErrors.confirmPassword}
              required
              trailingIcon={
                <button
                  type="button"
                  className="pointer-events-auto flex h-[22px] w-[22px] items-center justify-center text-[#8456F0]"
                  aria-label={
                    showConfirmPassword
                      ? "Приховати підтвердження пароля"
                      : "Показати підтвердження пароля"
                  }
                  onClick={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                >
                  {getPasswordIcon(showConfirmPassword)}
                </button>
              }
              inputProps={getInputProps(
                "confirmPassword",
                showConfirmPassword ? "text" : "password",
              )}
            />

            {actionState.error ? (
              <div className="rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {actionState.error}
              </div>
            ) : null}

            <div className="pt-2">
              <SubmitButton />
              <p className="mt-4 text-center text-[14px] text-[rgba(38,38,38,0.8)]">
                Вже маєте акаунт?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#8456F0] transition hover:opacity-80"
                >
                  Увійти
                </Link>
              </p>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
