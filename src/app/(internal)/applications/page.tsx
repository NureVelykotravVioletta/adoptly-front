import { notFound } from "next/navigation";
import { AdminApplicationsFilters } from "@/src/features/applications/admin/AdminApplicationsFilters";
import { AdminApplicationsList } from "@/src/features/applications/admin/AdminApplicationsList";
import {
  getAdminApplications,
  type AdoptionApplicationStatus,
} from "@/src/features/applications/applications.api";
import { isAdminUser } from "@/src/features/auth/auth.roles";
import { getAuthToken, getCurrentUser } from "@/src/features/auth/auth.session";

type ApplicationsPageProps = {
  searchParams: Promise<{
    status?: string | string[];
  }>;
};

const allowedStatuses = new Set(["PENDING", "APPROVED", "REJECTED"]);

export default async function ApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  const currentUser = await getCurrentUser();

  if (!isAdminUser(currentUser)) {
    notFound();
  }

  const token = await getAuthToken();

  if (!token) {
    notFound();
  }

  const params = await searchParams;
  const status = getStatusParam(params.status);
  const applications = await getAdminApplications(token, status);

  return (
    <div className="pb-8">
      <div className="mb-10 space-y-8">
        <h1 className="text-4xl leading-tight font-bold text-[#262626] sm:text-5xl">
          Заявки
        </h1>
        <AdminApplicationsFilters status={status} />
      </div>

      {applications.length > 0 ? (
        <AdminApplicationsList applications={applications} />
      ) : (
        <div className="flex min-h-80 items-center justify-center rounded-[28px] bg-white px-6 text-center text-base text-[#8E8E8E]">
          Заявок за цими параметрами не знайдено.
        </div>
      )}
    </div>
  );
}

function getStatusParam(
  value: string | string[] | undefined
): AdoptionApplicationStatus | "" {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const normalizedValue = rawValue?.trim().toUpperCase() ?? "";

  return allowedStatuses.has(normalizedValue)
    ? (normalizedValue as AdoptionApplicationStatus)
    : "";
}
