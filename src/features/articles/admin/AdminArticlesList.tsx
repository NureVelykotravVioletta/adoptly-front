"use client";

import { useState } from "react";
import { AdminArticleCard } from "@/src/features/articles/admin/AdminArticleCard";
import { DeleteArticleConfirmDialog } from "@/src/features/articles/admin/DeleteArticleConfirmDialog";
import type { Article } from "@/src/features/articles/articles.api";

type AdminArticlesListProps = {
  articles: Article[];
};

export function AdminArticlesList({ articles }: AdminArticlesListProps) {
  const [deletedArticleIds, setDeletedArticleIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const visibleArticles = articles.filter(
    (article) => !deletedArticleIds.has(article.id),
  );

  return (
    <>
      <div className="flex flex-col gap-5">
        {visibleArticles.map((article) => (
          <AdminArticleCard
            key={article.id}
            article={article}
            onDelete={() => setArticleToDelete(article)}
          />
        ))}
      </div>

      <DeleteArticleConfirmDialog
        article={articleToDelete}
        onClose={() => setArticleToDelete(null)}
        onDeleted={(articleId) => {
          setDeletedArticleIds(
            (currentArticleIds) => new Set([...currentArticleIds, articleId]),
          );
          setArticleToDelete(null);
        }}
      />
    </>
  );
}
