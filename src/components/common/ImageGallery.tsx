"use client";

import { useState } from "react";
import clsx from "clsx";
import ArrowIcon from "@/src/assets/icons/ArrowIcon.svg";

type ImageGalleryProps = {
  images: string[];
  imageAlt: string;
  mainAspectClassName?: string;
  controls?: "both" | "next";
};

export function ImageGallery({
  images,
  imageAlt,
  mainAspectClassName = "aspect-[1.15]",
  controls = "both",
}: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultipleImages = images.length > 1;
  const activeImage = images[activeIndex];

  function showPreviousImage() {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? images.length - 1 : currentIndex - 1
    );
  }

  function showNextImage() {
    setActiveIndex((currentIndex) =>
      currentIndex === images.length - 1 ? 0 : currentIndex + 1
    );
  }

  return (
    <div className="mx-auto w-full min-w-0">
      <div
        className={clsx(
          mainAspectClassName,
          "overflow-hidden rounded-[44px] bg-[#D9D9D9] sm:rounded-[54px]"
        )}
      >
        {activeImage ? (
          <img
            src={activeImage}
            alt={imageAlt}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      {hasMultipleImages ? (
        <div className="mt-5 grid grid-cols-[1fr_auto] items-center gap-4">
          <div className="flex min-w-0 gap-4 overflow-x-auto pb-1">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                aria-label={`Показати фото ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={clsx(
                  "h-[88px] w-[88px] shrink-0 cursor-pointer overflow-hidden rounded-[18px] border-2 bg-[#D9D9D9] transition sm:h-[106px] sm:w-[106px]",
                  activeIndex === index
                    ? "border-[#8456F0]"
                    : "border-transparent hover:border-[#D8C3FB]"
                )}
              >
                <img
                  src={image}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {controls === "both" ? (
              <GalleryArrowButton
                label="Попереднє фото"
                onClick={showPreviousImage}
                direction="previous"
              />
            ) : null}
            <GalleryArrowButton label="Наступне фото" onClick={showNextImage} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GalleryArrowButton({
  label,
  onClick,
  direction = "next",
}: {
  label: string;
  onClick: () => void;
  direction?: "previous" | "next";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#D8C3FB] text-[#8456F0] transition hover:bg-[#C7A9FA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
    >
      <ArrowIcon
        className={clsx(
          "h-5 w-5 [&_path]:fill-current",
          direction === "previous" && "rotate-180"
        )}
        aria-hidden="true"
      />
    </button>
  );
}
