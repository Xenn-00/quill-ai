import { v } from "convex/values"
import { query } from "./_generated/server"

export const getLastMessage = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    const chat = await ctx.db.get(args.chatId)
    if (!chat || chat.userId !== identity.subject)
      throw new Error("Chat not found")

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .first()

    return messages
  },
})
