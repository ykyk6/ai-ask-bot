import fs from "fs";
import path from "path";
import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const knowledgePath = path.join("./data/knowledgeBase.json");
const knowledge = JSON.parse(fs.readFileSync(knowledgePath, "utf-8"));

async function generateEmbeddings() {
  const results = await Promise.all(
    knowledge.map(async (item) => {
      const input = `Q: ${item.question} A: ${item.answer} A_j: ${item.answer_ja} A_e: ${item.answer_en} T: ${item.topic} Q_V: ${item.question_variants} B: ${item.background}`;
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: input,
      });
      return {
        ...item,
        embedding: response.data[0].embedding,
      };
    })
  );
  const outputPath = path.join("./data/embeddings.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`已成功儲存${results.length}筆向量資料到embeddings.json`);
}
generateEmbeddings().catch(console.error);
