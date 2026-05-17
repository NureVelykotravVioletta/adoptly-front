import { LogoutConfirmDialog } from "@/src/components/auth/LogoutConfirmDialog";
import type { AuthUser } from "@/src/features/auth/auth.api";
import type { Animal } from "@/src/features/animals/animals.api";
import { ProfileAdoptedPetsSection } from "@/src/components/profile/ProfileAdoptedPetsSection";
import { ProfileAvatarUpload } from "@/src/components/profile/ProfileAvatarUpload";
import { ProfileEditDialog } from "@/src/components/profile/ProfileEditDialog";
import { ProfileInfoForm } from "@/src/components/profile/ProfileInfoForm";
import UserIcon from "@/src/assets/icons/UserIcon.svg";

type ProfileSidebarProps = {
  user: AuthUser;
  adoptedAnimals?: Animal[];
  showAdoptedAnimals?: boolean;
};

export function ProfileSidebar({
  user,
  adoptedAnimals = [],
  showAdoptedAnimals = true,
}: ProfileSidebarProps) {
  return (
    <aside className="w-full max-w-130 min-w-0 rounded-[48px] bg-white px-9 pt-10 pb-9 text-[#262626] shadow-[0_20px_80px_rgba(38,38,38,0.04)]">
      <div className="flex items-start justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8456F0] px-4 py-2 text-sm font-medium text-white">
          {user.role}
          <UserIcon className="block h-4 w-4 text-white" aria-hidden />
        </span>

        <ProfileEditDialog user={user} />
      </div>

      <ProfileAvatarUpload avatarUrl={user.avatarUrl} />

      <div className="mt-7">
        <h1 className="text-xl font-bold">Особиста інформація</h1>

        <ProfileInfoForm user={user} />
      </div>

      {showAdoptedAnimals ? (
        <ProfileAdoptedPetsSection animals={adoptedAnimals} />
      ) : null}

      <LogoutConfirmDialog
        triggerWrapperClassName="mt-20"
        triggerClassName="cursor-pointer rounded-full bg-[#DACAFF] px-8 py-3 text-sm font-semibold uppercase text-[#8456F0] transition hover:bg-[#c7adff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8456F0]"
      />
    </aside>
  );
}
