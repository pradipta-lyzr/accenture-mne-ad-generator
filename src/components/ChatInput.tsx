import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Image } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string, final?: boolean) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, isLoading, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [final, setFinal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim(), final);
      setMessage('');
      setFinal(false); // Reset final toggle after sending
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Final toggle - only show when there's content */}
      {message.trim() && (
        <div className="mb-3 flex items-center gap-2 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={final}
              onChange={(e) => setFinal(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={disabled || isLoading}
            />
            <Image size={16} className="text-gray-600" />
            <span className="text-gray-700">
              Generate image (final version)
            </span>
          </label>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me to help you create an ad, enhance content, or check compliance..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 custom-scrollbar"
            rows={1}
            disabled={disabled || isLoading}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || isLoading || disabled}
          className={`p-3 rounded-lg transition-colors duration-200 flex items-center justify-center ${
            final 
              ? 'bg-green-500 hover:bg-green-600 disabled:bg-gray-300' 
              : 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300'
          } disabled:cursor-not-allowed text-white`}
          style={{ minWidth: '48px', height: '48px' }}
          title={final ? 'Send with image generation' : 'Send message'}
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : final ? (
            <Image size={20} />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
      
      <div className="mt-2 text-xs text-gray-500 text-center">
        Enter to send • Shift+Enter for new line {final && '• 🎨 Image generation enabled'}
      </div>
    </div>
  );
}