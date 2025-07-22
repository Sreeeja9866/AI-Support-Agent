import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';
import FirecrawlApp from "@mendable/firecrawl-js";
import { Logger } from "@/utils/logger";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize logger
const logger = new Logger("Insert Data to Pinecone");

// Check required environment variables
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

// Initialize Google GenAI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Add manual knowledge chunks for foundational questions and FAQs
const manualChunks = [
  {
    id: "aven-definition",
    text: "Aven is a financial technology company. If you are wondering 'What is Aven?' or 'Tell me about Aven', here is the answer: Aven offers home equity lines of credit and other financial services to homeowners in the United States. Aven helps homeowners access the equity in their homes through flexible credit options.",
    source: "manual"
  },
  { id: "aven-how-it-works", text: "Aven allows homeowners to access the equity in their homes through a line of credit, providing flexible borrowing options with no annual fees and competitive rates.", source: "manual" },
  { id: "aven-eligibility", text: "Aven's services are available to homeowners in the United States who meet certain credit and property requirements.", source: "manual" },
  { id: "aven-contact", text: "You can contact Aven support through their website's contact form or by emailing support@aven.com.", source: "manual" },
  { id: "aven-fees", text: "Aven does not charge annual fees for its home equity line of credit.", source: "manual" },
  { id: "aven-app", text: "The Aven app allows users to manage their line of credit, make payments, and access support from their mobile device.", source: "manual" },
  { id: "aven-signup", text: "To sign up for Aven, visit the Aven website and complete the online application form.", source: "manual" },
  { id: "aven-documents", text: "Applicants typically need to provide proof of homeownership, identification, and income documents.", source: "manual" },
  { id: "aven-credit-check", text: "Aven may perform a credit check as part of the application process.", source: "manual" },
  { id: "aven-benefits", text: "Aven offers flexible credit, no annual fees, competitive rates, and easy online management.", source: "manual" },
  { id: "aven-location", text: "Aven is headquartered in the United States.", source: "manual" },
  { id: "aven-app-download", text: "The Aven app is available for download on the App Store and Google Play.", source: "manual" },
  { id: "aven-data-security", text: "Aven uses industry-standard encryption and security practices to protect user data.", source: "manual" },
  { id: "aven-availability", text: "Aven's services are currently available to eligible homeowners in the United States.", source: "manual" },
  { id: "aven-minimum-age", text: "You must be at least 18 years old to use Aven's services.", source: "manual" },
  { id: "aven-password-reset", text: "To reset your Aven password, use the 'Forgot Password' link on the login page.", source: "manual" },
  { id: "aven-forgot-login", text: "If you forget your login, use the password reset option or contact support.", source: "manual" },
  { id: "aven-update-info", text: "You can update your personal information in your Aven account settings.", source: "manual" },
  { id: "aven-close-account", text: "To close your Aven account, contact customer support.", source: "manual" },
  { id: "aven-customer-service-phone", text: "Aven's customer service phone number is available on their contact page.", source: "manual" },
  { id: "aven-approval-time", text: "Approval times vary, but most applications are reviewed within a few business days.", source: "manual" },
  { id: "aven-interest-rate", text: "Aven offers competitive interest rates, which may vary based on creditworthiness.", source: "manual" },
  { id: "aven-hidden-fees", text: "Aven is transparent about fees and does not charge hidden fees.", source: "manual" },
  { id: "aven-make-payment", text: "You can make payments through the Aven app or website.", source: "manual" },
  { id: "aven-early-payoff", text: "You can pay off your Aven line of credit early without penalty.", source: "manual" },
  { id: "aven-missed-payment", text: "If you miss a payment, contact Aven support to discuss your options.", source: "manual" },
  { id: "aven-check-balance", text: "Check your balance anytime in the Aven app or website dashboard.", source: "manual" },
  { id: "aven-education", text: "Aven offers financial education resources on their website.", source: "manual" },
  { id: "aven-reviews", text: "You can find reviews about Aven on their website and third-party review sites.", source: "manual" },
  { id: "aven-support-call", text: "Book a support call through the Aven website or app.", source: "manual" },
  { id: "aven-refund-policy", text: "Aven's refund policy is detailed in their terms of service.", source: "manual" },
  { id: "aven-business-use", text: "Aven's services are primarily for personal use by homeowners.", source: "manual" },
  { id: "aven-refer-friend", text: "Refer a friend to Aven using your unique referral link in the app.", source: "manual" },
  { id: "aven-rewards", text: "Aven offers a rewards program for eligible users. Details are in the app.", source: "manual" },
  { id: "aven-notifications", text: "Change your notification settings in your Aven account preferences.", source: "manual" },
  { id: "aven-third-party-info", text: "Aven does not share your information with third parties without consent.", source: "manual" },
  { id: "aven-report-suspicious", text: "Report suspicious activity to Aven support immediately.", source: "manual" },
  { id: "aven-supported-browsers", text: "Aven supports all major browsers including Chrome, Firefox, and Safari.", source: "manual" },
  { id: "aven-tablet-use", text: "You can use Aven on your tablet via the app or web browser.", source: "manual" },
  { id: "aven-app-update", text: "Update the Aven app via the App Store or Google Play.", source: "manual" },
  { id: "aven-vs-bank", text: "Aven is a fintech company, not a traditional bank, and offers more flexible credit options.", source: "manual" },
  { id: "aven-access-education", text: "Access educational resources in the Aven app or website.", source: "manual" },
  { id: "aven-partnerships", text: "Contact Aven for partnership opportunities via their website.", source: "manual" },
  { id: "aven-dispute-transaction", text: "To dispute a transaction, contact Aven support with details.", source: "manual" },
  { id: "aven-upload-docs", text: "Upload documents securely through your Aven account dashboard.", source: "manual" },
  { id: "aven-privacy-policy", text: "Aven's privacy policy is available on their website.", source: "manual" },
  { id: "aven-get-started", text: "Get started with Aven by applying online and following the prompts.", source: "manual" },
  { id: "aven-max-loan", text: "The maximum loan amount depends on your home equity and credit profile.", source: "manual" },
  { id: "aven-feedback", text: "Provide feedback to Aven through the app or website feedback form.", source: "manual" },
  { id: "aven-faqs", text: "Aven's FAQs cover common questions about their services and are available on their website.", source: "manual" },
  { id: "aven-application-status", text: "Check your application status in the Aven app or website.", source: "manual" },
  { id: "aven-loan-terms", text: "Aven's loan terms are flexible and tailored to each user. See your offer for details.", source: "manual" },
  {
    id: "aven-what-is",
    text: "What is Aven? Aven is a financial technology company that provides home equity lines of credit and other financial services to homeowners in the United States.",
    source: "manual"
  },
  {
    id: "aven-overview",
    text: "Aven is a fintech company. It helps homeowners access the equity in their homes through flexible credit options and competitive rates.",
    source: "manual"
  },
  {
    id: "aven-description",
    text: "Aven offers financial products for homeowners, including home equity lines of credit. Aven is a financial technology company based in the United States.",
    source: "manual"
  },
  // ...add a few more with similar info, different wording
  {
    id: "aven-def-1",
    text: "Aven is a financial technology company that provides home equity lines of credit.",
    source: "manual"
  },
  {
    id: "aven-def-2",
    text: "Aven is a fintech company. What is Aven? It is a company that helps homeowners access home equity.",
    source: "manual"
  },
  {
    id: "aven-def-3",
    text: "Aven: A financial technology company for homeowners in the US, offering flexible credit options.",
    source: "manual"
  },
  // ...and so on
];

