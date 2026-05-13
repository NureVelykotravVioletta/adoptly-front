import { ShelterCard } from "@/src/features/shelters/ShelterCard";
import type { Shelter } from "@/src/features/shelters/shelters.api";

type SheltersListProps = {
  shelters: Shelter[];
};

export function SheltersList({ shelters }: SheltersListProps) {
  return (
    <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-3">
      {shelters.map((shelter) => (
        <ShelterCard key={shelter.id} shelter={shelter} />
      ))}
    </div>
  );
}
