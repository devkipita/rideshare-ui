// components/global-chat.tsx
"use client";

import * as React from "react";
import {
  MessageCircle,
  Star,
  BadgeCheck,
  X,
  SendHorizonal,
} from "lucide-react";
import { BottomSheet, Surface } from "@/components/ui-parts";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { createPortal } from "react-dom";

export type TripState = "not_started" | "started" | "completed" | "cancelled";

export type Driver = {
  id: string;
  name: string;
  rating: number;
  trips: number;
  avatarUrl?: string;
  role?: "driver" | "passenger";
  car?: {
    makeModel: string;
    color: string;
    plate: string;
  };
};

export type ChatMessage = {
  id: string;
  rideId: string;
  driverId: string;
  sender: "user" | "driver";
  text: string;
  createdAt: number;
  readByUser: boolean;
};

export type ChatContext = {
  rideId: string;
  tripState: TripState;
  driver: Driver;
};

type ChatStore = {
  open: boolean;
  active: ChatContext | null;
  messages: ChatMessage[];
  openChat: (ctx: ChatContext) => void;
  closeChat: () => void;
  send: (text: string) => void;
  markRead: () => void;
  unreadCount: number;
  canShowButton: boolean;
};

const ChatStoreContext = React.createContext<ChatStore | null>(null);

