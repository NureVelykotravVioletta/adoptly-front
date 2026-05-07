"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArticleCard } from "@/src/features/articles/ArticleCard";
import type { Article } from "@/src/features/articles/articles.api";
import CrossIcon from "@/src/assets/icons/CrossIcon.svg";
import DefaultArticleImage from "@/src/assets/images/DefaultArticleImage.png";

type ArticlesListProps = {
  articles: Article[];
};

export function ArticlesList({ articles }: ArticlesListProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const closeModal = useCallback(() => {
    setSelectedArticle(null);
  }, []);

  useEffect(() => {
    if (!selectedArticle) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal, selectedArticle]);

  return (
    <>
      <div className="grid gap-x-9 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onMore={() => setSelectedArticle(article)}
          />
        ))}
      </div>

      {selectedArticle && typeof document !== "undefined"
        ? createPortal(
            <ArticleModal article={selectedArticle} onClose={closeModal} />,
            document.body,
          )
        : null}
    </>
  );
}

function ArticleModal({
  article,
  onClose,
}: {
  article: Article;
  onClose: () => void;
}) {
  const imageSrc = article.imageUrl ?? DefaultArticleImage.src;

  return (
    <div
      className="fixed inset-0 z-[9999] flex min-h-screen w-screen items-center justify-center bg-black/30 px-5 py-8 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="relative flex max-h-[88vh] w-full max-w-[820px] flex-col overflow-hidden rounded-[28px] bg-white text-[#262626] shadow-[0_24px_80px_rgba(38,38,38,0.16)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="article-modal-title"
      >
        <button
          type="button"
          aria-label="Закрити"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[#262626] transition hover:bg-[#F4EEFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
        >
          <CrossIcon className="h-5.5 w-5.5" />
        </button>

        <div className="aspect-[2.2] shrink-0 bg-[#D9D9D9]">
          <img src={imageSrc} alt="" className="h-full w-full object-cover" />
        </div>

        <div className="min-h-0 overflow-y-auto px-6 py-6 sm:px-10 sm:py-8">
          <h2
            id="article-modal-title"
            className="pr-10 text-[24px] leading-8 font-bold text-[#262626]"
          >
            {article.title}
          </h2>

          <p className="mt-5 whitespace-pre-line text-[16px] leading-6 text-[#262626]">
            {article.text}
          </p>
        </div>
      </section>
    </div>
  );
}
