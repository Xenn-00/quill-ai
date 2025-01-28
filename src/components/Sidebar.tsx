"use client"
import { NavigationContext } from "@/lib/NavigationProvider"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import React, { use } from "react"
import { Button } from "./ui/button"
import { PlusIcon } from "lucide-react"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"
import ChatRow from "./ChatRow"

const Sidebar = () => {
  const router = useRouter()
  const { closeMobileNav, isMobileNavOpen } = use(NavigationContext)

  const createChat = useMutation(api.chats.createChat)
  const deleteChat = useMutation(api.chats.deleteChat)
  const listChat = useQuery(api.chats.listChat)

  const handleDeleteChat = async (id: Id<"chats">) => {
    await deleteChat({ id })
    if (window.location.pathname.includes(id)) {
      router.push("/dashboard")
    }
  }

  const handleNewChat = async () => {
    // route to chat ID
    const chatId = await createChat({ title: "New Chat" })
    router.push(`/dashboard/chat/${chatId}`)
    closeMobileNav()
  }

  return (
    <>
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 md:hidden"
          onClick={closeMobileNav}
        />
      )}
      <div
        className={cn(
          "fixed bottom-0 left-0 top-14 z-50 flex w-72 transform flex-col border-r border-[#1b1b1b]/20 bg-gray-700/30 backdrop-blur-xl transition-transform duration-300 ease-in-out md:relative md:inset-y-0 md:top-0 md:translate-x-0",
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="border-b border-[#1b1b1b]/20 p-4">
          <Button
            onClick={handleNewChat}
            className="w-full border-[#1b1b1b] bg-black/30 text-gray-400 shadow-sm transition-all duration-200 hover:bg-black/10 hover:shadow"
          >
            <PlusIcon /> New Chat
          </Button>
        </div>
        <div className="flex-1 space-y-2.5 overflow-y-auto p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-black/20">
          {listChat?.map((chat) => (
            <ChatRow key={chat._id} chat={chat} onDelete={handleDeleteChat} />
          ))}
        </div>
      </div>
    </>
  )
}

export default Sidebar
