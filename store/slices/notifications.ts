import { create } from "zustand";

type NoticeKind = "system" | "ride" | "announcement";
type NoticeSeverity = "info" | "warning" | "critical";

interface Notice {
  id: string;
  kind: NoticeKind;
  severity: NoticeSeverity;
  title: string;
  body: string;
  location?: string;
  route?: { from: string; to: string };
  timestamp: number;
  read: boolean;
}

interface NotificationsState {
  items: Notice[];
  unreadCount: number;
  setItems: (items: Notice[]) => void;
  addAlert: (notice: Notice) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  items: [],
  unreadCount: 0,

  setItems: (items) =>
    set({
      items,
      unreadCount: items.filter((n) => !n.read).length,
    }),

  addAlert: (notice) =>
    set((s) => {
      const items = [notice, ...s.items];
      return { items, unreadCount: items.filter((n) => !n.read).length };
    }),

  markRead: (id) =>
    set((s) => {
      const items = s.items.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      return { items, unreadCount: items.filter((n) => !n.read).length };
    }),

  markAllRead: () =>
    set((s) => ({
      items: s.items.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
}));
