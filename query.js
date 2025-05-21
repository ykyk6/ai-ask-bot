import fs from "fs";
import path from "path";
import { OpenAI } from "openai";
import { cosineSimilarity } from "./utils/cosine.js";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const embeddingsPath = path.join("./data/embeddings.json");
const knowledgeBase = JSON.parse(fs.readFileSync(embeddingsPath, "utf-8"));

// console.log(knowledgeBase[0]);
// console.log(knowledgeBase[0].embeddings.length);

async function queryAnswer(question) {
  try {
    // 1.轉換使用者提問為向量
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
    });

    if (
      response.data &&
      response.data.length > 0 &&
      response.data[0].embedding
    ) {
      const queryEmbedding = response.data[0].embedding;

      // 打印查詢向量的長度
      // console.log("查詢向量長度:", queryEmbedding.length);

      // 計算與知識庫每筆data的相似度
      const scored = knowledgeBase
        .map((item) => {
          if (
            !item.embeddings ||
            item.embeddings.length !== queryEmbedding.length
          ) {
            console.error("向量長度不一致或未定義:", item);
            return null;
          }

          // 檢查向量內容
          if (item.embeddings.some(isNaN) || queryEmbedding.some(isNaN)) {
            console.error("向量包含NaN值:", item);
            return null;
          }

          // console.log("資料庫向量長度:", item.embeddings.length);
          const score = cosineSimilarity(queryEmbedding, item.embeddings);
          return {
            ...item,
            score,
          };
        })
        .filter((item) => item !== null);
      // 3.排序找出最相關的前幾筆
      const topMatch = scored.sort((a, b) => b.score - a.score)[0];

      // 打印最相似的問題和答案
      console.log("最相似的問題:", topMatch.question);
      // console.log("最相似的答案:", topMatch.answer);

      // 4.用GPT生成回答
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "你是一個專業的問答助手，請根據提供的知識內容回答問題。日本語の対応ならば、ビジネスな日本語で回答してください。",
          },
          {
            role: "user",
            content: `根據以下知識回答問題。\n\n知識:${topMatch.answer}\n\n問題:${question}`,
          },
        ],
      });
      const answer = chatCompletion.choices[0].message.content;
      console.log("原始知識:", topMatch.answer);
      console.log("GPT回答:", answer);
      return topMatch;
    } else {
      console.error("API 回應不包含預期的嵌入向量");
      return null;
    }
  } catch (error) {
    console.error("查詢過程中出現錯誤:", error.message);
    return null;
  }
}

queryAnswer("なぜレターの発信ができないの？").catch(console.error);
