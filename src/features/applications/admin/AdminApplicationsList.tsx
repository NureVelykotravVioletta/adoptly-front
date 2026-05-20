import { AdminApplicationCard } from "@/src/features/applications/admin/AdminApplicationCard";
import type { AdoptionApplication } from "@/src/features/applications/applications.api";

type AdminApplicationsListProps = {
  applications: AdoptionApplication[];
};

export function AdminApplicationsList({
  applications,
}: AdminApplicationsListProps) {
  return (
    <div className="flex flex-col gap-5">
      {applications.map((application) => (
        <AdminApplicationCard key={application.id} application={application} />
      ))}
    </div>
  );
}
