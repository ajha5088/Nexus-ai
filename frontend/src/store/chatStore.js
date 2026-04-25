import { useState, useCallback, useRef, useEffect } from "react";

function generateId() {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function loadConversations() {
  try {
    return JSON.parse(localStorage.getItem("nexus-conversations") || "[]");
  } catch {
    return [];
  }
}

function saveConversations(convs) {
  localStorage.setItem("nexus-conversations", JSON.stringify(convs));
}

export function useChatStore() {
  const [conversations, setConversations] = useState(loadConversations);
  const [activeId, setActiveId] = useState(() => {
    const saved = loadConversations();
    return saved[0]?.id ?? null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const activeIdRef = useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const activeConversation =
    conversations.find((c) => c.id === activeId) ?? null;
  const messages = activeConversation?.messages ?? [];

  const createConversation = useCallback(() => {
    const id = generateId();
    const newConv = {
      id,
      title: "New chat",
      messages: [],
      createdAt: Date.now(),
    };
    setConversations((prev) => {
      const next = [newConv, ...prev];
      saveConversations(next);
      return next;
    });
    setActiveId(id);
    return id;
  }, []);

  const addMessage = useCallback((message) => {
    setConversations((prev) => {
      const next = prev.map((c) => {
        if (c.id !== activeIdRef.current) return c;
        const finalMessage = {
          id: message.id ?? Date.now(),
          timestamp: new Date().toISOString(),
          ...message,
        };
        const newMessages = [...c.messages, finalMessage];
        const title =
          c.messages.length === 0 && message.role === "user"
            ? message.content.slice(0, 40)
            : c.title;
        return { ...c, messages: newMessages, title };
      });
      saveConversations(next);
      return next;
    });
  }, []); // safe — uses ref

  const deleteConversation = useCallback(
    (id) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        saveConversations(next);
        return next;
      });
      setActiveId((prev) => {
        if (prev !== id) return prev;
        const remaining = conversations.filter((c) => c.id !== id);
        return remaining[0]?.id ?? null;
      });
    },
    [conversations],
  );

  const updateMessage = useCallback((id, updater) => {
    setConversations((prev) => {
      // Find which conversation has this message id
      const next = prev.map((c) => {
        const hasMessage = c.messages.some((m) => m.id === id);
        if (!hasMessage) return c;
        return {
          ...c,
          messages: c.messages.map((m) => (m.id === id ? updater(m) : m)),
        };
      });
      saveConversations(next);
      return next;
    });
  }, []); // no dependencies — searches all conversations

  return {
    conversations,
    activeId,
    activeConversation,
    messages,
    isLoading,
    setIsLoading,
    setActiveId,
    createConversation,
    addMessage,
    updateMessage,
    deleteConversation,
  };
}
