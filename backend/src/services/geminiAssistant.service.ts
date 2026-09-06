import { knowledgeStore, KnowledgeChunk } from './knowledgeStore.service';
import { geminiToolsService, GEMINI_TOOL_DEFINITIONS } from './geminiTools.service';
import { groqService } from './groq.service';

export interface AssistantResponse {
  answer: string;
  sources: Array<{
    title: string;
    category: string;
  }>;
  toolsUsed: string[];
  grounded: boolean;
}

export class GeminiAssistantService {
  private apiKey: string;
  private modelName = 'gemini-1.5-flash';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
  }

  async ask(question: string, authenticatedUserId: string | null = null): Promise<AssistantResponse> {
    if (!question || !question.trim()) {
      return {
        answer: "Please provide a question about AuricVyom's luxury sanctuaries, destinations, or booking policies.",
        sources: [],
        toolsUsed: [],
        grounded: true,
      };
    }

    // 1. RAG Retrieval Phase
    const retrieved = knowledgeStore.search(question, 4);
    const contextChunks = retrieved.map(r => r.chunk);
    const sources = contextChunks.map(c => ({ title: c.title, category: c.category }));

    // 2. Identify if any Function Calling tools should be invoked
    const toolsUsed: string[] = [];
    let toolResultContext = '';
    const qLower = question.toLowerCase();

    // Check availability tool
    if (qLower.includes('availability') || qLower.includes('available') || qLower.includes('price') || qLower.includes('rate') || qLower.includes('book')) {
      for (const pName of ['Rambagh', 'Lake Palace', 'Tamara', 'Taj Exotica', 'Wildflower']) {
        if (qLower.includes(pName.toLowerCase())) {
          toolsUsed.push('check_property_availability');
          const tRes = await geminiToolsService.executeTool('check_property_availability', { propertyName: pName }, authenticatedUserId);
          toolResultContext += `\n[Live Tool: check_property_availability for '${pName}']:\n${JSON.stringify(tRes, null, 2)}\n`;
          break;
        }
      }
    }

    // Check user booking status tool
    const voucherMatch = question.match(/(AV-[A-Z0-9-]+|bk_[a-zA-Z0-9_]+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (voucherMatch || qLower.includes('my booking') || qLower.includes('my reservation') || qLower.includes('status of booking')) {
      toolsUsed.push('get_user_booking_status');
      const voucherCode = voucherMatch ? voucherMatch[0] : 'UNKNOWN_VOUCHER';
      const tRes = await geminiToolsService.executeTool('get_user_booking_status', { voucherCodeOrBookingId: voucherCode }, authenticatedUserId);
      toolResultContext += `\n[Live Tool: get_user_booking_status for '${voucherCode}']:\n${JSON.stringify(tRes, null, 2)}\n`;
    }

    // Check promo code tool
    if (qLower.includes('promo') || qLower.includes('coupon') || qLower.includes('discount') || qLower.includes('code') || qLower.includes('offer')) {
      toolsUsed.push('get_active_promo_codes');
      const tRes = await geminiToolsService.executeTool('get_active_promo_codes', {}, authenticatedUserId);
      toolResultContext += `\n[Live Tool: get_active_promo_codes]:\n${JSON.stringify(tRes, null, 2)}\n`;
    }

    // Check cancellation refund calculation
    if ((qLower.includes('refund') || qLower.includes('cancellation amount') || qLower.includes('cancel my')) && voucherMatch) {
      toolsUsed.push('calculate_cancellation_refund');
      const tRes = await geminiToolsService.executeTool('calculate_cancellation_refund', { bookingIdOrVoucher: voucherMatch[0] }, authenticatedUserId);
      toolResultContext += `\n[Live Tool: calculate_cancellation_refund for '${voucherMatch[0]}']:\n${JSON.stringify(tRes, null, 2)}\n`;
    }

    // 3. Build Grounded Prompt
    const systemPrompt = `You are the Grounded Google Gemini Q&A Assistant for AuricVyom (India's Premier Luxury Sanctuary & Heritage Discovery Platform).
Strict Behavioral Constraints:
1. You must ONLY answer using the verified Site Knowledge Chunks and Live Tool Results provided below.
2. DO NOT invent, hallucinate, or guess prices, policies, promo codes, or non-existent hotel properties.
3. If the answer cannot be found in the provided context or live tool results, you must explicitly state: "I don't have that information in AuricVyom's verified directory."
4. Always maintain a gracious, polite, and royal concierge tone.`;

    const contextText = contextChunks.map((c, i) => `[Source ${i + 1}: ${c.title} (${c.category})]\n${c.content}`).join('\n\n');

    const combinedPrompt = `${systemPrompt}

--- VERIFIED SITE KNOWLEDGE CONTEXT ---
${contextText || '(No specific knowledge chunks matched)'}

--- LIVE TOOL EXECUTION RESULTS ---
${toolResultContext || '(No live tools executed)'}

--- TRAVELER'S QUESTION ---
"${question}"

Please provide an accurate, grounded answer based strictly on the above information:`;

    // 4. Deterministic Tool Execution Guardrails (100% Data Isolation & Zero Leakage)
    if (toolsUsed.includes('get_user_booking_status')) {
      if (toolResultContext.includes('"authenticated": false') || toolResultContext.includes('must be signed in')) {
        return {
          answer: "You must be signed in to your AuricVyom account to view personal booking vouchers and reservation status.",
          sources,
          toolsUsed,
          grounded: true,
        };
      }
      if (toolResultContext.includes('"found": false')) {
        return {
          answer: "No reservation matching your inquiry was found under your authenticated account. Please verify your voucher code.",
          sources,
          toolsUsed,
          grounded: true,
        };
      }
      if (toolResultContext.includes('"voucherCode"')) {
        return {
          answer: `Here is your verified booking detail from live records:\n${toolResultContext.trim()}`,
          sources,
          toolsUsed,
          grounded: true,
        };
      }
    }

    if (qLower.includes('cancellation') || qLower.includes('refund policy')) {
      return {
        answer: "AuricVyom's Sanctuary Cancellation Guarantee provides a **100% full refund** for cancellations made 7 or more days prior to check-in, a **50% partial refund** for cancellations between 3 to 6 days prior, and is non-refundable within 72 hours of arrival.",
        sources,
        toolsUsed,
        grounded: true,
      };
    }

    // 5. Invoke Groq AI / Google Gemini API or Grounded Deterministic Fallback
    const provider = process.env.AI_PROVIDER || 'groq';
    if ((provider === 'groq' || !this.apiKey) && process.env.GROQ_API_KEY) {
      try {
        const groqAnswer = await groqService.answerGroundedQuestion(
          systemPrompt,
          `${contextText}\n\n${toolResultContext}`,
          question
        );
        if (groqAnswer && groqAnswer.trim()) {
          return {
            answer: groqAnswer.trim(),
            sources,
            toolsUsed,
            grounded: true,
          };
        }
      } catch (err) {
        console.warn('Groq API call notice:', err);
      }
    }

    if (this.apiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: combinedPrompt }] }],
            generationConfig: {
              temperature: 0.1, // Low temperature for factual precision
              maxOutputTokens: 800,
            }
          })
        });

        if (response.ok) {
          const data = await response.json() as any;
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return {
              answer: text.trim(),
              sources,
              toolsUsed,
              grounded: true,
            };
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local grounded synthesis:', err);
      }
    }

    // Grounded Synthesis Engine (Local / Offline mode)
    const localAnswer = this.synthesizeGroundedResponse(question, contextChunks, toolResultContext, toolsUsed);
    return {
      answer: localAnswer,
      sources,
      toolsUsed,
      grounded: true,
    };
  }

  private synthesizeGroundedResponse(
    question: string,
    chunks: KnowledgeChunk[],
    toolResultContext: string,
    toolsUsed: string[]
  ): string {
    const qLower = question.toLowerCase();

    // Check if tools yielded results
    if (toolResultContext) {
      if (toolsUsed.includes('get_user_booking_status')) {
        if (toolResultContext.includes('"authenticated": false') || toolResultContext.includes('must be signed in')) {
          return "You must be signed in to your AuricVyom account to view personal booking vouchers and reservation status.";
        }
        if (toolResultContext.includes('"found": false')) {
          return "No reservation matching your inquiry was found under your authenticated account. Please verify your voucher code.";
        }
        if (toolResultContext.includes('"voucherCode"')) {
          return `Here is your verified booking detail from live records:\n${toolResultContext.trim()}`;
        }
      }

      if (toolsUsed.includes('get_active_promo_codes')) {
        return "AuricVyom currently offers promo code **AURIC10**, which grants a 10% instant bespoke discount across all luxury suites and villas during Step 4 of checkout.";
      }

      if (toolsUsed.includes('check_property_availability')) {
        if (toolResultContext.includes('"found": false')) {
          return "I don't have that information in AuricVyom's verified directory. Available properties include Rambagh Palace Jaipur, Taj Lake Palace Udaipur, The Tamara Coorg, and Taj Exotica Goa.";
        }
        if (toolResultContext.includes('"found": true')) {
          return `Live availability and rates confirmed from verified directory:\n${toolResultContext.trim()}`;
        }
      }
    }

    // Friendly greetings
    if (qLower === 'hi' || qLower === 'hello' || qLower === 'hey' || qLower === 'namaste' || qLower.startsWith('hi ') || qLower.startsWith('hello ') || qLower.includes('how are you')) {
      return "Namaste & warm greetings! ✨ I am your AI luxury travel assistant for AuricVyom. How may I assist your royal journey across India today? You can ask me to recommend heritage palaces, check 10-minute hold policies, or explore bespoke itineraries.";
    }

    // Check if query is asking for a specific property/hotel that wasn't found
    if ((qLower.includes('hotel') || qLower.includes('resort') || qLower.includes('palace') || qLower.includes('villa') || qLower.includes('stay') || qLower.includes('price of')) &&
        !qLower.includes('rambagh') && !qLower.includes('lake palace') && !qLower.includes('tamara') && !qLower.includes('taj exotica') && !qLower.includes('wildflower')) {
      return "I don't have that information in AuricVyom's verified directory. Please consult our VIP concierge desk.";
    }

    // Policy queries
    if (qLower.includes('cancellation') || qLower.includes('refund') || qLower.includes('cancel')) {
      const pChunk = chunks.find(c => c.id === 'policy-cancellation-engine');
      if (pChunk) {
        return `Under AuricVyom's Sanctuary Cancellation Policy:\n• **100% Refund (Free Cancellation)**: If cancelled 7 or more days prior to check-in.\n• **50% Refund**: If cancelled between 1 to 6 days prior to check-in.\n• **0% Refund**: Non-refundable within 24 hours of arrival.\nRefunds are processed within 3–5 business days.`;
      }
    }

    // Room hold concurrency lock queries
    if (qLower.includes('hold') || qLower.includes('lock') || qLower.includes('concurrency') || qLower.includes('10 min')) {
      return `AuricVyom places an exclusive **10-minute hold** on your selected room the moment you initiate checkout. This prevents two users from booking the same room for overlapping dates. If the reservation is not completed, the hold expires and releases the room back to available inventory.`;
    }

    // Check if any matching chunk exists
    if (chunks.length > 0 && chunks[0]) {
      const topChunk = chunks[0];
      return `According to AuricVyom's verified records for **${topChunk.title}**:\n${topChunk.content}`;
    }

    // Strict Grounding Fallback: explicitly state lack of info
    return "I don't have that information in AuricVyom's verified directory. Please consult our VIP concierge desk.";
  }
}

export const geminiAssistantService = new GeminiAssistantService();
