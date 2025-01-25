"use client";
import Header from "@/components/Header";
import { Authenticated } from "convex/react";
import { PropsWithChildren } from "react";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-screen">
      <Authenticated>
        <h1>Sidebar</h1>
      </Authenticated>
      <div className="flex-1">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}
