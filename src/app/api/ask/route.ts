// File: src/app/api/ask/route.ts
// --- Imports ---
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// ✅ Ensure required environment variables are present
const requiredEnv = [
  'GOOGLE_API_KEY',
  'PINECONE_API_KEY',
  'PINECONE_HOST_URL',
  'OPENAI_API_KEY',
];

// Check for missing environment variables and throw error if any are missing
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

// Initialize Google Generative AI and OpenAI clients
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// --- Main API Handler ---
export async function POST(req: NextRequest) {
  try {
    // Parse the incoming request body
    const body = await req.json();
    const question = body.question as string;

    // ✅ Guardrails for sensitive inputs
const sensitiveKeywords = ['bank account', 'ssn', 'password', 'legal', 'lawsuit', 'refund', 'payment', 'personal data', 'social security number'];
const toxicPatterns = /(fuck|shit|bitch|damn|idiot|stupid)/i;

if (sensitiveKeywords.some(k => question.toLowerCase().includes(k))) {
  console.log("Sensitive keyword detected:", question);
  return NextResponse.json({
    answer: "⚠️ For questions involving personal, legal, or financial information, please contact our support team directly.",
  });
}

if (toxicPatterns.test(question)) {
  console.log("Toxic pattern detected:", question);
  return NextResponse.json({
    answer: "⚠️ Let's keep this conversation respectful. Please rephrase your question.",
  });
}


    // Validate that a question was provided
    if (!question) {
      return NextResponse.json({ error: 'Missing question' }, { status: 400 });
    }

    // --- Step 1: Generate embedding from question ---
    // Use Google Generative AI to create a semantic embedding for the user's question
    const embedModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const embeddingRes = await embedModel.embedContent(question);
    const queryEmbedding = embeddingRes.embedding?.values;

    // If embedding fails, return error
    if (!queryEmbedding) {
      return NextResponse.json({ error: 'Failed to generate query embedding' }, { status: 500 });
    }

    // --- Step 2: Search Pinecone for context ---
    // Query Pinecone vector database for the most relevant knowledge chunks
    const pineconeRes = await fetch(`${process.env.PINECONE_HOST_URL}/query`, {
      method: 'POST',
      headers: {
        'Api-Key': process.env.PINECONE_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vector: queryEmbedding, // The embedding vector for the question
        topK: 10, // Retrieve top 10 most similar chunks
        includeMetadata: true, // Include metadata (e.g., source, text)
        namespace: 'default', // Use default namespace
      }),
    });

    // Handle Pinecone errors
    if (!pineconeRes.ok) {
      const errorText = await pineconeRes.text();
      console.error('Pinecone error:', errorText);
      return NextResponse.json({ error: 'Failed to search knowledge base' }, { status: 500 });
    }

    // Parse Pinecone response for matches
    const matches = await pineconeRes.json(); // Contains the most relevant chunks
    console.log("🔍 Pinecone raw matches:", JSON.stringify(matches, null, 2));

    // --- Step 2b: Format context for LLM prompt ---
    // Take the top 8 matches and format them as context for the LLM
    const context = matches.matches?.length > 0
      ? matches.matches.slice(0, 8).map((m: any) =>
          `Source: ${m.metadata?.source || 'Unknown'}\n${(m.metadata?.text || '').slice(0, 500)}`
        ).join('\n\n')
      : 'No relevant context found.';

    // --- Step 3: Generate answer using OpenAI ---
    // Compose a prompt for OpenAI GPT-4, including the context and the user's question
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4', // You can change to 'gpt-3.5-turbo' for cost
      messages: [
        {
          role: 'system',
          content: 'Use the provided context to answer the question as best as possible. If the context is only partially relevant, try to answer anyway. If there is truly no information, say so.',
        },
        {
          role: 'user',
          content: `Context:\n${context}\n\nQuestion: ${question}`,
        },
      ],
      temperature: 0.7, // Controls randomness/creativity
    });

    // Extract the final answer from OpenAI's response
    const finalAnswer =
      chatResponse.choices[0]?.message?.content ??
      'Sorry, no answer could be generated.';

    // Return the answer as JSON
    return NextResponse.json({ answer: finalAnswer });
  } catch (err: any) {
    // Handle unexpected errors
    console.error('❌ Error in /api/ask:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
