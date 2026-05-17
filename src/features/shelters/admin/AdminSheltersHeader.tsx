import { AdminCreateShelterDialog } from "@/src/features/shelters/admin/AdminCreateShelterDialog";

export function AdminSheltersHeader() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-4xl leading-tight font-bold text-[#262626] sm:text-5xl">
        Притулки
      </h1>
      <AdminCreateShelterDialog />
    </div>
  );
}
