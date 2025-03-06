"use client"
import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
import NavigationProvider from "@/lib/NavigationProvider"
import { Authenticated } from "convex/react"
import { PropsWithChildren } from "react"

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <NavigationProvider>
      <div className="flex h-screen">
        <Authenticated>
          <Sidebar />
        </Authenticated>
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </NavigationProvider>
  )
}
