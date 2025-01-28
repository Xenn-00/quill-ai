import { BotIcon } from "lucide-react"
import React from "react"

function DashboardPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="relative w-full max-w-2xl">
        {/* Decorative element */}
        {/* <div className="absolute inset-0 z-10 rounded-3xl bg-gradient-to-r from-black/80 to-[#1b1b1b]" />
        <div className="absolute inset-0 z-10 rounded-3xl bg-[linear-gradient(to_right,#151515_1px,transparent_1px),linear-gradient(to_bottom,#151515_1px,transparent_1px)] bg-[size:4rem_4rem]" /> */}
        <div className="relative space-y-6 p-8 text-center">
          <div className="space-y-4 rounded-2xl p-5 shadow-sm ring-1 ring-[#1b1b1b] backdrop-blur-sm">
            <div className="inline-flex rounded-xl bg-gradient-to-b from-[#3b3b3b]/60 to-[#4b4b4b/90]">
              <BotIcon className="h-7 w-7 text-[#5a5a5a]" />
            </div>
            <h2 className="text-pretty bg-gradient-to-br from-gray-400 to-gray-300 bg-clip-text text-2xl font-semibold text-transparent">
              Welcome to Quill AI
            </h2>
            <p className="mx-auto max-w-md text-gray-600">
              Start a new conversation or select an existing chat from the
              sidebar. Your AI assistant is ready to help with any task.
            </p>
            <div className="flex justify-center gap-4 pt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                Real-time responses
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Smart assistance
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                Powerful tools
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
