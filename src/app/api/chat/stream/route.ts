import { getConvexClient } from "@/lib/convex"
import {
  ChatRequestBody,
  SSE_DATA_PREFIX,
  SSE_LINE_DELIMITER,
  StreamMessage,
  StreamMessageType,
} from "@/lib/types"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { api } from "../../../../../convex/_generated/api"
import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages"
import { submitQuestion } from "@/lib/langgraph"

function sendSSEMessage(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  data: StreamMessage
) {
  const encoder = new TextEncoder()
  return writer.write(
    encoder.encode(
      `${SSE_DATA_PREFIX}${JSON.stringify(data)}${SSE_LINE_DELIMITER}`
    )
  )
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    const body = (await req.json()) as ChatRequestBody
    const { messages, newMessage, chatId } = body

    const convex = getConvexClient()

    // Create stream with larger queue strategy for better performance
    const stream = new TransformStream({}, { highWaterMark: 1024 })
    const writer = stream.writable.getWriter()

    const response = new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Disable buffering for Nginx which is required for Server-Side Events to work properly
      },
    })

    const startStream = async () => {
      try {
        await sendSSEMessage(writer, { type: StreamMessageType.Connected })

        await convex.mutation(api.messages.sentMessage, {
          chatId,
          content: newMessage,
        })

        const langChainMessages = [
          ...messages.map((message) =>
            message.role === "user"
              ? new HumanMessage(message.content)
              : new AIMessage(message.content)
          ),
          new HumanMessage(newMessage),
        ]
        try {
          const eventStream = await submitQuestion(langChainMessages, chatId)
          for await (const event of eventStream) {
            if (event.event === "on_chat_model_stream") {
              const token = event.data.chunk
              if (token) {
                const text = token.content.at(0)?.["text"]
                if (text) {
                  await sendSSEMessage(writer, {
                    type: StreamMessageType.Token,
                    token: text,
                  })
                }
              }
            } else if (event.event === "on_tool_start") {
              await sendSSEMessage(writer, {
                type: StreamMessageType.ToolStart,
                tool: event.name || "unknown",
                input: event.data.input,
              })
            } else if (event.event === "on_tool_end") {
              const toolMessage = new ToolMessage(event.data.output)

              await sendSSEMessage(writer, {
                type: StreamMessageType.ToolEnd,
                tool: toolMessage.lc_kwargs.name || "unknown",
                output: event.data.output,
              })
            }
          }
          // Send completion message without storing the response
          await sendSSEMessage(writer, { type: StreamMessageType.Done })
        } catch (streamError) {
          console.error("Error in event stream:", streamError)
          await sendSSEMessage(writer, {
            type: StreamMessageType.Error,
            error:
              streamError instanceof Error
                ? streamError.message
                : "Stream processing failed",
          })
        }
      } catch (error) {
        console.log("Error in chat API", error)
        return NextResponse.json(
          { error: "Failed to process chat request" } as const,
          { status: 500 }
        )
      } finally {
        try {
          await writer.close()
        } catch (error) {
          console.log("Error closing writer", error)
        }
      }
    }
    startStream()

    return response
  } catch (error) {
    console.error("Error in chat API", error)
    return NextResponse.json(
      { error: "Failed to process chat request" } as const,
      { status: 500 }
    )
  }
}
