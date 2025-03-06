import React from "react"

export default function Loading() {
  const numMessages = Math.floor(Math.random() * 5) + 2
  return (
    <div className="flex-1 bg-zinc-500/10">
      {/* Message section */}
      <div className="flex h-[calc(100vh-65px)] flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto max-w-4xl space-y-8">
            {[...Array(numMessages)].map((_, i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`w-2/3 rounded-2xl p-4 ${i % 2 === 0 ? "rounded-br-none bg-zinc-600/10" : "rounded-bl-none border border-zinc-400/20 bg-zinc-400/40"}`}
                >
                  <div className="space-y-3">
                    <div
                      className={`h-4 w-[90%] animate-pulse rounded ${i % 2 === 0 ? "bg-zinc-500/40" : "bg-zinc-400/40"}`}
                    />
                    <div
                      className={`h-4 w-[75%] animate-pulse rounded ${i % 2 === 0 ? "bg-zinc-500/40" : "bg-zinc-400/40"}`}
                    />
                    <div
                      className={`h-4 w-[60%] animate-pulse rounded ${i % 2 === 0 ? "bg-zinc-500/40" : "bg-zinc-400/40"}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Input section */}
        <div className="border-t bg-zinc-500/10 p-4">
          <div className="mx-auto max-w-4xl">
            <div className="h-12 animate-pulse rounded-full bg-gray-600" />
          </div>
        </div>
      </div>
    </div>
  )
}
