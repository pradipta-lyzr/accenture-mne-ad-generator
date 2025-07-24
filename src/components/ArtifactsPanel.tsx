import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  FileText, 
  CheckCircle, 
  Image, 
  ChevronDown, 
  ChevronRight,
  Copy,
  Check
} from 'lucide-react';
import type { Artifact } from '../types/chat';

interface ArtifactsPanelProps {
  artifacts: Artifact[];
  sessionId?: string;
}

export default function ArtifactsPanel({ artifacts, sessionId }: ArtifactsPanelProps) {
  const [expandedArtifacts, setExpandedArtifacts] = useState<Set<string>>(new Set());
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (artifactId: string) => {
    const newExpanded = new Set(expandedArtifacts);
    if (newExpanded.has(artifactId)) {
      newExpanded.delete(artifactId);
    } else {
      newExpanded.add(artifactId);
    }
    setExpandedArtifacts(newExpanded);
  };

  const copyToClipboard = async (content: string, artifactId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedItems(new Set([...copiedItems, artifactId]));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(artifactId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const getArtifactIcon = (type: Artifact['type']) => {
    switch (type) {
      case 'prompt':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'post':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'compliance':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'image':
        return <Image className="w-4 h-4 text-orange-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getArtifactColor = (type: Artifact['type']) => {
    switch (type) {
      case 'prompt':
        return 'border-purple-200 bg-purple-50';
      case 'post':
        return 'border-blue-200 bg-blue-50';
      case 'compliance':
        return 'border-green-200 bg-green-50';
      case 'image':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  // Filter artifacts for current session
  const sessionArtifacts = sessionId 
    ? artifacts.filter(artifact => artifact.sessionId === sessionId)
    : artifacts;

  const sortedArtifacts = sessionArtifacts.sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );

  if (sortedArtifacts.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Artifacts</h2>
          <p className="text-sm text-gray-500">Generated content will appear here</p>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No artifacts yet</p>
            <p className="text-sm mt-1">Start a conversation to see generated content</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Artifacts</h2>
        <p className="text-sm text-gray-500">{sortedArtifacts.length} items generated</p>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 space-y-4">
          {sortedArtifacts.map((artifact) => {
            const isExpanded = expandedArtifacts.has(artifact.id);
            const isCopied = copiedItems.has(artifact.id);
            
            return (
              <div
                key={artifact.id}
                className={`border rounded-lg overflow-hidden ${getArtifactColor(artifact.type)}`}
              >
                <div
                  className="p-3 cursor-pointer flex items-center justify-between hover:bg-opacity-70 transition-colors"
                  onClick={() => toggleExpanded(artifact.id)}
                >
                  <div className="flex items-center gap-3">
                    {getArtifactIcon(artifact.type)}
                    <div>
                      <h3 className="font-medium text-gray-900">{artifact.title}</h3>
                      <p className="text-xs text-gray-500">
                        {artifact.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(artifact.content, artifact.id);
                      }}
                      className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                      title="Copy to clipboard"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                    
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-white bg-opacity-50">
                    <div className="p-4">
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
                          {artifact.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}