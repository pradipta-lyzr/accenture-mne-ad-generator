export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  agentUsed?: string;
  stepName?: string;
  isTyping?: boolean;
}

export interface ChatThread {
  id: string;
  sessionId?: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'completed' | 'error';
}

export interface Artifact {
  id: string;
  type: 'prompt' | 'post' | 'compliance' | 'image';
  title: string;
  content: string;
  timestamp: Date;
  sessionId: string;
  messageId: string;
}

export interface AppState {
  currentThread: ChatThread | null;
  threads: ChatThread[];
  artifacts: Artifact[];
  isLoading: boolean;
  userId: string;
}