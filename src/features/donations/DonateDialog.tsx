"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";
import { LoadingOverlay } from "@/src/components/common/LoadingOverlay";
import { ModalDialog } from "@/src/components/common/ModalDialog";
import { createDonationCheckoutAction } from "@/src/features/donations/donations.action";

const PRESET_AMOUNTS = [100, 500, 1000] as const;
const MIN_AMOUNT = 10;

type DonateDialogProps = {
  shelterId: string;
  shelterName: string;
};

export function DonateDialog({ shelterId, shelterName }: DonateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(
    PRESET_AMOUNTS[0]
  );
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openDialog() {
    setSelectedPreset(PRESET_AMOUNTS[0]);
    setCustomAmount("");
    setError(null);
    setIsOpen(true);
  }

  function closeDialog() {
    if (isPending) {
      return;
    }

    setIsOpen(false);
  }

  function handlePresetClick(amount: number) {
    setSelectedPreset(amount);
    setCustomAmount("");
    setError(null);
  }

  function handleCustomChange(event: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = event.target.value.replace(/\D/g, "");
    setCustomAmount(digitsOnly);
    setSelectedPreset(null);
    setError(null);
  }

  function getAmount() {
    if (customAmount.length > 0) {
      return Number(customAmount);
    }

    return selectedPreset ?? 0;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPending) {
      return;
    }

    const amount = getAmount();

    if (!Number.isInteger(amount) || amount < MIN_AMOUNT) {
      setError(`Мінімальна сума — ${MIN_AMOUNT} ₴.`);
      return;
    }

    startTransition(async () => {
      const result = await createDonationCheckoutAction(shelterId, amount);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.url) {
        window.location.href = result.url;
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="inline-flex h-12 min-w-50 cursor-pointer items-center justify-center rounded-full bg-[#8456F0] px-8 text-sm font-semibold text-white transition hover:bg-[#7045D1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
      >
        Допомогти
      </button>

      <ModalDialog
        isOpen={isOpen}
        titleId="donate-dialog-title"
        onClose={closeDialog}
        as="form"
        closeDisabled={isPending}
        onSubmit={handleSubmit}
        className="max-w-[520px] rounded-[34px] px-6 pt-15 pb-9 sm:rounded-[36px] sm:px-12 sm:pt-16 sm:pb-12"
      >
        <h2 id="donate-dialog-title" className="text-2xl leading-8 font-bold">
          Підтримати притулок
        </h2>

        <p className="mt-3 text-sm leading-6 text-[#5F5F5F]">
          Оберіть суму допомоги для притулку «{shelterName}». Після підтвердження
          вас буде перенаправлено на сторінку безпечної оплати.
        </p>

        <fieldset className="mt-7" disabled={isPending}>
          <legend className="mb-2 text-sm font-semibold">Сума, ₴</legend>
          <div className="grid grid-cols-3 gap-3">
            {PRESET_AMOUNTS.map((amount) => {
              const isActive =
                customAmount.length === 0 && selectedPreset === amount;

              return (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handlePresetClick(amount)}
                  className={clsx(
                    "h-12 cursor-pointer rounded-full border text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]",
                    isActive
                      ? "border-[#8456F0] bg-[#8456F0] text-white"
                      : "border-[#E2E2E2] bg-white text-[#262626] hover:border-[#8456F0] hover:text-[#8456F0]"
                  )}
                >
                  {amount} ₴
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-semibold">Своя сума, ₴</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={customAmount}
            onChange={handleCustomChange}
            placeholder="Наприклад, 250"
            disabled={isPending}
            className="h-14 w-full rounded-3xl border border-transparent bg-[#F7F7F7] px-5 text-base leading-6 outline-none transition placeholder:text-[#8E8E8E] focus:border-[#8456F0] focus:bg-white disabled:opacity-60"
          />
        </label>

        <p className="mt-3 text-xs leading-5 text-[#8E8E8E]">
          Мінімальна сума — {MIN_AMOUNT} ₴. Email для квитанції ви зможете
          вказати на наступному кроці.
        </p>

        {error ? (
          <p className="mt-4 text-sm text-rose-600" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="mt-8 h-14 w-full cursor-pointer rounded-full bg-[#8456F0] text-base font-semibold text-white transition hover:bg-[#7045D1] disabled:cursor-not-allowed disabled:bg-[#DACAFF] disabled:text-[#8456F0] disabled:opacity-60"
        >
          {isPending ? "Створюємо платіж..." : "Перейти до оплати"}
        </button>

        {isPending ? <LoadingOverlay label="Підготовка оплати" /> : null}
      </ModalDialog>
    </>
  );
}
