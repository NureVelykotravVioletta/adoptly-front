import Link from "next/link";

export default function DonationSuccessPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center rounded-[44px] bg-white px-6 py-14 text-center shadow-[0_8px_24px_rgba(38,38,38,0.04)] sm:rounded-[54px] sm:px-12 sm:py-20">
      <div
        aria-hidden="true"
        className="flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F8EC] text-4xl"
      >
        🐾
      </div>

      <h1 className="mt-6 text-3xl leading-tight font-bold text-[#262626] sm:text-4xl">
        Дякуємо за допомогу!
      </h1>

      <p className="mt-4 max-w-md text-base leading-7 text-[#5F5F5F]">
        Ваш внесок отримано. Притулок отримає сповіщення про підтримку — ці
        кошти підуть на догляд за тваринами.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/shelters"
          className="inline-flex h-12 items-center rounded-full bg-[#8456F0] px-7 text-sm font-semibold text-white transition hover:bg-[#7045D1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
        >
          До списку притулків
        </Link>
        <Link
          href="/animals"
          className="inline-flex h-12 items-center rounded-full border border-[#8456F0] px-7 text-sm font-semibold text-[#8456F0] transition hover:bg-[#F4EEFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
        >
          Знайти улюбленця
        </Link>
      </div>
    </div>
  );
}
