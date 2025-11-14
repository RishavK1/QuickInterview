import { Message, AIProvider } from '@/types';
import { streamGeminiResponse } from './geminiService';

export async function* streamAIResponse(
  messages: Message[],
  provider: AIProvider,
  apiKey: string,
  model?: string
): AsyncGenerator<string, void, unknown> {
  switch (provider) {
    case 'gemini':
      yield* streamGeminiResponse(messages, apiKey, model || 'gemini-2.5-flash');
      break;
    
    case 'openai':
      // OpenAI implementation
      yield* streamOpenAIResponse(messages, apiKey, model || 'gpt-4o-mini');
      break;
    
    case 'claude':
      // Claude implementation
      yield* streamClaudeResponse(messages, apiKey, model || 'claude-3-5-sonnet-20241022');
      break;
    
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

async function* streamOpenAIResponse(
  messages: Message[],
  apiKey: string,
  model: string
): AsyncGenerator<string, void, unknown> {
  const url = 'https://api.openai.com/v1/chat/completions';

  const openAIMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  const requestBody = {
    model,
    messages: openAIMessages,
    temperature: 0.7,
    max_tokens: 2048,
    stream: true,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get response from OpenAI');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
        if (!line.startsWith('data: ')) continue;
        
        try {
          const json = JSON.parse(line.slice(6));
          const delta = json.choices?.[0]?.delta?.content;
          
          if (delta) {
            yield delta;
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      }
    }
  } catch (error) {
    console.error('OpenAI streaming error:', error);
    throw error;
  }
}

async function* streamClaudeResponse(
  messages: Message[],
  apiKey: string,
  model: string
): AsyncGenerator<string, void, unknown> {
  const url = 'https://api.anthropic.com/v1/messages';

  // Separate system message
  const systemMessage = messages.find(m => m.role === 'system')?.content || 
    'You are an expert interview coach. Provide clear, concise, and helpful answers to interview questions.';

  const claudeMessages = messages
    .filter(m => m.role !== 'system')
    .map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

  const requestBody = {
    model,
    messages: claudeMessages,
    system: systemMessage,
    max_tokens: 2048,
    temperature: 0.7,
    stream: true,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get response from Claude');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '' || !line.startsWith('data: ')) continue;
        
        try {
          const json = JSON.parse(line.slice(6));
          
          if (json.type === 'content_block_delta' && json.delta?.text) {
            yield json.delta.text;
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      }
    }
  } catch (error) {
    console.error('Claude streaming error:', error);
    throw error;
  }
}

export function getDefaultModel(provider: AIProvider): string {
  switch (provider) {
    case 'gemini':
      return 'gemini-2.5-flash';
    case 'openai':
      return 'gpt-4o-mini';
    case 'claude':
      return 'claude-3-5-sonnet-20241022';
    default:
      return 'gemini-2.5-flash';
  }
}