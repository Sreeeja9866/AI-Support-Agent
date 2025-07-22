Ava- Aven's AI Assistant

## Features

- **Todo List**: Server-side data mutations using Next.js Server Actions
- **Data Fetching Example**: Demonstrates React Suspense and loading states
- **Modern UI**: Built with Shadcn UI components and Tailwind CSS
- **Error Handling**: Proper error boundaries and user feedback
- **Type Safety**: Full TypeScript support

## How It Works: End-to-End Logic

1. **Data Collection & Chunking**
   - Relevant data (docs, FAQs, website content) is collected and split into small chunks.
   - _See:_ [`src/scripts/embed-multiple-pages.ts`](src/scripts/embed-multiple-pages.ts)

2. **Embedding & Pinecone Storage**
   - Each chunk is converted into a vector embedding and stored in Pinecone for semantic search.
   - _See:_ [`src/scripts/insert-data-to-pinecone.ts`](src/scripts/insert-data-to-pinecone.ts)

3. **User Query (Voice or Text)**
   - The user asks a question via text or voice (using Vapi and browser speech recognition).
   - _See:_ [`src/app/components/ChatWidget.tsx`](src/app/components/ChatWidget.tsx), [`src/app/components/VapiWidget.tsx`](src/app/components/VapiWidget.tsx)

4. **Query Embedding & Pinecone Search**
   - The user’s question is embedded and Pinecone is queried for relevant chunks.
   - _See:_ [`src/scripts/query-pinecone.ts`](src/scripts/query-pinecone.ts)

5. **Contextual Answer Generation (Gemini)**
   - The top Pinecone results and the user’s question are sent to Gemini (Google LLM) to generate an answer.
   - _See:_ [`src/app/api/ask/route.ts`](src/app/api/ask/route.ts)

6. **Response Delivery (Text & Voice)**
   - The answer is displayed in the chat and spoken aloud using Vapi.
   - _See:_ [`src/app/components/ChatWidget.tsx`](src/app/components/ChatWidget.tsx), [`src/app/components/VapiWidget.tsx`](src/app/components/VapiWidget.tsx)

---

### Quick Links to Key Code Files

- [Chat Widget (UI & Logic)](src/app/components/ChatWidget.tsx)
- [Voice Widget (Vapi Integration)](src/app/components/VapiWidget.tsx)
- [Pinecone Query Logic](src/scripts/query-pinecone.ts)
- [Gemini API Integration](src/app/api/ask/route.ts)
- [Data Embedding & Storage](src/scripts/embed-multiple-pages.ts), [Insert to Pinecone](src/scripts/insert-data-to-pinecone.ts)

## Tech Stack

- [Next.js](https://nextjs.org) - React framework
- [Shadcn UI](https://ui.shadcn.com/) - Component library
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up your environment variables in the `.env` file.

4. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `app/page.tsx` - Main page with Todo list implementation
- `app/example/page.tsx` - Data fetching example with loading states
- `app/actions/*` - Server Actions for data mutations
- `components/ui/*` - Shadcn UI components

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions) - Learn about Next.js Server Actions
- [Shadcn UI Documentation](https://ui.shadcn.com) - Learn about Shadcn UI components
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Learn about Tailwind CSS

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
