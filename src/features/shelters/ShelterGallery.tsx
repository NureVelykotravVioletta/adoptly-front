import { ImageGallery } from "@/src/components/common/ImageGallery";

type ShelterGalleryProps = {
  images: string[];
  shelterName: string;
};

export function ShelterGallery({ images, shelterName }: ShelterGalleryProps) {
  return (
    <ImageGallery
      images={images}
      imageAlt={shelterName}
      mainAspectClassName="aspect-[1.05]"
      controls="next"
    />
  );
}