function uid(prefix = "m") {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now()}`;
}

function canChat(tripState: TripState) {
  return tripState !== "completed" && tripState !== "cancelled";
}

function countUnreadThread(messages: ChatMessage[], ctx: ChatContext | null) {
  if (!ctx) return 0;
  let n = 0;
  for (const m of messages) {
    if (
      m.rideId === ctx.rideId &&
      m.driverId === ctx.driver.id &&
      m.sender === "driver" &&
      !m.readByUser
    ) {
      n += 1;
    }
  }
  return n;
}

function ChatBody({
  driver,
  messages,
  text,
  setText,
  onSend,
  onClose,
}: {
  driver: Driver | null;
  messages: ChatMessage[];
  text: string;
  setText: (v: string) => void;
  onSend: (text: string) => void;
  onClose: () => void;
}) {
  const participantLabel = driver?.role === "passenger" ? "passenger" : "driver";

  return (
    <div className="space-y-3">
        {driver ? (
          <Surface tone="panel" className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold tracking-[0.2em] text-muted-foreground">
                  CHATTING WITH {participantLabel.toUpperCase()}
                </p>
                <p className="mt-1 text-base font-extrabold text-foreground">
                  {driver.name}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-2.5 py-1">
                    <Star className="h-3.5 w-3.5 text-primary" />
                    <span className="text-foreground/85">
                      {driver.rating.toFixed(1)}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-2.5 py-1">
                    <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                    <span className="text-foreground/85">
                      {driver.trips} trips
                    </span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-border/70 bg-card/70 text-foreground/80 active:scale-[0.99]"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </Surface>
        ) : (
          <Surface tone="panel" className="p-4 text-center">
            <p className="text-sm font-semibold text-muted-foreground">
              No conversation selected
            </p>
          </Surface>
        )}

        <Surface tone="panel" className="p-3">
          <div className="max-h-[46vh] overflow-y-auto space-y-2 pr-1">
            {messages.length ? (
              messages
                .slice()
                .sort((a, b) => a.createdAt - b.createdAt)
                .map((m) => (
                  <div
                    key={m.id}
                    className={[
                      "flex",
                      m.sender === "user" ? "justify-end" : "justify-start",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "max-w-[80%] rounded-2xl px-3 py-2 text-sm font-semibold",
                        m.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card/70 border border-border/70 text-foreground/90",
                      ].join(" ")}
                    >
                      {m.text}
                    </div>
                  </div>
                ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm font-semibold text-muted-foreground">
                  Say hi to your {participantLabel}.
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message…"
              className="h-11 w-full rounded-2xl border border-border/70 bg-card/70 px-3 text-[14px] font-semibold outline-none placeholder:text-muted-foreground/80"
            />
            <Button
              className="h-11 rounded-2xl px-3 font-semibold"
              onClick={() => {
                const v = text.trim();
                if (!v) return;
                onSend(v);
                setText("");
              }}
              disabled={!driver}
            >
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </div>
        </Surface>
      </div>
  );
}

function ChatSheet({
  open,
  onOpenChange,
  driver,
  messages,
  onSend,
  onMarkRead,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  driver: Driver | null;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onMarkRead: () => void;
}) {
  const [text, setText] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  const isMobile = useIsMobile();

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (open) onMarkRead();
  }, [open, onMarkRead]);

  React.useEffect(() => {
    if (!open) setText("");
  }, [open]);

  // Mobile: bottom sheet (existing behavior)
  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        title="Messages"
        zIndex={{ backdrop: 60, sheet: 70 }}
      >
        <ChatBody
          driver={driver}
          messages={messages}
          text={text}
          setText={setText}
          onSend={onSend}
          onClose={() => onOpenChange(false)}
        />
      </BottomSheet>
    );
  }

  // Desktop: floating bottom-right panel, portaled to document body
  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed bottom-6 right-6 z-[70] w-[380px] max-w-[calc(100vw-32px)]"
      role="dialog"
      aria-label="Chat"
    >
      <div
        className={[
          "overflow-hidden rounded-3xl border border-border/70",
          "bg-background/95 supports-[backdrop-filter]:backdrop-blur-xl",
          "shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]",
          "animate-in fade-in slide-in-from-bottom-4 duration-300",
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-2xl bg-primary/10 text-primary">
              <MessageCircle className="h-4 w-4" />
            </div>
            <p className="text-sm font-extrabold tracking-tight">Messages</p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="grid h-9 w-9 place-items-center rounded-2xl border border-border/70 bg-card/70 text-foreground/80 active:scale-[0.99]"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[min(560px,calc(100vh-120px))] overflow-y-auto p-3">
          <ChatBody
            driver={driver}
            messages={messages}
            text={text}
            setText={setText}
            onSend={onSend}
            onClose={() => onOpenChange(false)}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}

function FloatingChatButton({
  visible,
  unreadCount,
  onClick,
}: {
  visible: boolean;
  unreadCount: number;
  onClick: () => void;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!visible || !mounted) return null;
  return createPortal(
    <button
      type="button"
      onClick={onClick}
      className={[
        "fixed z-[80] md:right-6 md:bottom-6 right-4 bottom-[88px]",
        "grid h-14 w-14 place-items-center rounded-2xl md:rounded-full",
        "bg-primary text-primary-foreground shadow-xl shadow-primary/20",
        "active:scale-[0.98] transition-transform",
      ].join(" ")}
      aria-label="Open chat"
    >
      <MessageCircle className="h-6 w-6" />
      {unreadCount > 0 ? (
        <div className="absolute -top-2 -right-2 grid h-6 min-w-[24px] place-items-center rounded-full bg-destructive px-2 text-xs font-extrabold text-destructive-foreground border border-background">
          {unreadCount > 99 ? "99+" : unreadCount}
        </div>
      ) : null}
    </button>,
    document.body,
  );
}

function GlobalChatUI() {
  const chat = useChat();

  const driver = chat.active?.driver ?? null;

  const threadMessages = React.useMemo(() => {
    if (!chat.active) return [];
    return chat.messages.filter(
      (m) =>
        m.rideId === chat.active!.rideId &&
        m.driverId === chat.active!.driver.id,
    );
  }, [chat.messages, chat.active]);

  return (
    <>
      <ChatSheet
        open={chat.open}
        onOpenChange={(v) =>
          v ? chat.active && chat.openChat(chat.active) : chat.closeChat()
        }
        driver={driver}
        messages={threadMessages}
        onSend={chat.send}
        onMarkRead={chat.markRead}
      />
      <FloatingChatButton
        visible={chat.canShowButton && !!chat.active}
        unreadCount={chat.unreadCount}
        onClick={() => {
          if (!chat.active) return;
          chat.openChat(chat.active);
        }}
      />
    </>
  );
}

export function ChatProvider({
  children,
  initialMessages,
}: {
  children: React.ReactNode;
  initialMessages?: ChatMessage[];
}) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<ChatContext | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>(
    initialMessages ?? [],
  );

  const unreadCount = React.useMemo(
    () => countUnreadThread(messages, active),
    [messages, active],
  );

  const canShowButton = React.useMemo(() => {
    if (!active) return false;
    return canChat(active.tripState);
  }, [active]);

  const markRead = React.useCallback(() => {
    if (!active) return;
    setMessages((prev) =>
      prev.map((m) => {
        if (
          m.rideId === active.rideId &&
          m.driverId === active.driver.id &&
          m.sender === "driver"
        ) {
          return { ...m, readByUser: true };
        }
        return m;
      }),
    );
  }, [active]);

  const openChat = React.useCallback((ctx: ChatContext) => {
    setActive(ctx);
    setOpen(true);
  }, []);

  const closeChat = React.useCallback(() => {
    setOpen(false);
  }, []);

  const send = React.useCallback(
    (text: string) => {
      if (!active) return;
      const t = text.trim();
      if (!t) return;

      const mine: ChatMessage = {
        id: uid("m"),
        rideId: active.rideId,
        driverId: active.driver.id,
        sender: "user",
        text: t,
        createdAt: Date.now(),
        readByUser: true,
      };

      setMessages((prev) => [...prev, mine]);

      window.setTimeout(() => {
        const reply =
          active.driver.role === "passenger"
            ? "Thanks. I will confirm pickup details here."
            : "Noted. I am on the way.";
        setMessages((prev) => [
          ...prev,
          {
            id: uid("m"),
            rideId: active.rideId,
            driverId: active.driver.id,
            sender: "driver",
            text: reply,
            createdAt: Date.now(),
            readByUser: false,
          },
        ]);
      }, 900);
    },
    [active],
  );

  React.useEffect(() => {
    if (open) markRead();
  }, [open, markRead]);

  const value: ChatStore = React.useMemo(
    () => ({
      open,
      active,
      messages,
      openChat,
      closeChat,
      send,
      markRead,
      unreadCount,
      canShowButton,
    }),
    [
      open,
      active,
      messages,
      openChat,
      closeChat,
      send,
      markRead,
      unreadCount,
      canShowButton,
    ],
  );

  return (
    <ChatStoreContext.Provider value={value}>
      {children}
      <GlobalChatUI />
    </ChatStoreContext.Provider>
  );
}

export function useChat() {
  const ctx = React.useContext(ChatStoreContext);
  if (!ctx) throw new Error("useChat must be used within <ChatProvider />");
  return ctx;
}
