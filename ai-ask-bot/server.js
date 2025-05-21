import express from "express";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import { cosineSimilarity } from "./utils/cosine.js";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const embeddingsPath = path.join("./data/embeddings.json");
const knowledgeBase = JSON.parse(fs.readFileSync(embeddingsPath, "utf-8"));

app.post("/api/query", async (req, res) => {
  const { question } = req.body;

  try {
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

      const scored = knowledgeBase
        .map((item) => {
          if (
            !item.embedding ||
            item.embedding.length !== queryEmbedding.length
          ) {
            return null;
          }

          if (item.embedding.some(isNaN) || queryEmbedding.some(isNaN)) {
            return null;
          }

          const score = cosineSimilarity(queryEmbedding, item.embedding);
          return {
            ...item,
            score,
          };
        })
        .filter((item) => item !== null);

      const topK = scored.sort((a, b) => b.score - a.score).slice(0, 3);

      const context = topK
        .map(
          (item, idx) =>
            `【資料${idx + 1}】\n主題：${item.topic}\n問題：${
              item.question
            }\n答案：${item.answer}\n日語答案：${item.answer_en}\n英語答案：${
              item.answer_ja
            }\n背景：${item.background || "無"}\n可能的問法：${
              item.question_variants
            }`
        )
        .join("\n\n");

      const prompt = `以下是金融擔保系統的相關資料，請根據這些資訊回答問題: \n\n${context}\n\n使用者提問：${question}`;

      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `你是一位專業金融擔保系統助手，請僅根據以下知識庫資料回覆使用者問題，不得引用未在資料中出現的資訊。請務必用提問者的語言作答，若問題是日文請用敬語，若英文請用商業書信語氣，若中文則保持正式禮貌。
請遵循以下步驟：
1. 你會多國語言，根據提問的語言回答對應的語言(例如英文問英文答，日文問日文回答，中文問中文回答)。
2. 閱讀【知識庫】每筆資料的 topic, question, answer, background 等欄位，整合理解脈絡。
3. 客戶可能有不同問法或追加疑問，請參考【知識庫】的question_variants。
4. 如果客戶的提問不明確(例如:交易操作失敗)，請不要回覆:"可能有以下幾種情況..."，這會造成客戶混亂。請引導客戶回答更詳細的信息助你釐清後再回答"確定的"答案。
5. 若從知識庫找不到答案請勿自己推論或建議用戶參考未提及的文件，請回覆：「很抱歉目前尚未有該問題的對應方式，我們會持續完善資料庫。」
6. 根據理解後的知識，回答使用者的提問，切記勿加入自己的"腦補"，例如交易數據根本不會自動生成!!。

請完全根據知識庫回答。禁止：
- 自行延伸未提及的細節
- 建議使用者去查使用手冊（若資料中未提及）

---
【知識庫】
${context}

---
【使用者問題】
${question}`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const answer = chatCompletion.choices[0].message.content;
      res.json({ answer });
    } else {
      console.error("API 回應不包含預期的嵌入向量");
      res.status(500).json({ error: "API 回應不包含預期的嵌入向量" });
    }
  } catch (error) {
    console.error("查詢過程中出現錯誤:", error.message);
    console.error("錯誤堆疊:", error.stack);
    res
      .status(500)
      .json({ error: "查詢過程中出現錯誤", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
