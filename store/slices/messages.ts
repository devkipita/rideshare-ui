import { create } from "zustand";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  read: boolean;
}

interface Conversation {
  id: string;
  participantName: string;
  participantImage?: string;
  rideId: string;
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
}

interface MessagesState {
  conversations: Map<string, Conversation>;
  activeChatId: string | null;
  setActiveChat: (id: string | null) => void;
  addMessage: (conversationId: string, message: Message) => void;
  markConversationRead: (id: string) => void;
  setConversations: (convos: Conversation[]) => void;
}

export const useMessagesStore = create<MessagesState>()((set) => ({
  conversations: new Map(),
  activeChatId: null,

  setActiveChat: (id) => set({ activeChatId: id }),

  addMessage: (conversationId, message) =>
    set((s) => {
      const conversations = new Map(s.conversations);
      const convo = conversations.get(conversationId);
      if (convo) {
        convo.messages.push(message);
        convo.lastMessage = message;
        if (!message.read) convo.unreadCount++;
      }
      return { conversations };
    }),

  markConversationRead: (id) =>
    set((s) => {
      const conversations = new Map(s.conversations);
      const convo = conversations.get(id);
      if (convo) {
        convo.messages.forEach((m) => (m.read = true));
        convo.unreadCount = 0;
      }
      return { conversations };
    }),

  setConversations: (convos) =>
    set({
      conversations: new Map(convos.map((c) => [c.id, c])),
    }),
}));
