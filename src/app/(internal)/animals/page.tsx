import { AnimalsFilters } from "@/src/features/animals/AnimalsFilters";
import { AnimalsList } from "@/src/features/animals/AnimalsList";
import { AnimalsPagination } from "@/src/features/animals/AnimalsPagination";
import { AdminAnimalsList } from "@/src/features/animals/admin/AdminAnimalsList";
import {
  getAnimals,
  getLikedAnimals,
  normalizeLikedAnimalsData,
} from "@/src/features/animals/animals.api";
import { isAdminUser } from "@/src/features/auth/auth.roles";
import { getAuthToken, getCurrentUser } from "@/src/features/auth/auth.session";

const ANIMALS_LIMIT = 6;

type AnimalsPageProps = {
  searchParams: Promise<{
    page?: string | string[];
    search?: string | string[];
    category?: string | string[];
    gender?: string | string[];
    city?: string | string[];
  }>;
};

export default async function AnimalsPage({ searchParams }: AnimalsPageProps) {
  const params = await searchParams;
  const page = getPageParam(params.page);
  const search = getStringParam(params.search);
  const category = getStringParam(params.category);
  const gender = getStringParam(params.gender);
  const city = getStringParam(params.city);
  const animalsPage = await getAnimals({
    page,
    limit: ANIMALS_LIMIT,
    search,
    category,
    gender,
    city,
  });
  const token = await getAuthToken();
  const currentUser = token ? await getCurrentUser() : null;
  const isAdmin = isAdminUser(currentUser);
  const userLikedAnimals = isAdmin
    ? []
    : await normalizeLikedAnimalsData(currentUser?.likedAnimals);
  const endpointLikedAnimals =
    token && !isAdmin
      ? await getLikedAnimals(token).catch(() =>
          normalizeLikedAnimalsData(currentUser?.likedAnimals)
        )
      : [];
  const likedAnimals =
    endpointLikedAnimals.length > 0 ? endpointLikedAnimals : userLikedAnimals;
  const likedAnimalIds = likedAnimals.map((animal) => animal.id);
  const isAuthenticated = Boolean(token && currentUser);

  return (
    <div className="pb-8">
      <div className="mb-10">
        <h1 className="mb-8 text-4xl leading-tight font-bold text-[#262626] sm:text-5xl">
          {isAdmin ? "Тварини" : "Знайдіть свого улюбленця"}
        </h1>
        <AnimalsFilters
          key={`${search}-${category}-${gender}-${city}`}
          search={search}
          category={category}
          gender={gender}
          city={city}
        />
      </div>

      {animalsPage.items.length > 0 ? (
        isAdmin ? (
          <AdminAnimalsList animals={animalsPage.items} />
        ) : (
          <AnimalsList
            animals={animalsPage.items}
            likedAnimalIds={likedAnimalIds}
            isAuthenticated={isAuthenticated}
          />
        )
      ) : (
        <div className="flex min-h-80 items-center justify-center text-center text-base text-[#8E8E8E]">
          Тварин за цими параметрами не знайдено.
        </div>
      )}

      <AnimalsPagination
        currentPage={animalsPage.page}
        totalPages={animalsPage.totalPages}
        search={search}
        category={category}
        gender={gender}
        city={city}
      />
    </div>
  );
}

function getPageParam(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const page = Number(rawValue);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

function getStringParam(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  return rawValue?.trim() ?? "";
}
