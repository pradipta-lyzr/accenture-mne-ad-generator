import { Plus, MessageSquare, Clock, User } from 'lucide-react';
import type { ChatThread } from '../types/chat';

interface SidebarProps {
  threads: ChatThread[];
  currentThread: ChatThread | null;
  onSelectThread: (thread: ChatThread) => void;
  onNewThread: () => void;
}

export default function Sidebar({ threads, currentThread, onSelectThread, onNewThread }: SidebarProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getThreadPreview = (thread: ChatThread) => {
    const lastMessage = thread.messages[thread.messages.length - 1];
    if (!lastMessage) return 'New conversation';
    
    const preview = lastMessage.content.substring(0, 60);
    return preview + (lastMessage.content.length > 60 ? '...' : '');
  };

  const getStatusColor = (status: ChatThread['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Ad Generator</h1>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <User size={16} />
            <span>You</span>
          </div>
        </div>
        
        <button
          onClick={onNewThread}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
        >
          <Plus size={16} />
          New Conversation
        </button>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {threads.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No conversations yet</p>
            <p className="text-sm mt-1">Start a new conversation to begin</p>
          </div>
        ) : (
          <div className="p-2">
            {threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread)}
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentThread?.id === thread.id
                    ? 'bg-blue-100 border border-blue-200'
                    : 'bg-white hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 text-sm truncate flex-1">
                    {thread.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getStatusColor(thread.status)}`}>
                    {thread.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {getThreadPreview(thread)}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDate(thread.updatedAt)}
                  </div>
                  <span>{thread.messages.length} messages</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="text-xs text-gray-500 text-center">
          Powered by Lyzr AI Agents
        </div>
      </div>
    </div>
  );
}