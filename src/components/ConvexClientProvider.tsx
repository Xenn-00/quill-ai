"use client"

import { ClerkProvider, useAuth } from "@clerk/nextjs"
import { ConvexReactClient } from "convex/react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { dark } from "@clerk/themes"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export default function ConvexClientProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
