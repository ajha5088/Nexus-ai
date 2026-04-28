import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import { useChatStore } from "../store/chatStore.js";

export default function Chat() {
  const store = useChatStore();

  return (
    <div style={{
      display: "flex",
      width: "100vw",
      height: "100vh",
      backgroundColor: "#0a0a12",
      overflow: "hidden",
      position: "fixed",
      top: 0,
      left: 0,
    }}>
      <Sidebar
        conversations={store.conversations}
        activeId={store.activeId}
        onSelect={store.setActiveId}
        onCreate={store.createConversation}
        onDelete={store.deleteConversation}
      />
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <ChatWindow key={store.activeId} store={store} />
      </div>
    </div>
  );
}