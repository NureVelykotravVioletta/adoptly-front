import Image from "next/image";
import Link from "next/link";
import ErrorPageCat from "@/src/assets/images/ErrorPageCat.png";

export function NotFoundContent() {
  return (
    <section className="relative left-1/2 flex h-[calc(100dvh-10rem)] min-h-[420px] w-screen -translate-x-1/2 items-stretch justify-center px-6">
      <div className="flex h-full w-full flex-col items-center justify-center rounded-[30px] bg-[#8456F0] px-5 py-12 text-center text-white sm:rounded-[48px]">
        <div className="relative flex w-full items-center justify-center">
          <span
            className="text-[140px] leading-none font-bold tracking-normal text-white sm:text-[220px] lg:text-[300px]"
            aria-hidden="true"
          >
            4
          </span>
          <div className="relative mx-2 flex h-34 w-34 shrink-0 items-end justify-center rounded-full bg-white/12 sm:mx-5 sm:h-48 sm:w-48 lg:h-58 lg:w-58">
            <Image
              src={ErrorPageCat}
              alt=""
              className="h-[105%] w-[105%] object-contain object-bottom"
              priority
              aria-hidden
            />
          </div>
          <span
            className="text-[140px] leading-none font-bold tracking-normal text-white sm:text-[220px] lg:text-[300px]"
            aria-hidden="true"
          >
            4
          </span>
        </div>

        <h1 className="mt-6 text-lg leading-7 font-bold sm:mt-8 sm:text-2xl">
          Упс! Ця сторінка не знайдена :(
        </h1>

        <Link
          href="/"
          className="mt-5 rounded-full bg-[#DACAFF] px-8 py-3 text-sm font-semibold text-[#8456F0] transition hover:bg-[#c7adff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          На головну сторінку
        </Link>
      </div>
    </section>
  );
}
