'use client'

import { useEffect, useReducer, useRef, useState } from 'react'
import { ChevronLeft, Send, User } from 'lucide-react'

interface Message {
  id: string
  sender: 'driver' | 'passenger' | 'system'
  text: string
  timestamp: number
  status?: 'sent' | 'read'
}

type Action =
  | { type: 'SET'; payload: Message[] }
  | { type: 'ADD'; payload: Message }

const reducer = (state: Message[], action: Action): Message[] => {
  if (action.type === 'SET') return action.payload
  if (action.type === 'ADD') return [...state, action.payload]
  return state
}

const INITIAL_MESSAGES: Message[] = [
  { id: '1', sender: 'system', text: '02:22 AM', timestamp: Date.now() - 300000 },
  { id: '2', sender: 'passenger', text: 'Great, thanks!', timestamp: Date.now() - 180000, status: 'read' },
  { id: '3', sender: 'passenger', text: 'Arrived', timestamp: Date.now() - 120000, status: 'sent' },
  { id: '4', sender: 'passenger', text: 'Running 5 mins late', timestamp: Date.now() - 60000, status: 'sent' }
]

const QUICK_REPLIES = ['On my way', 'Arrived', 'Running 5 mins late']

export function MessagesScreen() {
  const [messages, dispatch] = useReducer(reducer, INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = (text: string) => {
    if (!text.trim()) return
    dispatch({
      type: 'ADD',
      payload: {
        id: Date.now().toString(),
        sender: 'passenger',
        text,
        timestamp: Date.now(),
        status: 'sent'
      }
    })
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <div className="h-screen bg-background relative">
      <style>{`
        .no-scrollbar::-webkit-scrollbar{display:none}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      <div className="absolute inset-0 pt-[64px] pb-[184px] overflow-y-auto no-scrollbar">
        <div className="max-w-screen-sm mx-auto w-full px-4">
          {messages.map(m => {
            if (m.sender === 'system') {
              return (
                <div key={m.id} className="text-center text-xs text-muted-foreground my-4">
                  {m.text}
                </div>
              )
            }

            const mine = m.sender === 'passenger'

            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'} mb-2`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm
                    ${mine
                      ? 'bg-green-600 text-white rounded-br-none'
                      : 'bg-muted rounded-bl-none'
                    }`}
                >
                  <p>{m.text}</p>
                  <p className="mt-1 text-[10px] opacity-70">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {mine && m.status ? ` • ${m.status}` : ''}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={endRef} />
        </div>
      </div>

      <div className="fixed bottom-[142px] left-0 right-0 z-40 bg-background">
        <div className="max-w-screen-sm mx-auto w-full px-5 flex justify-center gap-2">
          {QUICK_REPLIES.map(text => (
            <button
              key={text}
              onClick={() => send(text)}
              className="rounded-full bg-muted px-4 py-2 text-xs font-medium"
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      <div
        className="fixed bottom-[66px] left-0 right-0 z-50 glass border-t"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-screen-sm mx-auto w-full px-4 py-4 flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={onChange}
            onKeyDown={onKey}
            placeholder="Message..."
            rows={1}
            className="flex-1 resize-none rounded-2xl bg-muted px-4 py-2 text-sm focus:outline-none"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim()}
            className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
