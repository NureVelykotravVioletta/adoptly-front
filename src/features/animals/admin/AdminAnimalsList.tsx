"use client";

import { useState } from "react";
import { AdminAnimalCard } from "@/src/features/animals/admin/AdminAnimalCard";
import { DeleteAnimalConfirmDialog } from "@/src/features/animals/admin/DeleteAnimalConfirmDialog";
import type { Animal } from "@/src/features/animals/animals.api";

type AdminAnimalsListProps = {
  animals: Animal[];
};

export function AdminAnimalsList({ animals }: AdminAnimalsListProps) {
  const [deletedAnimalIds, setDeletedAnimalIds] = useState<Set<string>>(
    () => new Set()
  );
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);
  const visibleAnimals = animals.filter(
    (animal) => !deletedAnimalIds.has(animal.id)
  );

  return (
    <>
      <div className="flex flex-col gap-5">
        {visibleAnimals.map((animal) => (
          <AdminAnimalCard
            key={animal.id}
            animal={animal}
            onDelete={() => setAnimalToDelete(animal)}
          />
        ))}
      </div>

      <DeleteAnimalConfirmDialog
        animal={animalToDelete}
        onClose={() => setAnimalToDelete(null)}
        onDeleted={(animalId) => {
          setDeletedAnimalIds(
            (currentAnimalIds) => new Set([...currentAnimalIds, animalId])
          );
          setAnimalToDelete(null);
        }}
      />
    </>
  );
}
