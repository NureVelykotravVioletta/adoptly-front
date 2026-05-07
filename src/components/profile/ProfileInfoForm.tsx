import type { AuthUser } from "@/src/features/auth/auth.api";

type ProfileInfoFormProps = {
  user: AuthUser;
};

export function ProfileInfoForm({ user }: ProfileInfoFormProps) {
  const values = {
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
  };

  return (
    <div className="mt-5 space-y-3.5">
      <ProfileField
        value={values.name}
        placeholder="Імʼя"
      />
      <ProfileField
        value={values.email}
        placeholder="name@gmail.com"
      />
      <ProfileField
        value={values.phone}
        placeholder="+380"
      />
    </div>
  );
}

type ProfileFieldProps = {
  value: string;
  placeholder: string;
};

function ProfileField({ value, placeholder }: ProfileFieldProps) {
  return (
    <div className="flex h-12 w-full items-center rounded-full border border-[rgba(38,38,38,0.15)] bg-white px-5 text-base text-[#262626]">
      {value ? value : <span className="text-[#9CA3AF]">{placeholder}</span>}
    </div>
  );
}
