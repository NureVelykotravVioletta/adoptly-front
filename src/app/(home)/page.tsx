import { Hero } from "@/src/components/home/Hero";
import { HeroImage } from "@/src/components/home/HeroImage";

export default function HomePage() {
  return (
    <div className="grid h-full min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
      <Hero />
      <HeroImage />
    </div>
  );
}
