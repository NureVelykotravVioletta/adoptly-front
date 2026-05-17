export function AdminSheltersHeader() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-4xl leading-tight font-bold text-[#262626] sm:text-5xl">
        Притулки
      </h1>
      <button
        type="button"
        className="cursor-pointer rounded-full bg-[#8456F0] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#7045D1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
      >
        Додати +
      </button>
    </div>
  );
}
