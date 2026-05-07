import type { Article } from "@/src/features/articles/articles.api";
import DefaultArticleImage from "@/src/assets/images/DefaultArticleImage.png";

type ArticleCardProps = {
  article: Article;
  onMore?: () => void;
};

export function ArticleCard({ article, onMore }: ArticleCardProps) {
  const imageSrc = article.imageUrl ?? DefaultArticleImage.src;

  return (
    <article className="flex min-w-0 flex-col">
      <div className="mb-5 aspect-[1.58] overflow-hidden rounded-[8px] bg-[#D9D9D9]">
        <img
          src={imageSrc}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <h2 className="mb-3 text-[20px] leading-6 font-bold text-[#262626]">
        {article.title}
      </h2>

      <p className="mb-4 overflow-hidden text-[16px] leading-5 text-[#262626] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]">
        {article.text}
      </p>

      <div className="mt-auto flex items-center justify-between gap-4 text-[16px] leading-5">
        <time className="text-[#8E8E8E]" dateTime={article.createdAt}>
          {formatArticleDate(article.createdAt)}
        </time>
        <button
          type="button"
          onClick={onMore}
          className="shrink-0 cursor-pointer text-[#8456F0] underline transition hover:text-[#7045D1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
        >
          Більше
        </button>
      </div>
    </article>
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
