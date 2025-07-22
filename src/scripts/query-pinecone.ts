import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // 👈 explicitly load .env.local


import fetch from 'node-fetch';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Logger } from '@/utils/logger';

const logger = new Logger("Query Pinecone");

const requiredEnv = [
  "GOOGLE_API_KEY",
  "PINECONE_API_KEY",
  "PINECONE_HOST_URL"
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`❌ Missing environment variable: ${key}`);
  }
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

async function main() {
  const question = "What is Aven and how does it work?";
  logger.info(`❓ Asking: "${question}"`);

  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const embeddingResult = await model.embedContent(question);
  const embedding = embeddingResult.embedding?.values;

  if (!embedding) {
    throw new Error("❌ Failed to generate query embedding.");
  }

  logger.info(`🔎 Searching Pinecone...`);

  const pineconeHost = process.env.PINECONE_HOST_URL!;
  const searchResponse = await fetch(`${pineconeHost}/query`, {
    method: "POST",
    headers: {
      "Api-Key": process.env.PINECONE_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      vector: embedding,
      topK: 3,
      includeMetadata: true,
      namespace: "default",
    }),
  });

  if (!searchResponse.ok) {
    const errorText = await searchResponse.text();
    throw new Error(`❌ Pinecone search failed: ${errorText}`);
  }

  const result = await searchResponse.json() as { matches: any[] };
  if (!result.matches || !Array.isArray(result.matches)) {
    console.log("No matches found.");
    return;
  }

  logger.info("🔍 Top matches:");
  result.matches.forEach((match: any, i: number) => {
    console.log(`\n#${i + 1}`);
    console.log(`Score: ${match.score}`);
    console.log(`Source: ${match.metadata?.source}`);
    console.log(`ScrapedAt: ${match.metadata?.scrapedAt}`);
  });
}

main().catch(err => {
  console.error("❌ Error during query:", err);
});
