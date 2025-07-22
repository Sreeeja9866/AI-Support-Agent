import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';
import FirecrawlApp from '@mendable/firecrawl-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Logger } from '@/utils/logger';

const logger = new Logger("Multi-Embed");

const requiredEnv = [
  "FIRECRAWL_API_KEY",
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
const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! });

const urls: string[] = [
  "https://www.aven.com/",
  "https://www.aven.com/about",
  "https://www.aven.com/how-it-works",
  "https://www.aven.com/education",
  "https://www.aven.com/reviews",
  "https://www.aven.com/app",
  "https://www.aven.com/contact"
];

async function embedAndStore(url: string, id: string) {
  try {
    logger.info(`🌐 Scraping: ${url}`);
    const scrapeResult = await firecrawl.scrapeUrl(url, {
      formats: ["markdown"],
      onlyMainContent: true,
    });

    if (!scrapeResult.success || !scrapeResult.markdown) {
      throw new Error("Scraping failed or empty markdown.");
    }

    logger.info("✅ Scraped markdown. Generating embedding...");
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const embeddingResult = await model.embedContent(scrapeResult.markdown);
    const embedding = embeddingResult.embedding?.values;

    if (!embedding) {
      throw new Error("Embedding failed.");
    }

    logger.info(`🧠 Embedding complete (${embedding.length} dims). Upserting to Pinecone...`);
    const pineconeHost = process.env.PINECONE_HOST_URL!;
    const vector = {
      id,
      values: embedding,
      metadata: {
        source: url,
        scrapedAt: new Date().toISOString(),
        text: scrapeResult.markdown, // ✅ add actual scraped text
      },
      
    };

    const upsertResponse = await fetch(`${pineconeHost}/vectors/upsert`, {
      method: "POST",
      headers: {
        "Api-Key": process.env.PINECONE_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vectors: [vector],
        namespace: "default",
      }),
    });

    if (!upsertResponse.ok) {
      const errorText = await upsertResponse.text();
      throw new Error(`Upsert failed: ${errorText}`);
    }

    logger.info("✅ Successfully upserted.");
  } catch (err) {
    logger.error(`❌ Failed to process ${url}`, { error: err });
  }
}

async function main() {
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const id = `doc-${i + 1}`;
    await embedAndStore(url, id);
  }
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
});
