import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { formatDocumentsAsString } from "langchain/util/document";
import type { Document } from "@langchain/core/documents";
import type { VectorStoreRetriever } from "@langchain/core/vectorstores";
import path from 'path';
import fs from 'fs/promises';

// --- RAG Setup ---

let retriever: VectorStoreRetriever<MemoryVectorStore>;
let model: ChatGoogleGenerativeAI;

const RAG_TEMPLATE = `You are acting as the university administration, answering questions based ONLY on the provided context from the prospectus.
Maintain a formal and professional tone. If the context doesn't contain the answer, state that the information is not available in the provided documents.

CONTEXT:
{context}

QUESTION: {question}

ANSWER:`;

async function initializeRAG() {
  // Initialize only once
  if (retriever && model) {
    return;
  }

  try {
    console.log("Initializing RAG...");
    const dataDir = path.join(process.cwd(), 'dataforchatbot');

    try {
        await fs.access(dataDir);
    } catch (error) {
        console.error(`Error accessing directory ${dataDir}:`, error);
        throw new Error(`Directory 'dataforchatbot' not found or inaccessible.`);
    }

    const loader = new DirectoryLoader(dataDir, {
      ".pdf": (filePath) => new PDFLoader(filePath, {
          parsedItemSeparator: " ",
          splitPages: false,
      }),
    }, true);

    const docs = await loader.load();

    if (!docs || docs.length === 0) {
        console.warn(`No documents found in ${dataDir}. RAG will not function correctly.`);
    } else {
        console.log(`Loaded ${docs.length} document(s).`);
    }

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 300,
    });
    const splits = await textSplitter.splitDocuments(docs);
    console.log(`Split into ${splits.length} chunks.`);

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_CLIENT_ID!,
      model: "text-embedding-004",
    });

    const vectorStore = await MemoryVectorStore.fromDocuments(
      splits,
      embeddings
    );

    retriever = vectorStore.asRetriever({ k: 6 });
    console.log("Retriever created (k=6).");

    model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_CLIENT_ID!,
      model: "gemini-1.5-flash",
      maxOutputTokens: 2048,
      temperature: 0.3,
    });
    console.log("Chat model initialized.");

    console.log("RAG Initialization complete.");

  } catch (error) {
    console.error("Error during RAG initialization:", error);
    throw new Error(`Failed to initialize RAG: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeRAG();

    if (!retriever) {
        throw new Error("RAG system is not available due to initialization issues.");
    }

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const ragPrompt = PromptTemplate.fromTemplate(RAG_TEMPLATE);

    const retrieverChain = RunnableSequence.from([
      (input: { question: string }) => input.question,
      retriever,
    ]);

    const contextChain = RunnableSequence.from([
      (input: { question: string }) => input.question,
      retriever,
      (docs: Document[]) => {
        console.log("--- Retrieved Documents ---");
        docs.forEach((doc, index) => {
            console.log(`Document ${index + 1} Content:\n`, doc.pageContent);
            console.log(`Document ${index + 1} Metadata:`, doc.metadata);
            console.log("---");
        });
        console.log("--- End Retrieved Documents ---");
        return formatDocumentsAsString(docs);
      }
    ]);

    const ragChain = RunnableSequence.from([
        {
            context: contextChain,
            question: new RunnablePassthrough(),
        },
        ragPrompt,
        model,
        new StringOutputParser(),
    ]);

    console.log(`Invoking RAG chain with question: "${message}"`);
    const result = await ragChain.invoke({ question: message });

    return NextResponse.json({ response: result });

  } catch (error) {
    console.error('Error processing chat:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process chat message';
    if (errorMessage.includes("RAG system is not available") || errorMessage.includes("Failed to initialize RAG")) {
        return NextResponse.json({ error: `Chatbot initialization failed: ${errorMessage}` }, { status: 503 });
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 