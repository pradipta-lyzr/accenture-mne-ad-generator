import { useCallback, useEffect } from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import ArtifactsPanel from './components/ArtifactsPanel';
import AdGeneratorAPI from './services/api';
import { updateUrlWithSessionId, getSessionIdFromUrl, removeSessionIdFromUrl } from './utils/urlParams';
import type { ChatThread, Message, Artifact } from './types/chat';

function AppContent() {
  const { state, dispatch } = useChat();

  // Initialize session from URL on app load
  useEffect(() => {
    const urlSessionId = getSessionIdFromUrl();
    if (urlSessionId && !state.currentThread) {
      // If there's a session ID in URL but no current thread, we could potentially restore the session
      // For now, we'll just keep the URL param for when a thread is created
    }
  }, [state.currentThread]);

  const createNewThread = useCallback(() => {
    // Clear any existing session ID from URL when creating new thread
    removeSessionIdFromUrl();
    
    const newThread: ChatThread = {
      id: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
    };

    dispatch({ type: 'ADD_THREAD', payload: newThread });
  }, [dispatch]);

  const selectThread = useCallback((thread: ChatThread) => {
    dispatch({ type: 'SET_CURRENT_THREAD', payload: thread });
    
    // Update URL with session ID if thread has one
    if (thread.sessionId) {
      updateUrlWithSessionId(thread.sessionId);
    } else {
      removeSessionIdFromUrl();
    }
  }, [dispatch]);

  const sendMessage = useCallback(async (messageContent: string, final: boolean = false) => {
    if (!state.currentThread) return;

    // Check if this is the first message BEFORE adding the new message
    const isFirstMessage = state.currentThread.messages.length === 0;

    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: messageContent,
      sender: 'user',
      timestamp: new Date(),
    };

    // Add user message
    dispatch({
      type: 'ADD_MESSAGE',
      payload: { threadId: state.currentThread.id, message: userMessage },
    });

    // Update thread title if it's the first message
    if (isFirstMessage) {
      const title = messageContent.length > 30 
        ? messageContent.substring(0, 30) + '...' 
        : messageContent;
      
      dispatch({
        type: 'UPDATE_THREAD',
        payload: { threadId: state.currentThread.id, updates: { title } },
      });
    }

    // Add typing indicator
    const typingMessage: Message = {
      id: `typing_${Date.now()}`,
      content: '',
      sender: 'assistant',
      timestamp: new Date(),
      isTyping: true,
    };

    dispatch({
      type: 'ADD_MESSAGE',
      payload: { threadId: state.currentThread.id, message: typingMessage },
    });

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Send message to API with proper session ID logic:
      // - First message in thread: don't send session_id (undefined)
      // - Subsequent messages: use the session_id from thread
      const sessionIdToSend = isFirstMessage ? undefined : state.currentThread.sessionId;
      
      const response = await AdGeneratorAPI.sendMessage(
        messageContent,
        sessionIdToSend,
        undefined, // feedback
        final,
        state.userId
      );

      // Remove typing indicator
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          threadId: state.currentThread.id,
          messageId: typingMessage.id,
          updates: { isTyping: false },
        },
      });

      if (response.success) {
        // Update thread with session ID if this was the first message
        if (!state.currentThread.sessionId && response.session_id) {
          dispatch({
            type: 'UPDATE_THREAD',
            payload: {
              threadId: state.currentThread.id,
              updates: { sessionId: response.session_id },
            },
          });
          
          // Update URL with the new session ID
          updateUrlWithSessionId(response.session_id);
        }

        // Handle AdGenerationResponse (always from generate endpoint now)
        let assistantContent: string;
        let agentUsed: string | undefined;
        let stepName: string | undefined;

        // Always AdGenerationResponse - only show generated ad content in chat
        let chatContent = '';
        
        // Show generated post content
        if (response.generated_post) {
          chatContent = response.generated_post;
        } else if (response.enhanced_prompt) {
          chatContent = response.enhanced_prompt;
        } else {
          chatContent = 'Ad generation completed.';
        }
        
        // If image was generated (final=true), show it along with the content
        if (response.generated_image && response.generated_image.success) {
          const imageUrl = response.generated_image.image_url || response.generated_image.url || response.generated_image.data?.[0]?.url;
          if (imageUrl) {
            chatContent += `\n\n![Generated Image](${imageUrl})`;
          }
        }
        
        assistantContent = chatContent;
        agentUsed = 'ad_generator';
        stepName = 'generate_ad';

        // Add assistant response
        const assistantMessage: Message = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: assistantContent,
          sender: 'assistant',
          timestamp: new Date(),
          agentUsed,
          stepName,
        };

        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            threadId: state.currentThread.id,
            messageId: typingMessage.id,
            updates: {
              id: assistantMessage.id,
              content: assistantMessage.content,
              agentUsed: assistantMessage.agentUsed,
              stepName: assistantMessage.stepName,
              isTyping: false,
            },
          },
        });

        // Create artifacts from AdGenerationResponse - ALL response fields go to artifacts
        const artifacts: Artifact[] = [];
        
        // Enhanced prompt always goes to artifacts
        if (response.enhanced_prompt) {
          artifacts.push({
            id: `artifact_prompt_${Date.now()}`,
            type: 'prompt',
            title: 'Enhanced Prompt',
            content: response.enhanced_prompt,
            timestamp: new Date(),
            sessionId: response.session_id,
            messageId: assistantMessage.id,
          });
        }

        // Generated post goes to artifacts (it's also shown in chat)
        if (response.generated_post) {
          artifacts.push({
            id: `artifact_post_${Date.now()}`,
            type: 'post',
            title: 'Generated Ad Content',
            content: response.generated_post,
            timestamp: new Date(),
            sessionId: response.session_id,
            messageId: assistantMessage.id,
          });
        }

        // Compliance check goes to artifacts
        if (response.compliance_check) {
          artifacts.push({
            id: `artifact_compliance_${Date.now()}`,
            type: 'compliance',
            title: 'Compliance Check',
            content: response.compliance_check,
            timestamp: new Date(),
            sessionId: response.session_id,
            messageId: assistantMessage.id,
          });
        }

        // Image prompt goes to artifacts
        if (response.image_prompt) {
          artifacts.push({
            id: `artifact_image_${Date.now()}`,
            type: 'image',
            title: 'Image Prompt',
            content: response.image_prompt,
            timestamp: new Date(),
            sessionId: response.session_id,
            messageId: assistantMessage.id,
          });
        }

        // If image was generated, add it to artifacts too (but it's also shown in chat)
        if (response.generated_image && response.generated_image.success) {
          const imageUrl = response.generated_image.image_url || response.generated_image.url || response.generated_image.data?.[0]?.url;
          if (imageUrl) {
            artifacts.push({
              id: `artifact_image_result_${Date.now()}`,
              type: 'image',
              title: 'Generated Image',
              content: `![Generated Image](${imageUrl})\n\n**Image URL:** ${imageUrl}`,
              timestamp: new Date(),
              sessionId: response.session_id,
              messageId: assistantMessage.id,
            });
          }
        }

        // Add artifacts to state
        artifacts.forEach(artifact => {
          dispatch({ type: 'ADD_ARTIFACT', payload: artifact });
        });

      } else {
        // Handle error
        const errorMessage: Message = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: `Error: ${response.error || 'Unknown error occurred'}`,
          sender: 'assistant',
          timestamp: new Date(),
        };

        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            threadId: state.currentThread.id,
            messageId: typingMessage.id,
            updates: {
              id: errorMessage.id,
              content: errorMessage.content,
              isTyping: false,
            },
          },
        });

        dispatch({
          type: 'UPDATE_THREAD',
          payload: { threadId: state.currentThread.id, updates: { status: 'error' } },
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove typing indicator and show error
      const errorMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
      };

      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          threadId: state.currentThread.id,
          messageId: typingMessage.id,
          updates: {
            id: errorMessage.id,
            content: errorMessage.content,
            isTyping: false,
          },
        },
      });

      dispatch({
        type: 'UPDATE_THREAD',
        payload: { threadId: state.currentThread.id, updates: { status: 'error' } },
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentThread, state.userId, dispatch]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        threads={state.threads}
        currentThread={state.currentThread}
        onSelectThread={selectThread}
        onNewThread={createNewThread}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex">
        <div className="flex-1">
          <ChatInterface
            currentThread={state.currentThread}
            onSendMessage={sendMessage}
            isLoading={state.isLoading}
          />
        </div>

        {/* Artifacts Panel */}
        <div className="w-96 border-l border-gray-200 bg-white">
          <ArtifactsPanel
            artifacts={state.artifacts}
            sessionId={state.currentThread?.sessionId}
          />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

export default App;