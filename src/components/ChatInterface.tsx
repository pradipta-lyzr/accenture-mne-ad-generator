import { useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import type { ChatThread } from '../types/chat';

interface ChatInterfaceProps {
  currentThread: ChatThread | null;
  onSendMessage: (message: string, final?: boolean) => void;
  isLoading: boolean;
}

export default function ChatInterface({ currentThread, onSendMessage, isLoading }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentThread?.messages]);

  if (!currentThread) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-blue-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to Ad Generator
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            I'm here to help you create amazing ads! I can help you:
          </p>
          
          <div className="grid grid-cols-1 gap-4 text-left">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2">✨ Brainstorm Ideas</h3>
              <p className="text-sm text-purple-700">
                Enhance your initial concepts with creative suggestions
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">📝 Generate Content</h3>
              <p className="text-sm text-blue-700">
                Create compelling ad copy and marketing content
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">✅ Check Compliance</h3>
              <p className="text-sm text-green-700">
                Ensure your content meets advertising guidelines
              </p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-orange-900 mb-2">🎨 Create Visuals</h3>
              <p className="text-sm text-orange-700">
                Generate image descriptions for visual content
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            Start a new conversation to begin creating your ad!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {currentThread.title}
            </h2>
            <p className="text-sm text-gray-500">
              {currentThread.messages.length} messages • {currentThread.status}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              currentThread.status === 'active' ? 'bg-green-500' : 
              currentThread.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-600 capitalize">
              {currentThread.status}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50">
        {currentThread.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Send a message to start the conversation
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {currentThread.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        disabled={currentThread.status === 'error'}
      />
    </div>
  );
}