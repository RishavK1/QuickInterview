"use client";

import { useState, useEffect, useRef } from "react";
import { Message, ChatSession, AIProvider } from "@/types";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { streamAIResponse } from "@/services/aiProviderService";
import { MicButton } from "@/components/MicButton";
import { ChatBubble } from "@/components/ChatBubble";
import { WelcomeMessage } from "@/components/WelcomeMessage";
import { ChatHistorySidebar } from "@/components/ChatHistorySidebar";
import { SettingsModal } from "@/components/SettingsModal";
import { Settings, AlertCircle, Menu } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const STORAGE_KEYS = {
  SESSIONS: 'quickinterview_sessions',
  CURRENT_SESSION: 'quickinterview_current_session',
  PROVIDER: 'quickinterview_provider',
  API_KEY: 'quickinterview_api_key',
};

const ENHANCED_SYSTEM_PROMPT = `You are an expert technical interview coach specializing in JavaScript, MERN Stack (MongoDB, Express.js, React, Node.js), TypeScript, and Object-Oriented Programming (OOP) concepts.

Your primary goal is to provide SHORT, CONCISE, and PRACTICAL answers optimized for interview scenarios. Follow these guidelines:

1. **Be Brief**: Answers should be 3-5 sentences maximum for definitions, 5-8 sentences for explanations
2. **Structure Clearly**: Use bullet points or numbered lists when explaining multiple concepts
3. **Focus on Key Points**: Highlight what interviewers want to hear
4. **Provide Real Examples**: Include short, practical code snippets when relevant (2-4 lines max)
5. **Cover Interview Favorites**: Emphasize concepts like closures, promises, async/await, React hooks, REST APIs, OOP principles (SOLID, inheritance, polymorphism), design patterns
6. **Explain Trade-offs**: Mention when to use what approach
7. **Use Interview Language**: Frame answers as if preparing for a real technical interview

Topics you excel at:
- JavaScript fundamentals (ES6+, closures, this, prototypes, event loop)
- MERN Stack (MongoDB queries, Express middleware, React components/hooks, Node.js APIs)
- TypeScript (types, interfaces, generics)
- OOP (classes, inheritance, encapsulation, abstraction, polymorphism, SOLID principles)
- Data structures & algorithms basics
- System design fundamentals
- Best practices and common pitfalls

Remember: Keep it SHORT, CLEAR, and INTERVIEW-READY. No lengthy explanations unless specifically asked.`;

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error: speechError,
  } = useSpeechRecognition();

  useEffect(() => {
    const storedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const storedCurrentSession = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    const storedProvider = localStorage.getItem(STORAGE_KEYS.PROVIDER);
    const storedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);

    if (storedSessions) {
      setSessions(JSON.parse(storedSessions));
    }
    if (storedCurrentSession) {
      setCurrentSessionId(storedCurrentSession);
    }
    if (storedProvider) {
      setProvider(storedProvider as AIProvider);
    }
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      setIsSettingsOpen(true);
      toast.info("Welcome! Please configure your API key to get started.");
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, currentSessionId);
    }
  }, [currentSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, currentSessionId]);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const currentMessages = currentSession?.messages || [];

  const addMessage = (sessionId: string, message: Message) => {
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? {
              ...s,
              messages: [...s.messages, message],
              updatedAt: Date.now(),
            }
          : s
      )
    );
  };

  const updateLastMessage = (sessionId: string, content: string) => {
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? {
              ...s,
              messages: s.messages.map((m, i) =>
                i === s.messages.length - 1 ? { ...m, content } : m
              ),
              updatedAt: Date.now(),
            }
          : s
      )
    );
  };

  const deleteMessage = (messageId: string) => {
    if (!currentSessionId) return;
    
    setSessions(prev =>
      prev.map(s =>
        s.id === currentSessionId
          ? {
              ...s,
              messages: s.messages.filter(m => m.id !== messageId),
              updatedAt: Date.now(),
            }
          : s
      )
    );
    toast.success("Message deleted");
  };

  const handleNewSession = () => {
    setCurrentSessionId(null);
    toast.success("New chat started");
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
    toast.success("Chat deleted");
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isGenerating) return;
    
    setError(null);

    if (!apiKey.trim()) {
      setError('Please configure your API key in settings');
      setIsSettingsOpen(true);
      toast.error("API key required. Please configure in settings.");
      return;
    }

    let sessionId = currentSessionId;
    if (!sessionId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setSessions(prev => [...prev, newSession]);
      sessionId = newSession.id;
      setCurrentSessionId(sessionId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    addMessage(sessionId, userMessage);

    setIsGenerating(true);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    addMessage(sessionId, assistantMessage);

    try {
      const session = sessions.find(s => s.id === sessionId);
      const contextMessages = session ? [...session.messages, userMessage] : [userMessage];

      const messagesWithSystem: Message[] = [
        {
          id: 'system',
          role: 'system',
          content: ENHANCED_SYSTEM_PROMPT,
          timestamp: Date.now(),
        },
        ...contextMessages,
      ];

      let fullResponse = '';

      for await (const chunk of streamAIResponse(messagesWithSystem, provider, apiKey)) {
        fullResponse += chunk;
        updateLastMessage(sessionId, fullResponse);
      }

      if (!fullResponse.trim()) {
        throw new Error('No response received from AI');
      }
      
      toast.success("Response received");
    } catch (err) {
      console.error('AI Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI response';
      setError(errorMessage);
      updateLastMessage(sessionId, `Error: ${errorMessage}`);
      toast.error(`AI Error: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStopListening = () => {
    stopListening();
    if (transcript.trim()) {
      handleSendMessage(transcript);
      resetTranscript();
    }
  };

  const handleSaveSettings = (newProvider: AIProvider, newApiKey: string) => {
    setProvider(newProvider);
    setApiKey(newApiKey);
    localStorage.setItem(STORAGE_KEYS.PROVIDER, newProvider);
    localStorage.setItem(STORAGE_KEYS.API_KEY, newApiKey);
    setError(null);
    toast.success("Settings saved successfully");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ChatHistorySidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col w-full max-w-full">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border px-3 sm:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 flex-1">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-accent transition-colors flex-shrink-0"
              aria-label="Open chat history"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-base sm:text-lg font-semibold truncate">QuickInterview AI</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Voice-Powered Interview Coach
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-md hover:bg-accent transition-colors flex-shrink-0"
            aria-label="Open settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
            {currentMessages.length === 0 ? (
              <WelcomeMessage />
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {currentMessages.map((message, index) => (
                  <ChatBubble
                    key={message.id}
                    message={message}
                    onDelete={deleteMessage}
                    isStreaming={
                      isGenerating &&
                      index === currentMessages.length - 1 &&
                      message.role === 'assistant'
                    }
                  />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border safe-bottom">
          <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
            {(error || speechError) && (
              <Alert variant="destructive" className="mb-3 sm:mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error || speechError}</AlertDescription>
              </Alert>
            )}

            {!isSupported && (
              <Alert className="mb-3 sm:mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.
                </AlertDescription>
              </Alert>
            )}

            {transcript && (
              <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-muted rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Listening...</p>
                <p className="text-sm sm:text-base break-words">{transcript}</p>
              </div>
            )}

            <div className="flex justify-center">
              <MicButton
                isListening={isListening}
                onStartListening={startListening}
                onStopListening={handleStopListening}
                disabled={!isSupported || isGenerating}
              />
            </div>

            <p className="text-center text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3 px-4">
              {isListening
                ? 'Tap to stop and send your question'
                : 'Tap the microphone to ask a question'}
            </p>
          </div>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        provider={provider}
        apiKey={apiKey}
        onSave={handleSaveSettings}
      />
    </div>
  );
}