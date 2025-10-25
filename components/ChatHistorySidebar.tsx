import React from 'react';
// Fix: Add .ts extension to import to resolve module.
import type { ChatHistory, ChatSession } from '../types.ts';
// Fix: Add .tsx extension to import to resolve module.
import { PlusIcon, TrashIcon, ChatBubbleIcon } from './Icons.tsx';

interface ChatHistorySidebarProps {
  chatHistory: ChatHistory;
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  isOpen: boolean;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  chatHistory,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isOpen,
}) => {
  const sortedChatSessions: ChatSession[] = Object.values(chatHistory).sort((a, b) => {
    // For now, sorting is disabled to maintain order of creation.
    // In a real app, a timestamp on the session would be ideal for sorting.
    return 0; 
  });


  return (
    <aside
      className={`absolute lg:relative inset-y-0 left-0 z-20 flex-shrink-0 w-64 bg-black/30 backdrop-blur-lg border-r border-green-500/20 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      <div className="p-4 border-b border-green-500/20">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-green-500/50 text-green-300 neon-glow-button"
        >
          <PlusIcon className="w-5 h-5" />
          <span className="font-semibold">New Chat</span>
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1 sidebar-scroll">
        {sortedChatSessions.map((session) => (
          <div
            key={session.id}
            className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
              currentChatId === session.id
                ? 'bg-green-500/20'
                : 'hover:bg-green-500/10'
            }`}
            onClick={() => onSelectChat(session.id)}
          >
            <div className="flex items-center gap-2 overflow-hidden">
                <ChatBubbleIcon className="w-5 h-5 flex-shrink-0 text-gray-400" />
                <span className="truncate text-sm text-gray-200">{session.title}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(session.id);
              }}
              className="p-1 rounded-md text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Delete chat"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </nav>
    </aside>
  );
};