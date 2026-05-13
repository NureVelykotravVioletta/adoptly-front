import { PawLoader } from "@/src/components/common/PawLoader";

type LoadingOverlayProps = {
  label?: string;
};

export function LoadingOverlay({
  label = "Завантаження",
}: LoadingOverlayProps) {
  return (
    <div className="pointer-events-auto fixed inset-0 z-[10000] flex cursor-wait items-center justify-center bg-white/55 backdrop-blur-[2px]">
      <PawLoader size="lg" label={label} />
    </div>
  );
}
