"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Temporarily disable SessionProvider to test signup page
  return <>{children}</>
  
  // return (
  //   <NextAuthSessionProvider 
  //     basePath="/api/auth"
  //     refetchInterval={0}
  //     refetchOnWindowFocus={false}
  //   >
  //     {children}
  //   </NextAuthSessionProvider>
  // )
}
