"use client"
import { useRouter } from "next/navigation"
import { Doc, Id } from "../../convex/_generated/dataModel"
import { use } from "react"
import { NavigationContext } from "@/lib/NavigationProvider"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Button } from "./ui/button"
import { TrashIcon } from "lucide-react"
import TimeAgo from "react-timeago"

const ChatRow = ({
  chat,
  onDelete,
}: {
  chat: Doc<"chats">
  onDelete: (id: Id<"chats">) => void
}) => {
  const router = useRouter()
  const { closeMobileNav } = use(NavigationContext)
  const lastMessage = useQuery(api.messages.getLastMessage, {
    chatId: chat._id,
  })
  const handleClick = () => {
    router.push(`/dashboard/chat/${chat._id}`)
    closeMobileNav()
  }
  return (
    <div
      className="group cursor-pointer rounded-xl border border-[#1b1b1b]/20 bg-black/50 text-gray-400 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-black/10 hover:shadow-md"
      onClick={handleClick}
    >
      <div className="translate-y-1 p-2">
        <div className="flex items-start justify-between">
          <p className="flex-1 truncate text-sm font-medium text-gray-500">
            {lastMessage ? (
              <>
                {lastMessage.role === "user" ? "You" : "Assistant"}
                {lastMessage.content.replace(/\\n/g, "\n")}
              </>
            ) : (
              <span className="text-gray-400">New Chat</span>
            )}
          </p>
          <Button
            variant={"ghost"}
            size={"icon"}
            className="-mr-2 -mt-2 ml-2 opacity-50 transition-opacity duration-200 group-hover:opacity-100 lg:opacity-0"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(chat._id)
            }}
          >
            <TrashIcon className="h-4 w-4 text-gray-400 transition-colors hover:text-red-500" />
          </Button>
        </div>
        {lastMessage && (
          <p className="mt-1.5 text-xs font-medium text-gray-400">
            <TimeAgo date={lastMessage.createdAt} />
          </p>
        )}
      </div>
    </div>
  )
}

export default ChatRow
