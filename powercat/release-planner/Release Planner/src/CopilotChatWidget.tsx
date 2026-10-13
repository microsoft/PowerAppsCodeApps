import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { MicrosoftCopilotStudioService } from './generated'
import './CopilotChatWidget.css'

interface ChatMessage {
  role: 'user' | 'agent'
  text: string
}

const AGENT_NAME = 'powercat_dynamics365ReleaseExplorer'

const CopilotStudioLogo = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 96 96" fill="none">
    <path d="M64.32 4.77C52.31.77 46.3-1.23 42.15 1.76 38 4.76 38 11.09 38 23.75V34l-9.68-3.23C16.31 26.77 10.3 24.77 6.15 27.76 2 30.76 2 37.09 2 49.75v17.84c0 6.95 0 10.43 1.89 13.05 1.89 2.62 5.19 3.72 11.79 5.92l4.33 1.44 13.89 4.63c7.16 2.39 10.74 3.58 14.33 3.03 3.58-.55 6.64-2.77 12.75-7.2l18.62-13.48c5.03-3.64 7.98-5.78 9.77-8.23.56-.73 1.07-1.52 1.6-2.41C93 61.95 92 58.19 92 50.68V28.42c0-6.96 0-10.44-1.89-13.05-1.89-2.62-5.19-3.72-11.79-5.92l-14-4.67z" fill="url(#cw_cs0)"/>
    <path d="M56 54.42c0-6.96 0-10.44-1.89-13.06-1.89-2.62-5.19-3.72-11.79-5.92L28.32 30.77C16.31 26.77 10.3 24.77 6.15 27.76 2 30.76 2 37.09 2 49.75v17.84c0 6.95 0 10.43 1.89 13.05 1.89 2.62 5.19 3.72 11.79 5.92l14 4.67c12.01 4 18.02 6 22.17 3.01C56 91.24 56 84.91 56 72.25V54.42z" fill="url(#cw_cs1)"/>
    <path d="M92 50.68c0 7.51 0 11.27-1.64 14.48l-.52.84c-.16.26-.33.52-.51.75-1.8 2.45-4.75 4.59-9.77 8.23L60.97 88.47c-6.12 4.43-9.17 6.64-12.75 7.19-3.59.55-7.17-.64-14.33-3.03L25.22 89.74 20 88l.002-.001 1.78-.63 1.56-.52c6.3-2.1 9.51-3.21 11.4-5.83C37 78.02 37 74.54 37 67.58V49.75c0-11.33 0-18.87 3.07-21.87s9.12-1.23 21.25 2.83l14 4.67c6.6 2.2 9.9 3.3 11.79 5.92C89 43.98 89 47.46 89 54.42" fill="url(#cw_cs2)"/>
    <defs>
      <linearGradient id="cw_cs0" x1="53.5" y1="77" x2="81" y2="10" gradientUnits="userSpaceOnUse"><stop stopColor="#2764E7"/><stop offset=".31" stopColor="#8B52F4"/><stop offset=".54" stopColor="#BB45EA"/><stop offset=".8" stopColor="#DB56C6"/><stop offset="1" stopColor="#F462AB"/></linearGradient>
      <radialGradient id="cw_cs1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(61.4 89.3) rotate(-124.9) scale(82.1)"><stop stopColor="#2764E7"/><stop offset=".23" stopColor="#0094F0"/><stop offset=".44" stopColor="#19B2CE"/><stop offset=".7" stopColor="#52D17C"/><stop offset="1" stopColor="#FFD638"/></radialGradient>
      <radialGradient id="cw_cs2" cx="0" cy="0" r="1" gradientTransform="matrix(23 13 8.91 -13.05 43 68)" gradientUnits="userSpaceOnUse"><stop stopColor="#1B44B1"/><stop offset="1" stopColor="#367AF2" stopOpacity="0"/></radialGradient>
    </defs>
  </svg>
)

