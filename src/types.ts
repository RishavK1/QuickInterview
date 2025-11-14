export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export type AIProvider = 'gemini' | 'openai' | 'claude';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

export interface StreamResponse {
  text: string;
  done: boolean;
}
