import React, { useState, useRef, useCallback } from 'react';
// Fix: Add .tsx extension to import to resolve module.
import { PaperClipIcon, SendIcon, XCircleIcon } from './Icons.tsx';

interface ChatInputProps {
  onSend: (text: string, image: File | null) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend, 
  isLoading,
}) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSend = useCallback(() => {
    if ((text.trim() || image) && !isLoading) {
      onSend(text.trim(), image);
      setText('');
      removeImage();
    }
  }, [text, image, isLoading, onSend]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };
  
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  return (
    <div className="bg-black/20 p-4 border-t border-green-500/20 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto">
        {imagePreview && (
          <div className="mb-2 relative w-24 h-24 rounded-lg overflow-hidden border border-green-500/30">
            <img src={imagePreview} alt="Image preview" className="w-full h-full object-cover" />
            <button
              onClick={removeImage}
              className="absolute top-1 right-1 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors"
              aria-label="Remove image"
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex items-end glass-bubble rounded-lg p-2 border border-green-500/30 focus-within:border-green-500/80 transition-all">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={"Type your message or upload an image..."}
            className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none px-2 max-h-40"
            rows={1}
            disabled={isLoading}
          />
          <div className="flex items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="p-2 text-gray-300 hover:text-green-400 disabled:text-gray-600 transition-colors neon-glow-button"
              aria-label="Attach image"
            >
              <PaperClipIcon className="w-6 h-6" />
            </button>
            <button
              onClick={handleSend}
              disabled={isLoading || (!text.trim() && !image)}
              className="p-2 ml-2 rounded-full bg-green-500 text-black disabled:bg-green-500/50 hover:bg-green-400 transition-colors neon-glow-button"
              aria-label="Send message"
            >
              <SendIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};