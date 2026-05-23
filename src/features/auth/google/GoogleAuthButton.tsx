"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { googleAuthAction } from "@/src/features/auth/google/google.action";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

function GoogleLoginSection() {
  const router = useRouter();
  const [error, setError] = useState("");

  return (
    <>
      <div className="flex justify-center [&>div]:w-full">
        <GoogleLogin
          onSuccess={async (response) => {
            if (!response.credential) {
              setError("Не вдалося отримати токен від Google.");
              return;
            }

            const result = await googleAuthAction(response.credential);

            if (result.error) {
              setError(result.error);
              return;
            }

            router.push("/profile");
            router.refresh();
          }}
          onError={() => {
            setError("Не вдалося увійти через Google.");
          }}
          theme="outline"
          shape="pill"
          size="large"
          text="continue_with"
        />
      </div>

      {error ? (
        <p className="mt-2 text-center text-sm text-rose-600">{error}</p>
      ) : null}
    </>
  );
}

export function GoogleAuthButton() {
  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID} locale="uk">
      <div className="my-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-[rgba(38,38,38,0.1)]" />
        <span className="text-sm text-[rgba(38,38,38,0.5)]">або</span>
        <span className="h-px flex-1 bg-[rgba(38,38,38,0.1)]" />
      </div>

      <GoogleLoginSection />
    </GoogleOAuthProvider>
  );
}
