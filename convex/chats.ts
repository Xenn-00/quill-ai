import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const createChat = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    const chat = await ctx.db.insert("chats", {
      title: args.title,
      userId: identity.subject,
      createdAt: Date.now(),
    })

    return chat
  },
})

export const listChat = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    const chats = await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect()

    return chats
  },
})

export const deleteChat = mutation({
  args: {
    id: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    const chat = await ctx.db.get(args.id)
    if (!chat || chat.userId !== identity.subject)
      throw new Error("Unauthorized")

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.id))
      .collect()

    /* Delete all messages in chat*/
    for (const message of messages) {
      await ctx.db.delete(message._id)
    }

    await ctx.db.delete(args.id)
  },
})

export const getChat = query({
  args: {
    chatId: v.id("chats"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const chat = await ctx.db.get(args.chatId)
      if (!chat || chat.userId !== args.userId) {
        console.log("❌ Chat not found or unauthorized", {
          chatExists: !!chat,
          chatUserId: chat?.userId,
          requestUserId: args.userId,
        })
        return null
      }
      return chat
    } catch (error) {
      console.error("🔥 Error in getChat:", error)
      return null
    }
  },
})
