import React from "react"
import { Id } from "../../../../../convex/_generated/dataModel"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getConvexClient } from "@/lib/convex"
import { api } from "../../../../../convex/_generated/api"
import ChatInterface from "@/components/ChatInterface"

type ChatPageProps = {
  params: Promise<{ chatId: Id<"chats"> }>
}

async function ChatPage({ params }: ChatPageProps) {
  const { chatId } = await params

  // get user authentication
  const { userId } = await auth()
  if (!userId) {
    redirect("/")
  }
  try {
    const convex = getConvexClient()

    const chat = await convex.query(api.chats.getChat, {
      chatId,
      userId,
    })
    if (!chat) {
      redirect("/dashboard")
    }
    // get messages
    const initialMessages = await convex.query(api.messages.listMessages, {
      chatId,
    })

    return (
      <div className="flex-1 overflow-hidden">
        <ChatInterface chatId={chatId} initialMessages={initialMessages} />
      </div>
    )
  } catch (error) {
    console.error("🔥 Error when query message", error)
    redirect("/dashboard")
  }
}

export default ChatPage
