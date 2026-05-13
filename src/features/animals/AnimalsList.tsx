import { AnimalCard } from "@/src/features/animals/AnimalCard";
import type { Animal } from "@/src/features/animals/animals.api";

type AnimalsListProps = {
  animals: Animal[];
  likedAnimalIds?: string[];
};

export function AnimalsList({
  animals,
  likedAnimalIds = [],
}: AnimalsListProps) {
  const likedAnimalIdsSet = new Set(likedAnimalIds);

  return (
    <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-3">
      {animals.map((animal) => (
        <AnimalCard
          key={animal.id}
          animal={animal}
          isLiked={likedAnimalIdsSet.has(animal.id)}
        />
      ))}
    </div>
  );
}
