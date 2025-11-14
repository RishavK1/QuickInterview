import { Message } from '@/types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function* streamGeminiResponse(
  messages: Message[],
  apiKey: string,
  model: string = 'gemini-2.0-flash-exp'
): AsyncGenerator<string, void, unknown> {
  const url = `${GEMINI_API_URL}/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;

  // Convert messages to Gemini format
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

  const systemInstruction = messages.find(m => m.role === 'system')?.content;

  const requestBody: any = {
    contents,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      let errorMessage = 'Failed to get response from Gemini';
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch (e) {
        // Use default error message
      }
      
      throw new Error(errorMessage);
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
        
        const dataPrefix = 'data: ';
        if (!line.startsWith(dataPrefix)) continue;
        
        try {
          const jsonStr = line.slice(dataPrefix.length);
          const json = JSON.parse(jsonStr);
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (text) {
            yield text;
          }
        } catch (e) {
          // Skip invalid JSON lines
          console.warn('Failed to parse SSE line:', line);
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      const dataPrefix = 'data: ';
      if (buffer.startsWith(dataPrefix)) {
        try {
          const jsonStr = buffer.slice(dataPrefix.length);
          const json = JSON.parse(jsonStr);
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            yield text;
          }
        } catch (e) {
          // Ignore
        }
      }
    }
  } catch (error) {
    console.error('Gemini streaming error:', error);
    throw error;
  }
}