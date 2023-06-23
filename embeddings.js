import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const loader = new PDFLoader("book.pdf", {
  splitPages: false,
});

const splitter = new CharacterTextSplitter({
  separator: " ",
  chunkSize: 1000,
  chunkOverlap: 200,
});
const docs = await loader.loadAndSplit(splitter);

const client = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PRIVATE_KEY
);

async function createEmbeddings() {
  const vectorStore = await SupabaseVectorStore.fromDocuments(
    docs,
    new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    }),
    {
      client,
      tableName: "documents",
      queryName: "match_documents",
    }
  );
}
createEmbeddings();
