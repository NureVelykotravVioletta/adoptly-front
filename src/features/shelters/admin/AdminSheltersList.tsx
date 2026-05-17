"use client";

import { useState } from "react";
import { AdminShelterCard } from "@/src/features/shelters/admin/AdminShelterCard";
import { DeleteShelterConfirmDialog } from "@/src/features/shelters/admin/DeleteShelterConfirmDialog";
import type { Shelter } from "@/src/features/shelters/shelters.api";

type AdminSheltersListProps = {
  shelters: Shelter[];
};

export function AdminSheltersList({ shelters }: AdminSheltersListProps) {
  const [deletedShelterIds, setDeletedShelterIds] = useState<Set<string>>(
    () => new Set()
  );
  const [shelterToDelete, setShelterToDelete] = useState<Shelter | null>(null);
  const visibleShelters = shelters.filter(
    (shelter) => !deletedShelterIds.has(shelter.id)
  );

  return (
    <>
      <div className="flex flex-col gap-5">
        {visibleShelters.map((shelter) => (
          <AdminShelterCard
            key={shelter.id}
            shelter={shelter}
            onDelete={() => setShelterToDelete(shelter)}
          />
        ))}
      </div>

      <DeleteShelterConfirmDialog
        shelter={shelterToDelete}
        onClose={() => setShelterToDelete(null)}
        onDeleted={(shelterId) => {
          setDeletedShelterIds(
            (currentShelterIds) =>
              new Set([...currentShelterIds, shelterId])
          );
          setShelterToDelete(null);
        }}
      />
    </>
  );
}
