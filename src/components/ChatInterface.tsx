"use client"
import { useEffect, useRef, useState } from "react"
import { Doc, Id } from "../../convex/_generated/dataModel"
import { Button } from "./ui/button"
import { ArrowRight } from "lucide-react"
import { ChatRequestBody, StreamMessageType } from "@/lib/types"
import { toast } from "sonner"
import { createSSEParser } from "@/lib/SSEParser"
import { getConvexClient } from "@/lib/convex"
import { api } from "../../convex/_generated/api"

type ChatInterfaceProps = {
  chatId: Id<"chats">
  initialMessages: Doc<"messages">[]
}

const ChatInterface = ({ chatId, initialMessages }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Doc<"messages">[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [streamedResponse, setStreamedResponse] = useState("")
  const [currentTool, setCurrentTool] = useState<{
    name: string
    input: string
  } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamedResponse])

  const formatToolOutput = (output: unknown): string => {
    if (typeof output === "string") return output
    return JSON.stringify(output, null, 2)
  }

  const formatTerminalOutput = (
    tool: string,
    input: unknown,
    output: unknown
  ) => {
    const terminalHtml = `<div class="bg-[#1e1e1e] text-white font-mono p-2 rounded-md my-2 overflow-x-auto whitespace-normal max-w-[600px]">
      <div class="flex items-center gap-1.5 border-b border-gray-700 pb-1">
        <span class="text-red-500">●</span>
        <span class="text-yellow-500">●</span>
        <span class="text-green-500">●</span>
        <span class="text-gray-400 ml-1 text-sm">~/${tool}</span>
      </div>
      <div class="text-gray-400 mt-1">$ Input</div>
      <pre class="text-yellow-400 mt-0.5 whitespace-pre-wrap overflow-x-auto">${formatToolOutput(input)}</pre>
      <div class="text-gray-400 mt-2">$ Output</div>
      <pre class="text-green-400 mt-0.5 whitespace-pre-wrap overflow-x-auto">${formatToolOutput(output)}</pre>
    </div>`

    return `---START---\n${terminalHtml}\n---END---`
  }

  const processStream = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onChunk: (chunk: string) => Promise<void>
  ) => {
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        await onChunk(new TextDecoder().decode(value))
      }
    } finally {
      reader.releaseLock()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimInput = input.trim()
    if (!trimInput || isLoading) return

    setInput("")
    setStreamedResponse("")
    setCurrentTool(null)
    setIsLoading(true)

    // Add user's message immediately
    const optimisticMessage: Doc<"messages"> = {
      _id: `temp_${Date.now()}`,
      chatId,
      content: trimInput,
      role: "user",
      createdAt: Date.now(),
    } as Doc<"messages">

    setMessages((prevMessages) => [...prevMessages, optimisticMessage])

    // Track complete response for saving to database
    let fullResponse = ""

    try {
      // Prepare chat history and new message for API
      const requestBody: ChatRequestBody = {
        messages: messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        newMessage: trimInput,
        chatId,
      }

      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) throw new Error(await response.text())
      if (!response.body) throw new Error("Response body is empty")

      const parser = createSSEParser()
      const reader = response.body.getReader()

      await processStream(reader, async (chunk) => {
        const messages = parser.parse(chunk)

        for (const message of messages) {
          switch (message.type) {
            case StreamMessageType.Token:
              // Handle streaming tokens (normal text response)
              if ("token" in message) {
                fullResponse += message.token
                setStreamedResponse(fullResponse)
              }
              break

            case StreamMessageType.ToolStart:
              // Handle start of tool execution (e.g. API calls, file operations)
              if ("tool" in message) {
                setCurrentTool({
                  name: message.tool,
                  input: message.input as string,
                })
                fullResponse += formatTerminalOutput(
                  message.tool,
                  message.input,
                  "Processing..."
                )
                setStreamedResponse(fullResponse)
              }
              break

            case StreamMessageType.ToolEnd:
              // Handle completion of tool execution
              if ("tool" in message && currentTool) {
                // Replace the "Processing..." message with actual output
                const lastTerminalIndex = fullResponse.lastIndexOf(
                  '<div class="bg-[#1e1e1e]'
                )
                if (lastTerminalIndex !== -1) {
                  fullResponse =
                    fullResponse.substring(0, lastTerminalIndex) +
                    formatTerminalOutput(
                      message.tool,
                      currentTool.input,
                      message.output
                    )
                  setStreamedResponse(fullResponse)
                }
                setCurrentTool(null)
              }
              break

            case StreamMessageType.Error:
              // Handle error messages from the stream
              if ("error" in message) {
                throw new Error(message.error)
              }
              break
            case StreamMessageType.Done:
              // Handle completion of the entire response
              const assistantMessage: Doc<"messages"> = {
                _id: `temp_assistant_${Date.now()}`,
                chatId,
                content: fullResponse,
                role: "assistant",
                createdAt: Date.now(),
              } as Doc<"messages">

              // Save the complete message to the database
              const convex = getConvexClient()
              await convex.mutation(api.messages.storeMessage, {
                chatId,
                content: fullResponse,
                role: "assistant",
              })

              setMessages((prev) => [...prev, assistantMessage])
              setStreamedResponse("")
              return

            default:
              break
          }
        }
      })
    } catch (error) {
      toast("🔥 Error sending message")
      console.error(error)

      setMessages((prevMessages) =>
        prevMessages.filter((message) => message._id !== optimisticMessage._id)
      )

      setStreamedResponse(
        formatTerminalOutput(
          "error",
          "Failed to process message",
          error instanceof Error ? error.message : "Unknown error"
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex h-[calc(100vh-theme(spacing.14))] flex-col">
      {/* Messages */}
      <section className="flex-1 overflow-y-auto"></section>
      {/* Footer Input Section */}
      <footer className="border-t p-4">
        <form className="relative mx-auto max-w-4xl" onSubmit={handleSubmit}>
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-2xl bg-gray-700/30 px-4 py-3 pr-12 text-sm text-gray-400 placeholder:text-gray-600 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-zinc-600"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`absolute right-1.5 flex h-9 w-9 items-center justify-center rounded-xl p-0 transition-all ${input.trim() ? "bg-slate-600 text-gray-100 shadow-sm hover:bg-slate-700" : "bg-gray-600 text-gray-400"}`}
            >
              <ArrowRight />
            </Button>
          </div>
        </form>
      </footer>
    </main>
  )
}

export default ChatInterface
