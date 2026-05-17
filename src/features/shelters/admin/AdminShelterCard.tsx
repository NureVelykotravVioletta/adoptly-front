import Link from "next/link";
import type { Shelter } from "@/src/features/shelters/shelters.api";
import { getAnimalsWord } from "@/src/lib/format";
import PencilIcon from "@/src/assets/icons/PencilIcon.svg";
import TrashIcon from "@/src/assets/icons/TrashIcon.svg";

type AdminShelterCardProps = {
  shelter: Shelter;
  onDelete: () => void;
};

export function AdminShelterCard({
  shelter,
  onDelete,
}: AdminShelterCardProps) {
  return (
    <article className="grid w-full min-w-0 items-center gap-5 rounded-[28px] bg-white px-5 py-5 text-[#262626] shadow-[0_8px_24px_rgba(38,38,38,0.04)] md:grid-cols-[132px_minmax(0,1fr)_auto] md:px-7">
      <div className="h-28 w-full overflow-hidden rounded-[22px] bg-[#D9D9D9] md:h-24 md:w-33">
        {shelter.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shelter.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h2 className="truncate text-xl leading-7 font-bold">
            {shelter.name}
          </h2>
          <span className="text-sm leading-5 text-[#8E8E8E]">
            {shelter.city}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#5F5F5F]">
          {shelter.description || "Опис притулку поки не додано."}
        </p>

        <dl className="mt-4 grid gap-3 text-sm leading-5 sm:grid-cols-4">
          <AdminShelterMeta label="Адреса" value={shelter.address || "-"} />
          <AdminShelterMeta label="Телефон" value={shelter.phone || "-"} />
          <AdminShelterMeta label="Email" value={shelter.email || "-"} />
          <AdminShelterMeta
            label="Тварини"
            value={`${shelter.animalsCount} ${getAnimalsWord(shelter.animalsCount)}`}
          />
        </dl>
      </div>

      <div className="flex justify-end gap-3 md:flex-col">
        <Link
          href={`/shelters/${encodeURIComponent(shelter.id)}/edit`}
          aria-label={`Редагувати ${shelter.name}`}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#FFF2D8] text-[#F3A51B] transition hover:bg-[#FFE4A8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3A51B]"
        >
          <PencilIcon className="h-5 w-5" />
        </Link>
        <button
          type="button"
          aria-label={`Видалити ${shelter.name}`}
          onClick={onDelete}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#FFDADA] text-[#E22F2F] transition hover:bg-[#FFC2C2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E22F2F]"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </article>
  );
}

function AdminShelterMeta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-xs text-[#8E8E8E]">{label}</dt>
      <dd className="truncate font-medium text-[#262626]">{value}</dd>
    </div>
  );
}
