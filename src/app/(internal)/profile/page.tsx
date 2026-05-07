import { requireCurrentUser } from "@/src/features/auth/auth.session";
import { ProfilePetsPanel } from "@/src/components/profile/ProfilePetsPanel";
import { ProfileSidebar } from "@/src/components/profile/ProfileSidebar";

export default async function ProfilePage() {
  const user = await requireCurrentUser();

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#F7F7F7] px-6">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[480px_1fr]">
        <ProfileSidebar user={user} />

        <ProfilePetsPanel />
      </div>
    </section>
  );
}
