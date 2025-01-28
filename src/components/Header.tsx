"use client"
import React, { use } from "react"
import { Button } from "./ui/button"
import { HamburgerMenuIcon } from "@radix-ui/react-icons"
import { UserButton } from "@clerk/nextjs"
import { NavigationContext } from "@/lib/NavigationProvider"

const Header = () => {
  const { setIsMobileNavOpen, isMobileNavOpen } = use(NavigationContext)
  return (
    <header className="sticky top-0 z-50 border-b border-[#1b1b1b] backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant={"ghost"}
            size={"icon"}
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="text-gray-500 hover:bg-gray-700/30 hover:text-gray-600 md:hidden"
          >
            <HamburgerMenuIcon className="h-4 w-4" />
          </Button>
          <div className="bg-gradient-to-r from-gray-400 to-gray-300 bg-clip-text font-medium tracking-wide text-transparent">
            Quill AI
          </div>
        </div>
        <div className="flex items-center">
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "h-8 w-8 ring-2 ring-gray-200/50 ring-offset-2 rounded-full transition-shadow hover:ring-gray-300/50",
              },
            }}
          />
        </div>
      </div>
    </header>
  )
}

export default Header
