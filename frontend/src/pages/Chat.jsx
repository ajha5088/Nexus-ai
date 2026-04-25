import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import { useChatStore } from "../store/chatStore.js";

export default function Chat() {
  const store = useChatStore();

  return (
    <div className="flex h-screen bg-[#0a0a12] overflow-hidden">
      <Sidebar
        conversations={store.conversations}
        activeId={store.activeId}
        onSelect={store.setActiveId}
        onCreate={store.createConversation}
        onDelete={store.deleteConversation}
      />
      <div className="flex-1 overflow-hidden">
        <ChatWindow key={store.activeId} store={store} />
      </div>
    </div>
  );
}