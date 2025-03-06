import { ChatOpenAI } from "@langchain/openai"
import { RedisCache } from "@langchain/community/caches/ioredis"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import {
  StateGraph,
  MessagesAnnotation,
  END,
  START,
  MemorySaver,
} from "@langchain/langgraph"
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts"
import wxflows from "@wxflows/sdk/langchain"
import { Redis } from "ioredis"
import SYSTEM_MESSAGE from "@/constant/systemMessage"
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  trimMessages,
} from "@langchain/core/messages"

// Trim the messages to manage conversation history
const trimmer = trimMessages({
  maxTokens: 10,
  strategy: "last",
  tokenCounter: (message) => message.length,
  includeSystem: true,
  allowPartial: false,
  startOn: "human",
})

const toolClient = new wxflows({
  endpoint: process.env.WXFLOW_ENDPOINT!,
  apikey: process.env.WXFLOW_API_KEY!,
})

const tools = await toolClient.lcTools
const toolNode = new ToolNode(tools)

const redisClient = new Redis(process.env.REDIS_URL!, {
  tls: { rejectUnauthorized: false },
})
const cache = new RedisCache(redisClient, { ttl: 3600 })

const llm = () => {
  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.7,
    maxTokens: 4096,
    streaming: true,
    cache,
    callbacks: [
      {
        handleLLMStart: async () => {
          console.log("🤖 Starting LLM call")
        },
        handleLLMEnd: async (output) => {
          const usage = output.llmOutput?.usage
          if (usage) {
            console.log("📊 Token Usage:", {
              input_tokens: usage.input_tokens,
              output_tokens: usage.output_tokens,
              total_tokens: usage.input_tokens + usage.output_tokens,
              cache_creation_input_tokens:
                usage.cache_creation_input_tokens || 0,
              cache_read_input_tokens: usage.cache_read_input_tokens || 0,
            })
          }
        },
        handleLLMNewToken: async (token: string) => {
          console.log("🔑 New token:", token)
        },
      },
    ],
  }).bindTools(tools)

  return model
}

const shouldContinue = (state: typeof MessagesAnnotation.State) => {
  const messages = state.messages
  const lastMessage = messages[messages.length - 1] as AIMessage

  // if the llm makes a tool call, then route to the "tools" node
  if (lastMessage.tool_calls?.length) {
    return "tools"
  }

  // If the last message is a tool message, route back to agent
  if (lastMessage.content && lastMessage._getType() === "tool") {
    return "agent"
  }

  // Otherwise, we stop (reply to the user)
  return END
}

const createWorkflow = () => {
  const model = llm()
  return new StateGraph(MessagesAnnotation)
    .addNode("agent", async (state) => {
      const systemContent = SYSTEM_MESSAGE

      // create the prompt template with system message and messages placeholder
      const promptTemplate = ChatPromptTemplate.fromMessages([
        new SystemMessage(systemContent, {
          cache_control: {
            typy: "ephemeral",
          },
        }),
        new MessagesPlaceholder("messages"),
      ])

      // trim the messages to manage conversation history
      const trimmedMessages = await trimmer.invoke(state.messages)

      // format the prompt with the current messages
      const prompt = await promptTemplate.invoke({ messages: trimmedMessages })

      // get response from llm
      const response = await model.invoke(prompt)

      return { messages: [response] }
    })
    .addNode("tools", toolNode)
    .addEdge(START, "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent")
}

const addCachingHeaders = (messages: BaseMessage[]): BaseMessage[] => {
  if (!messages.length) return messages

  const cachedMessages = [...messages]

  const addCache = (message: BaseMessage) => {
    message.content = [
      {
        type: "text",
        text: message.content as string,
        cache_control: {
          type: "ephemeral",
        },
      },
    ]
  }

  addCache(cachedMessages.at(-1)!)

  let humanCount = 0
  for (let i = cachedMessages.length - 1; i >= 0; i--) {
    if (cachedMessages[i] instanceof HumanMessage) {
      humanCount++
      if (humanCount === 2) {
        // console.log("🤑🤑🤑 Caching second-to-last human message");
        addCache(cachedMessages[i])
        break
      }
    }
  }

  return cachedMessages
}

export async function submitQuestion(messages: BaseMessage[], chatId: string) {
  // Add caching headers to messages
  const cachedMessages = addCachingHeaders(messages)
  // console.log("🔒🔒🔒 Messages:", cachedMessages);

  // Create workflow with chatId and onToken callback
  const workflow = createWorkflow()

  // Create a checkpoint to save the state of the conversation
  const checkpointer = new MemorySaver()
  const app = workflow.compile({ checkpointer })

  const stream = await app.streamEvents(
    { messages: cachedMessages },
    {
      version: "v2",
      configurable: { thread_id: chatId },
      streamMode: "messages",
      runId: chatId,
    }
  )
  return stream
}
