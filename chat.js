import { ChatOpenAI } from "langchain/chat_models/openai";
import "dotenv/config";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import {
  RetrievalQAChain,
  ConversationalRetrievalQAChain,
} from "langchain/chains";
import { createClient } from "@supabase/supabase-js";

const client = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PRIVATE_KEY
);

export const query = async (prompt) => {
  const chat = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    apiKey: process.env.OPENAI_API_KEY,
  });

  const vectorStore = await SupabaseVectorStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    {
      client,
      tableName: "documents",
      queryName: "match_documents",
    }
  );

  let chain = ConversationalRetrievalQAChain.fromLLM(
    chat,
    vectorStore.asRetriever(),
    { returnSourceDocuments: true }
  );

  //console.log(chain.questionGeneratorChain.prompt.template);

  const res = await chain.call({ question: prompt, chat_history: [] });
  console.log(res);

  /* Ask it a follow up question */
  const chatHistory = prompt + res.text;
  const followUpRes = await chain.call({
    question:
      "generate 2 multiple choice question from the topic ohm's law. each question should have 4 choices with only one correct answer",
    chat_history: chatHistory,
  });
  console.log("----------follow up-----------");
  console.log(followUpRes);
  return res;
};
