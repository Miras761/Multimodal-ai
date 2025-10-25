import React from 'react';
import { MenuIcon, BotIcon } from './Icons.tsx';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="bg-black/20 backdrop-blur-sm border-b border-green-500/20 p-4 flex items-center gap-4 z-10">
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-2 rounded-md text-gray-300 hover:text-green-400 hover:bg-green-500/10 transition-colors"
        aria-label="Toggle sidebar"
      >
        <MenuIcon className="w-6 h-6" />
      </button>
      <div className="flex items-center gap-2">
        <BotIcon className="w-7 h-7 text-green-400" />
        <h1 className="text-xl font-semibold text-gray-200 truncate">Multimodal</h1>
      </div>
    </header>
  );
};