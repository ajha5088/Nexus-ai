import { useCallback, useRef } from "react";
import { sendQueryStream } from "../services/api.js";

export function useChat(store, userId = "aditya") {
  const bufferRef = useRef("");
  const flushTimerRef = useRef(null);

  const sendMessage = useCallback(
    async (query, forceAgents = null) => {
      if (!store.activeId) store.createConversation();

      store.addMessage({ role: "user", content: query });
      store.setIsLoading(true);

      const msgId = Date.now() + 1;
      bufferRef.current = "";

      store.addMessage({
        id: msgId,
        role: "assistant",
        content: "",
        streaming: true,
        trace: null,
        totalMs: null,
        llmCalls: null,
        agentsUsed: null,
        routingMethod: null,
      });

      // Flush buffer to state every 50ms — smooth streaming without too many renders
      function startFlush() {
        flushTimerRef.current = setInterval(() => {
          if (bufferRef.current) {
            const text = bufferRef.current;
            bufferRef.current = "";
            store.updateMessage(msgId, (msg) => ({
              ...msg,
              content: (msg.content || "") + text,
            }));
          }
        }, 50);
      }

      function stopFlush() {
        clearInterval(flushTimerRef.current);
        // Final flush
        if (bufferRef.current) {
          const text = bufferRef.current;
          bufferRef.current = "";
          store.updateMessage(msgId, (msg) => ({
            ...msg,
            content: (msg.content || "") + text,
          }));
        }
      }

      try {
        startFlush();

        await sendQueryStream(
          { query, userId, forceAgents },

          // onChunk — accumulate into buffer instead of direct state update
          (text) => {
            bufferRef.current += text;
          },

          // onTrace
          (data) => {
            store.updateMessage(msgId, (msg) => ({
              ...msg,
              trace: data.trace,
              llmCalls: data.llmCalls,
              agentsUsed: data.agentsUsed,
              routingMethod: data.routingMethod,
            }));
          },

          // onDone
          (data) => {
            stopFlush();
            store.updateMessage(msgId, (msg) => ({
              ...msg,
              totalMs: data.totalMs,
              streaming: false,
            }));
          },
        );
      } catch (err) {
        stopFlush();
        store.updateMessage(msgId, () => ({
          id: msgId,
          role: "error",
          content: `Error: ${err.message}`,
        }));
      } finally {
        store.setIsLoading(false);
      }
    },
    [userId, store],
  );

  return { ...store, sendMessage };
}
