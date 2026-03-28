"use client";

import { useSession } from "next-auth/react";
import { buttonVariants } from "@/components/ui/button";
import { UserDropdown } from "@/components/ui/user-dropdown";

interface AuthButtonsProps {
  loginUrl: string;
  loginText: string;
  signupUrl: string;
  signupText: string;
}

export function AuthButtons({ loginUrl, loginText, signupUrl, signupText }: AuthButtonsProps) {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <UserDropdown
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          username: (session.user as { username?: string }).username,
          role: (session.user as { role?: string }).role,
        }}
      />
    );
  }

  return (
    <>
      <a href={loginUrl} className={buttonVariants({ variant: "outline", size: "sm" })}>
        {loginText}
      </a>
      <a href={signupUrl} className={buttonVariants({ size: "sm", className: "bg-primary hover:bg-primary/90" })}>
        {signupText}
      </a>
    </>
  );
}
