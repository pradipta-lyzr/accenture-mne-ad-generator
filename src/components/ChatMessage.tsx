import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { User, Bot, Clock } from 'lucide-react';
import type { Message } from '../types/chat';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAgentBadgeColor = (agentUsed?: string) => {
    switch (agentUsed) {
      case 'brainstormer':
        return 'bg-purple-100 text-purple-800';
      case 'post_generator':
        return 'bg-blue-100 text-blue-800';
      case 'compliance_check':
        return 'bg-red-100 text-red-800';
      case 'image_description':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAgentName = (agentUsed?: string) => {
    switch (agentUsed) {
      case 'brainstormer':
        return 'Brainstormer';
      case 'post_generator':
        return 'Post Generator';
      case 'compliance_check':
        return 'Compliance Check';
      case 'image_description':
        return 'Image Generator';
      default:
        return 'Assistant';
    }
  };

  return (
    <div className={`flex gap-3 p-4 ${message.sender === 'user' ? 'bg-blue-50' : 'bg-white'}`}>
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          message.sender === 'user' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-600'
        }`}>
          {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-gray-900">
            {message.sender === 'user' ? 'You' : getAgentName(message.agentUsed)}
          </span>
          
          {message.agentUsed && message.sender === 'assistant' && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAgentBadgeColor(message.agentUsed)}`}>
              {getAgentName(message.agentUsed)}
            </span>
          )}
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock size={12} />
            {formatTime(message.timestamp)}
          </div>
        </div>
        
        <div className="text-gray-800">
          {message.sender === 'user' ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  code: ({ node, inline, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-md"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        {message.isTyping && (
          <div className="flex items-center gap-1 mt-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm text-gray-500 ml-2">Thinking...</span>
          </div>
        )}
      </div>
    </div>
  );
}