import { AdminListItemCard } from "@/src/components/common/AdminListItemCard";
import type { Article } from "@/src/features/articles/articles.api";

type AdminArticleCardProps = {
  article: Article;
  onDelete: () => void;
};

export function AdminArticleCard({
  article,
  onDelete,
}: AdminArticleCardProps) {
  return (
    <AdminListItemCard
      imageUrl={article.imageUrl}
      title={article.title}
      subtitle={formatArticleDate(article.createdAt)}
      description={article.text || "Текст статті поки не додано."}
      meta={[
        { label: "Дата", value: formatArticleDate(article.createdAt) || "-" },
      ]}
      editHref={`/articles/${encodeURIComponent(article.id)}/edit`}
      editAriaLabel={`Редагувати ${article.title}`}
      deleteAriaLabel={`Видалити ${article.title}`}
      onDelete={onDelete}
    />
  );
}

function formatArticleDate(value: string) {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
