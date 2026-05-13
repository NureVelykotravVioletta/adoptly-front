import { ImageGallery } from "@/src/components/common/ImageGallery";

type AnimalGalleryProps = {
  images: string[];
  animalName: string;
};

export function AnimalGallery({ images, animalName }: AnimalGalleryProps) {
  return <ImageGallery images={images} imageAlt={animalName} />;
}
