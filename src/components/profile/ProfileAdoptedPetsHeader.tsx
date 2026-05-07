export function ProfileAdoptedPetsHeader() {
  return (
    <div className="mt-12 flex items-center justify-between gap-4">
      <h2 className="text-xl font-bold">Адаптовані тварини</h2>
      <button
        type="button"
        className="cursor-pointer rounded-full bg-[#8456F0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7045D1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
      >
        Додати +
      </button>
    </div>
  );
}
