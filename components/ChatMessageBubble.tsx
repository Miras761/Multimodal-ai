import React from 'react';
// Fix: Add .ts extension to import to resolve module.
import type { ChatMessage, Citation } from '../types.ts';
// Fix: Add .tsx extension to import to resolve module.
import { UserIcon, BotIcon } from './Icons.tsx';
import { marked } from 'marked';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

const CitationView: React.FC<{ citations: Citation[] }> = ({ citations }) => {
  if (citations.length === 0) return null;
  return (
    <div className="mt-4 pt-3 border-t border-green-500/20">
        <h4 className="font-semibold text-sm text-gray-300 mb-2">Sources:</h4>
        <ol className="list-decimal list-inside space-y-1">
            {citations.map((citation, index) => (
                <li key={index} className="text-sm truncate">
                    <a 
                        href={citation.uri} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-green-400 hover:text-green-300 hover:underline transition-colors"
                        title={citation.title}
                    >
                        {citation.title || new URL(citation.uri).hostname}
                    </a>
                </li>
            ))}
        </ol>
    </div>
  );
};

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  const sanitizedHtml = (content: string) => {
    const rawMarkup = marked.parse(content, { gfm: true, breaks: true });
    return { __html: rawMarkup as string };
  };

  return (
    <div className={`flex items-start gap-3 animate-pop-in ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${isUser ? 'bg-blue-500/10 border-blue-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
        {isUser ? <UserIcon className="w-6 h-6 text-blue-400" /> : <BotIcon className="w-6 h-6 text-green-400" />}
      </div>
      <div className={`glass-bubble rounded-lg p-3 max-w-lg lg:max-w-2xl ${isUser ? 'border-blue-500/20' : 'border-green-500/20'}`}>
          <div className="prose prose-invert prose-p:my-2 prose-headings:my-3 max-w-none prose-pre:bg-black/20 prose-pre:border prose-pre:border-green-500/20">
          {message.parts.map((part, index) => {
              if (part.type === 'text') {
              return <div key={index} dangerouslySetInnerHTML={sanitizedHtml(part.content)} />;
              }
              if (part.type === 'image') {
              return <img key={index} src={part.content} alt="Content" className="my-2 rounded-md max-w-full h-auto border border-green-500/20" />;
              }
              if (part.type === 'citation') {
                  return <CitationView key={index} citations={part.citations} />;
              }
              return null;
          })}
          </div>
      </div>
    </div>
  );
};