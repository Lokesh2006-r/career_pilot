import { GoogleGenAI } from '@google/genai';

let aiClients: GoogleGenAI[] = [];

export function initializeAIClients() {
  // Support both a single key and comma-separated keys
  const keysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  const keys = keysStr.split(',').map(k => k.trim()).filter(k => k.length > 0);
  
  if (keys.length === 0) {
    console.warn("No GEMINI_API_KEY or GEMINI_API_KEYS found in environment variables.");
  }

  aiClients = keys.map(key => new GoogleGenAI({ apiKey: key }));
}

/**
 * Generates content using the Gemini API, with automatic retry and fallback across multiple keys.
 * Handles 429 (Too Many Requests), 503 (Service Unavailable), and quota exhaustion.
 */
export async function generateContentWithFallback(modelOptions: any, maxRetriesPerKey = 2): Promise<any> {
  if (aiClients.length === 0) {
    initializeAIClients();
  }

  if (aiClients.length === 0) {
    throw new Error("No Gemini API keys configured.");
  }

  let lastError: any = null;

  for (let keyIndex = 0; keyIndex < aiClients.length; keyIndex++) {
    const ai = aiClients[keyIndex];
    let attempt = 0;
    
    while (attempt < maxRetriesPerKey) {
      try {
        const response = await ai.models.generateContent(modelOptions);
        return response;
      } catch (error: any) {
        attempt++;
        const msg = error.message || String(error);
        console.warn(`[Gemini API] Key ${keyIndex + 1}/${aiClients.length}, attempt ${attempt} failed: ${msg}`);
        
        lastError = error;
        
        const isRateLimit = msg.includes('429') || 
                            msg.toLowerCase().includes('quota') || 
                            msg.toLowerCase().includes('exhausted');
                            
        const isUnavailable = msg.includes('503') || msg.toLowerCase().includes('unavailable');

        if (isRateLimit && attempt >= maxRetriesPerKey) {
          console.warn(`[Gemini API] Key ${keyIndex + 1} hit rate limits. Falling back to next key...`);
          break; // Move to the next key in the pool
        }
        
        if (attempt < maxRetriesPerKey) {
          // Exponential backoff: 1s, 2s...
          const delay = 1000 * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  }

  throw new Error(`All Gemini API keys failed or rate-limited. Last error: ${lastError?.message || 'Unknown error'}`);
}
