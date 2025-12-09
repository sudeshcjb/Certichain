import { GoogleGenAI } from "@google/genai";
import { Block } from "../types";

// Initialize Gemini
// Note: In a production app, handle API key presence more robustly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeChainSecurity = async (chain: Block[], brokenIndex: number): Promise<string> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    You are a Senior Cryptography Auditor. You are analyzing a blockchain used for academic certificate storage.
    
    Here is the current state of the blockchain (simplified JSON):
    ${JSON.stringify(chain.map(b => ({ idx: b.index, prev: b.previousHash.substring(0,10), hash: b.hash.substring(0,10), data: b.data.studentName })))}
    
    Status: ${brokenIndex === -1 ? "VALID_CHAIN" : `COMPROMISED at Block Index ${brokenIndex}`}.

    Provide a brief, technical executive summary (max 150 words) suitable for a security demo.
    1. If Valid: Explain why SHA-256 and the linked-list structure ensure the data hasn't been tampered with since creation. Mention "Immutable Ledger".
    2. If Compromised: Explain exactly why the chain is broken (e.g., "The hash of Block ${brokenIndex} no longer matches the 'previousHash' stored in Block ${brokenIndex + 1}"). Explain the "Avalanche Effect" where changing one byte invalidates the chain.

    Use Markdown formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text || "Analysis failed.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Unable to connect to Gemini Auditor. Please ensure API Key is valid.";
  }
};

export const explainConcept = async (concept: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Explain the concept of "${concept}" in the context of blockchain security and cryptography. Keep it concise (under 100 words) and use an analogy if possible.`,
        });
        return response.text || "Explanation unavailable.";
    } catch (e) {
        return "Could not fetch explanation.";
    }
}