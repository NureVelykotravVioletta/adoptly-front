import { Header } from "@/src/components/layout/Header";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header variant="home" />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
