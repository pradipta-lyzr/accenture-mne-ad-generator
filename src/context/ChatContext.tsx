import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { AppState, ChatThread, Message, Artifact } from '../types/chat';

interface ChatContextType {
  state: AppState;
  dispatch: React.Dispatch<ChatAction>;
}

type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CURRENT_THREAD'; payload: ChatThread | null }
  | { type: 'ADD_THREAD'; payload: ChatThread }
  | { type: 'UPDATE_THREAD'; payload: { threadId: string; updates: Partial<ChatThread> } }
  | { type: 'ADD_MESSAGE'; payload: { threadId: string; message: Message } }
  | { type: 'UPDATE_MESSAGE'; payload: { threadId: string; messageId: string; updates: Partial<Message> } }
  | { type: 'ADD_ARTIFACT'; payload: Artifact }
  | { type: 'SET_THREADS'; payload: ChatThread[] }
  | { type: 'SET_ARTIFACTS'; payload: Artifact[] };

const initialState: AppState = {
  currentThread: null,
  threads: [],
  artifacts: [],
  isLoading: false,
  userId: 'default_user',
};

function chatReducer(state: AppState, action: ChatAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_CURRENT_THREAD':
      return { ...state, currentThread: action.payload };

    case 'ADD_THREAD':
      return {
        ...state,
        threads: [action.payload, ...state.threads],
        currentThread: action.payload,
      };

    case 'UPDATE_THREAD':
      const updatedThreads = state.threads.map(thread =>
        thread.id === action.payload.threadId
          ? { ...thread, ...action.payload.updates }
          : thread
      );
      return {
        ...state,
        threads: updatedThreads,
        currentThread: state.currentThread?.id === action.payload.threadId
          ? { ...state.currentThread, ...action.payload.updates }
          : state.currentThread,
      };

    case 'ADD_MESSAGE':
      const threadsWithNewMessage = state.threads.map(thread =>
        thread.id === action.payload.threadId
          ? {
              ...thread,
              messages: [...thread.messages, action.payload.message],
              updatedAt: new Date(),
            }
          : thread
      );
      return {
        ...state,
        threads: threadsWithNewMessage,
        currentThread: state.currentThread?.id === action.payload.threadId
          ? {
              ...state.currentThread,
              messages: [...state.currentThread.messages, action.payload.message],
              updatedAt: new Date(),
            }
          : state.currentThread,
      };

    case 'UPDATE_MESSAGE':
      const threadsWithUpdatedMessage = state.threads.map(thread =>
        thread.id === action.payload.threadId
          ? {
              ...thread,
              messages: thread.messages.map(msg =>
                msg.id === action.payload.messageId
                  ? { ...msg, ...action.payload.updates }
                  : msg
              ),
            }
          : thread
      );
      return {
        ...state,
        threads: threadsWithUpdatedMessage,
        currentThread: state.currentThread?.id === action.payload.threadId
          ? {
              ...state.currentThread,
              messages: state.currentThread.messages.map(msg =>
                msg.id === action.payload.messageId
                  ? { ...msg, ...action.payload.updates }
                  : msg
              ),
            }
          : state.currentThread,
      };

    case 'ADD_ARTIFACT':
      return {
        ...state,
        artifacts: [action.payload, ...state.artifacts],
      };

    case 'SET_THREADS':
      return { ...state, threads: action.payload };

    case 'SET_ARTIFACTS':
      return { ...state, artifacts: action.payload };

    default:
      return state;
  }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}