import { HeaderServer } from "@/src/components/layout/HeaderServer";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F9F9F9]">
      <HeaderServer variant="home" />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
