import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Хлібні крихти"
      className="mb-6 flex flex-wrap items-center gap-1 text-sm leading-5 text-[#262626]"
    >
      {items.map((item, index) => {
        const isLastItem = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="contents">
            {item.href && !isLastItem ? (
              <Link
                href={item.href}
                className="transition hover:text-[#8456F0]"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLastItem ? "text-[#8456F0]" : undefined}>
                {item.label}
              </span>
            )}
            {!isLastItem ? <span aria-hidden="true">›</span> : null}
          </span>
        );
      })}
    </nav>
  );
}
