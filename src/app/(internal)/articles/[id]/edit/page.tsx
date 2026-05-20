import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/src/components/common/Breadcrumbs";
import { AdminArticleEditView } from "@/src/features/articles/admin/edit/AdminArticleEditView";
import { getArticle } from "@/src/features/articles/articles.api";
import { isAdminUser } from "@/src/features/auth/auth.roles";
import { getCurrentUser } from "@/src/features/auth/auth.session";

type ArticleEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ArticleEditPage({
  params,
}: ArticleEditPageProps) {
  const currentUser = await getCurrentUser();

  if (!isAdminUser(currentUser)) {
    notFound();
  }

  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  return (
    <div className="pb-8">
      <Breadcrumbs
        items={[{ label: "Поради", href: "/articles" }, { label: article.title }]}
      />

      <AdminArticleEditView article={article} />
    </div>
  );
}
