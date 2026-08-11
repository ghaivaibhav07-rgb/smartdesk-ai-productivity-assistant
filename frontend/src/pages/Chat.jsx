import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import api from "../api/axios";

export default function Chat() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadSessions = async () => {
      try {
        const response = await api.get("/chat/sessions");

        if (!cancelled) {
          setSessions(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
              "Failed to load chat sessions."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingSessions(false);
        }
      }
    };

    loadSessions();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadChat = async (sessionId) => {
    setError("");
    setActiveSessionId(sessionId);
    setLoadingMessages(true);

    try {
      const response = await api.get(`/chat/${sessionId}`);
      setMessages(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load chat."
      );
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setMessage("");
    setError("");
  };

  const sendMessage = async (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || sending) {
      return;
    }

    setError("");
    setSending(true);

    try {
      const response = await api.post("/chat/", {
        session_id: activeSessionId,
        message: trimmedMessage,
      });

      const newSessionId = response.data.session_id;

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "user",
          content: trimmedMessage,
        },
        {
          role: "assistant",
          content: response.data.reply,
        },
      ]);

      setMessage("");
      setActiveSessionId(newSessionId);

      const sessionsResponse = await api.get(
        "/chat/sessions"
      );

      setSessions(sessionsResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to send message."
      );
    } finally {
      setSending(false);
    }
  };

  const deleteChat = async (sessionId) => {
    const confirmed = window.confirm(
      "Delete this chat?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/chat/${sessionId}`);

      setSessions((currentSessions) =>
        currentSessions.filter(
          (session) => session.id !== sessionId
        )
      );

      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to delete chat."
      );
    }
  };

  return (
    <div className="chat-page">
      {/* Chat history */}
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <div>
            <h2>AI Chat</h2>
            <p>Your conversations</p>
          </div>

          <button
            type="button"
            className="chat-new-button"
            onClick={startNewChat}
          >
            + New Chat
          </button>
        </div>

        {loadingSessions ? (
          <div className="chat-sidebar-empty">
            Loading chats...
          </div>
        ) : sessions.length === 0 ? (
          <div className="chat-sidebar-empty">
            No previous chats.
          </div>
        ) : (
          <div className="chat-session-list">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={
                  activeSessionId === session.id
                    ? "chat-session active"
                    : "chat-session"
                }
              >
                <button
                  type="button"
                  className="chat-session-button"
                  onClick={() =>
                    loadChat(session.id)
                  }
                >
                  <span>
                    {session.title}
                  </span>
                </button>

                <button
                  type="button"
                  className="chat-delete-button"
                  onClick={() =>
                    deleteChat(session.id)
                  }
                  title="Delete chat"
                  aria-label={`Delete ${session.title}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main chat */}
      <main className="chat-main">
        <div className="chat-header">
          <div>
            <h1>AI Assistant</h1>
            <p>
              Ask questions and continue your
              conversations.
            </p>
          </div>
        </div>

        {error && (
          <div className="chat-error">
            {error}
          </div>
        )}

        <div className="chat-messages">
          {loadingMessages ? (
            <div className="chat-loading">
              Loading conversation...
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-empty-icon">
                ✦
              </div>

              <h2>How can I help you?</h2>

              <p>
                Ask me anything or start a new
                conversation.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={`${msg.id || "message"}-${index}`}
                className={
                  msg.role === "user"
                    ? "chat-message user-message"
                    : "chat-message assistant-message"
                }
              >
                <div className="message-role">
                  {msg.role === "user"
                    ? "You"
                    : "AI"}
                </div>

                <div className="message-content markdown-content">
                  {msg.role === "assistant" ? (
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))
          )}

          {sending && (
            <div className="chat-message assistant-message">
              <div className="message-role">
                AI
              </div>

              <div className="message-content">
                <div className="chat-thinking">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}
        </div>

        <form
          className="chat-input-area"
          onSubmit={sendMessage}
        >
          <input
            type="text"
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            placeholder="Type your message..."
            disabled={sending}
          />

          <button
            type="submit"
            disabled={
              sending || !message.trim()
            }
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </main>
    </div>
  );
}