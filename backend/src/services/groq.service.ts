// AURICVYOM — GROQ AI HIGH-SPEED INFERENCE SERVICE
import { Groq } from 'groq-sdk';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  reasoningEffort?: 'low' | 'medium' | 'high';
}

class GroqService {
  private client: Groq | null = null;
  private defaultModel: string;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY || '';
    this.defaultModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

    if (apiKey) {
      try {
        this.client = new Groq({ apiKey });
      } catch (err) {
        console.warn('[GroqService] Failed to initialize Groq client:', err);
      }
    }
  }

  // Get initialized Groq client
  public getClient(): Groq | null {
    if (!this.client && process.env.GROQ_API_KEY) {
      this.client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return this.client;
  }

  // Generate Chat Completion (Non-Streaming)
  public async createChatCompletion(
    messages: ChatMessage[],
    options: GroqCompletionOptions = {}
  ): Promise<string> {
    const client = this.getClient();
    if (!client) {
      throw new Error('Groq client is not initialized. Please set GROQ_API_KEY.');
    }

    const model = options.model || this.defaultModel;
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens ?? 2048;

    try {
      const response = await client.chat.completions.create({
        messages,
        model,
        temperature,
        max_completion_tokens: maxTokens,
        top_p: options.topP ?? 1,
        stream: false,
      });

      return response.choices[0]?.message?.content || '';
    } catch (err: any) {
      console.warn(`[GroqService] Error with model ${model}, attempting fallback:`, err.message);
      
      // Fallback to openai/gpt-oss-20b or qwen/qwen3.8-27b if needed
      if (model !== 'openai/gpt-oss-20b') {
        const fallbackRes = await client.chat.completions.create({
          messages,
          model: 'openai/gpt-oss-20b',
          temperature,
          max_completion_tokens: maxTokens,
          stream: false,
        });
        return fallbackRes.choices[0]?.message?.content || '';
      }
      throw err;
    }
  }

  // Stream Chat Completion
  public async *streamChatCompletion(
    messages: ChatMessage[],
    options: GroqCompletionOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    const client = this.getClient();
    if (!client) {
      throw new Error('Groq client is not initialized. Please set GROQ_API_KEY.');
    }

    const model = options.model || this.defaultModel;
    const temperature = options.temperature ?? 1;
    const maxTokens = options.maxTokens ?? 2048;

    const stream = await client.chat.completions.create({
      messages,
      model,
      temperature,
      max_completion_tokens: maxTokens,
      top_p: options.topP ?? 1,
      stream: true,
      reasoning_effort: options.reasoningEffort ?? 'medium',
      stop: null,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        yield delta;
      }
    }
  }

  // Answer Grounded Assistant Question
  public async answerGroundedQuestion(
    systemPrompt: string,
    context: string,
    question: string
  ): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `${systemPrompt}\n\n--- VERIFIED KNOWLEDGE CONTEXT ---\n${context}`
      },
      {
        role: 'user',
        content: question
      }
    ];

    return this.createChatCompletion(messages, {
      temperature: 0.3,
      maxTokens: 1024,
    });
  }
}

export const groqService = new GroqService();