async function upsertManualChunks() {
  for (const chunk of manualChunks) {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const embeddingResult = await model.embedContent(chunk.text);
    const embedding = embeddingResult.embedding?.values;
    if (!embedding) {
      console.error(`Failed to embed manual chunk: ${chunk.id}`);
      continue;
    }
    const vector = {
      id: chunk.id,
      values: embedding,
      metadata: {
        source: chunk.source,
        scrapedAt: new Date().toISOString(),
        text: chunk.text,
      },
    };
    const pineconeHost = process.env.PINECONE_HOST_URL!;
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
      console.error(`Failed to upsert manual chunk: ${chunk.id}`, errorText);
    } else {
      console.log(`✅ Upserted manual chunk: ${chunk.id}`);
    }
  }
}

async function main() {
  await upsertManualChunks();
  logger.info("🚀 Starting scrape and embedding process...");

  // Step 1: Scrape the page using Firecrawl
  const firecrawl = new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_API_KEY!,
  });

  const scrapeResult = await firecrawl.scrapeUrl("https://www.aven.com/", {
    formats: ["markdown"],
    onlyMainContent: true,
  });

  if (!scrapeResult.success || !scrapeResult.markdown) {
    throw new Error("❌ Failed to scrape content or no markdown found.");
  }

  const markdownContent = scrapeResult.markdown;
  logger.info("✅ Scraped markdown content.");

  // Step 2: Generate embedding using Google GenAI
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

  const embeddingResult = await model.embedContent(markdownContent);
  const embedding = embeddingResult.embedding?.values;

  if (!embedding) {
    throw new Error("❌ Failed to generate embedding.");
  }

  logger.info(`✅ Embedding generated with ${embedding.length} dimensions.`);

  // Step 3: Prepare the vector
  const vector = {
    id: "aven-homepage-1", // You can make this dynamic
    values: embedding,
    metadata: {
      source: "https://www.aven.com/",
      type: "markdown",
      scrapedAt: new Date().toISOString(),
      text: markdownContent, // ✅ add actual text here
    },
    
  };

  // Step 4: Send to Pinecone using manual fetch
  const pineconeHost = process.env.PINECONE_HOST_URL!;

  const upsertResponse = await fetch(`${pineconeHost}/vectors/upsert`, {
    method: "POST",
    headers: {
      "Api-Key": process.env.PINECONE_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      vectors: [vector],
      namespace: "default", // change if you want a custom namespace
    }),
  });

  if (!upsertResponse.ok) {
    const errorText = await upsertResponse.text();
    throw new Error(`❌ Failed to upsert vector to Pinecone: ${errorText}`);
  }

  logger.info("✅ Successfully upserted vector to Pinecone!");
}

main().catch((error) => {
  console.error("❌ Error occurred:", error);
});
