import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatHistorySidebar } from './components/ChatHistorySidebar.tsx';
import { ChatInput } from './components/ChatInput.tsx';
import { ChatMessageBubble } from './components/ChatMessageBubble.tsx';
import { Header } from './components/Header.tsx';
import { BotIcon } from './components/Icons.tsx';
import { sendMessageToGemini } from './services/geminiService.ts';
import type { ChatHistory, ChatMessage, ChatSession } from './types.ts';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const App: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatHistory>({});
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Load chat history from local storage on initial render
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('chatHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setChatHistory(parsedHistory);
        const historyKeys = Object.keys(parsedHistory);
        const lastChatId = historyKeys.length > 0 ? historyKeys[historyKeys.length - 1] : null;
        setCurrentChatId(lastChatId);
      } else {
        // Create a new chat if no history exists
        handleNewChat();
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      handleNewChat(); // Start fresh if loading fails
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save chat history to local storage whenever it changes
  useEffect(() => {
    if (Object.keys(chatHistory).length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Scroll to bottom of chat on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, currentChatId]);

  const handleNewChat = () => {
    const newId = `chat_${Date.now()}`;
    const newChatSession: ChatSession = {
      id: newId,
      title: 'New Chat',
      messages: [],
    };
    setChatHistory(prev => ({ ...prev, [newId]: newChatSession }));
    setCurrentChatId(newId);
  };

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
  };

  const handleDeleteChat = (id: string) => {
    const newHistory = { ...chatHistory };
    delete newHistory[id];
    
    if (currentChatId === id) {
        const remainingIds = Object.keys(newHistory);
        if (remainingIds.length > 0) {
            setCurrentChatId(remainingIds[0]);
        } else {
            const newId = `chat_${Date.now()}`;
            newHistory[newId] = { id: newId, title: 'New Chat', messages: [] };
            setCurrentChatId(newId);
        }
    }
    setChatHistory(newHistory);
  };

  const handleSend = useCallback(async (text: string, image: File | null) => {
    if (!currentChatId || isLoading) return;

    const currentChat = chatHistory[currentChatId];
    if (!currentChat) return;

    const userMessage: ChatMessage = {
      role: 'user',
      parts: [],
    };

    let imageDataUrl: string | null = null;
    if (image) {
      try {
        imageDataUrl = await fileToBase64(image);
      } catch (error) {
        console.error("Failed to convert image to base64:", error);
        // Optionally, show an error to the user here
        return;
      }
    }
    
    if(text) userMessage.parts.push({ type: 'text', content: text, citations: [] });
    if(imageDataUrl) {
      userMessage.parts.push({ type: 'image', content: imageDataUrl, citations: [] });
    }

    const updatedMessages = [...currentChat.messages, userMessage];

    setChatHistory(prev => {
      const updatedSession = {
        ...currentChat,
        messages: updatedMessages,
      };
      if (updatedSession.messages.length === 1 && text) {
        updatedSession.title = text.substring(0, 30) + (text.length > 30 ? '...' : '');
      }
      return { ...prev, [currentChatId]: updatedSession };
    });

    setIsLoading(true);

    try {
      const modelMessage = await sendMessageToGemini(updatedMessages);
      
      setChatHistory(prev => {
        const current = prev[currentChatId];
        if (!current) return prev;
        const updatedSession = {
          ...current,
          messages: [...current.messages, modelMessage],
        };
        return { ...prev, [currentChatId]: updatedSession };
      });

    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: ChatMessage = {
        role: 'model',
        parts: [{ type: 'text', content: 'Sorry, something went wrong.', citations: [] }],
      };
       setChatHistory(prev => {
        const current = prev[currentChatId];
        if (!current) return prev;
        const updatedSession = {
          ...current,
          messages: [...current.messages, errorMessage],
        };
        return { ...prev, [currentChatId]: updatedSession };
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentChatId, isLoading, chatHistory]);

  const currentChat = currentChatId ? chatHistory[currentChatId] : null;

  return (
    <div className="flex h-screen bg-black text-gray-200 font-sans futuristic-bg">
      <ChatHistorySidebar
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isOpen={isSidebarOpen}
      />
      <div className="flex-1 flex flex-col relative">
        <Header 
          onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        />
        <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 sidebar-scroll">
            {currentChat?.messages.map((msg, index) => (
                <ChatMessageBubble key={index} message={msg} />
            ))}
            {isLoading && (
                <div className="flex items-start gap-3 animate-pop-in">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border bg-green-500/10 border-green-500/20">
                        <BotIcon className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="glass-bubble rounded-lg p-3 max-w-lg lg:max-w-2xl border-green-500/20 flex items-center justify-center h-[44px]">
                       <div className="animate-pulse flex space-x-2">
                            <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                            <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                            <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                        </div>
                    </div>
                </div>
            )}
        </main>
        <div className="mt-auto">
          <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default App;