export default function CopilotChatWidget() {
  const [open, setOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when panel opens
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', text }])
    setLoading(true)

    try {
      const result = await MicrosoftCopilotStudioService.ExecuteCopilotAsyncV2(
        AGENT_NAME,
        { notificationUrl: 'https://notificationurlplaceholder', message: text },
        conversationId
      )

      // IOperationResult.data holds the webhook callback payload:
      // { lastResponse: string, responses: string[], conversationId: string }
      const data = (result as any).data ?? result
      const reply =
        data?.lastResponse ??
        (Array.isArray(data?.responses) && data.responses.length > 0
          ? data.responses.join('\n')
          : null) ??
        'No response received.'

      const convId = data?.conversationId
      if (convId) setConversationId(convId)

      setMessages(prev => [...prev, { role: 'agent', text: reply }])
    } catch (err: any) {
      const errorMsg = err?.message || 'Something went wrong. Please try again.'
      setMessages(prev => [...prev, { role: 'agent', text: errorMsg }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, conversationId])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    setConversationId(undefined)
  }

  const copyMessage = useCallback(async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2000)
    } catch {
      // fallback for environments where clipboard API is unavailable
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2000)
    }
  }, [])

  const copyAllMessages = useCallback(async () => {
    const text = messages.map(m => `${m.role === 'user' ? 'You' : 'Copilot'}: ${m.text}`).join('\n\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIdx(-1)
      setTimeout(() => setCopiedIdx(null), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedIdx(-1)
      setTimeout(() => setCopiedIdx(null), 2000)
    }
  }, [messages])

  return (
    <>
      {/* Floating bubble */}
      <button
        className="cw-bubble"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        title="Chat with Copilot Studio"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <CopilotStudioLogo size={30} />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className={`cw-panel${fullscreen ? ' cw-panel--fullscreen' : ''}`}>
          {/* Header */}
          <div className="cw-header">
            <div className="cw-header-left">
              <CopilotStudioLogo size={22} />
              <span className="cw-header-title">Copilot Studio</span>
            </div>
            <div className="cw-header-actions">
              {messages.length > 0 && (
                <button className="cw-header-btn" onClick={copyAllMessages} title={copiedIdx === -1 ? 'Copied!' : 'Copy all messages'}>
                  {copiedIdx === -1 ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              )}
              <button className="cw-header-btn" onClick={clearChat} title="New conversation">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </button>
              <button className="cw-header-btn" onClick={() => setFullscreen(f => !f)} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                {fullscreen ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                )}
              </button>
              <button className="cw-header-btn" onClick={() => { setOpen(false); setFullscreen(false) }} title="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="cw-messages">
            {messages.length === 0 && !loading && (
              <div className="cw-welcome">
                <CopilotStudioLogo size={48} />
                <p className="cw-welcome-title">Copilot Studio</p>
                <p className="cw-welcome-sub">Ask me anything about release plans, features, or timelines.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`cw-msg cw-msg--${msg.role}`}>
                {msg.role === 'agent' && (
                  <div className="cw-msg-avatar">
                    <CopilotStudioLogo size={18} />
                  </div>
                )}
                <div className="cw-msg-content">
                  <div className={`cw-msg-bubble cw-msg-bubble--${msg.role}`}>
                    {msg.role === 'agent'
                      ? <ReactMarkdown>{msg.text}</ReactMarkdown>
                      : msg.text}
                  </div>
                  <button
                    className="cw-copy-btn"
                    onClick={() => copyMessage(msg.text, i)}
                    title={copiedIdx === i ? 'Copied!' : 'Copy message'}
                  >
                    {copiedIdx === i ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
            {loading && (
              <div className="cw-msg cw-msg--agent">
                <div className="cw-msg-avatar">
                  <CopilotStudioLogo size={18} />
                </div>
                <div className="cw-msg-bubble cw-msg-bubble--agent cw-msg-bubble--loading">
                  <span className="cw-typing-dot" />
                  <span className="cw-typing-dot" />
                  <span className="cw-typing-dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="cw-input-area">
            <textarea
              ref={inputRef}
              className="cw-input"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              className="cw-send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
