import { Header } from "@/src/components/layout/Header";
import { getCurrentUser } from "@/src/features/auth/auth.session";

type HeaderServerProps = {
  variant?: "home" | "default";
};

export async function HeaderServer({ variant = "default" }: HeaderServerProps) {
  const user = await getCurrentUser();

  return <Header variant={variant} user={user} />;
}
