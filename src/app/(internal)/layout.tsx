import { HeaderServer } from "@/src/components/layout/HeaderServer";

export default function InternalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F9F9F9]">
      <HeaderServer />
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
