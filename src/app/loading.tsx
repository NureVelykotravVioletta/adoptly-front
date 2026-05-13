import { PawLoader } from "@/src/components/common/PawLoader";

export default function Loading() {
  return (
    <div className="pointer-events-auto fixed inset-0 z-[10000] flex cursor-wait items-center justify-center bg-white/55 backdrop-blur-[2px]">
      <PawLoader size="lg" label="Завантаження сторінки" />
    </div>
  );
}
