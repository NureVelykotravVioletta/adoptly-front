import { ArticlesList } from "@/src/features/articles/ArticlesList";
import { ArticlesPagination } from "@/src/features/articles/ArticlesPagination";
import { ArticlesSearch } from "@/src/features/articles/ArticlesSearch";
import { AdminArticlesList } from "@/src/features/articles/admin/AdminArticlesList";
import { AdminCreateArticleDialog } from "@/src/features/articles/admin/AdminCreateArticleDialog";
import { getArticles } from "@/src/features/articles/articles.api";
import { isAdminUser } from "@/src/features/auth/auth.roles";
import { getCurrentUser } from "@/src/features/auth/auth.session";

const ARTICLES_LIMIT = 6;

type ArticlesPageProps = {
  searchParams: Promise<{
    page?: string | string[];
    search?: string | string[];
  }>;
};

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = await searchParams;
  const page = getPageParam(params.page);
  const search = getStringParam(params.search);
  const currentUser = await getCurrentUser();
  const isAdmin = isAdminUser(currentUser);
  const articlesPage = await getArticles({
    page,
    limit: ARTICLES_LIMIT,
    search,
  });

  return (
    <div className="pb-8">
      <div className="mb-14 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl leading-tight font-bold text-[#262626] sm:text-5xl">
            Поради
          </h1>
          {isAdmin ? <AdminCreateArticleDialog /> : null}
        </div>
        <ArticlesSearch key={search} initialSearch={search} />
      </div>

      {articlesPage.items.length > 0 ? (
        isAdmin ? (
          <AdminArticlesList articles={articlesPage.items} />
        ) : (
          <ArticlesList articles={articlesPage.items} />
        )
      ) : (
        <div className="flex min-h-80 items-center justify-center text-center text-base text-[#8E8E8E]">
          Статей поки немає.
        </div>
      )}

      <ArticlesPagination
        currentPage={articlesPage.page}
        totalPages={articlesPage.totalPages}
        search={search}
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
