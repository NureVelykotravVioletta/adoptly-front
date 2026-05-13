import { NotFoundContent } from "@/src/components/common/NotFoundContent";
import { HeaderServer } from "@/src/components/layout/HeaderServer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F9F9F9]">
      <HeaderServer />
      <main className="flex-1 py-10">
        <NotFoundContent />
      </main>
    </div>
  );
}
