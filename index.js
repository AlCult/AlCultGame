import express from "express";  // ❗️ Объявляем только ОДИН раз
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
const PORT = 3000;

// Подключаем базу данных
const adapter = new JSONFile("db.json");
const defaultData = { articles: {} };
const db = new Low(adapter, defaultData);

await db.read();
db.data ||= defaultData;
await db.write();

// 📌 API: Получение списка статей
app.get("/articles", async (req, res) => {
    await db.read();
    res.json(db.data.articles);
});

// 📌 API: Получение одной статьи
app.get("/articles/:id", async (req, res) => {
    await db.read();
    const article = db.data.articles[req.params.id];
    if (!article) return res.status(404).json({ error: "Статья не найдена" });
    res.json({ id: req.params.id, text: article });
});

// Запуск API-сервера
app.listen(PORT, () => console.log(`🚀 API запущен на http://localhost:${PORT}`));

// 📌 Подключаем WebApp
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// 📌 Команда для открытия WebApp
bot.command("open", (ctx) => {
    ctx.reply("🔗 Открыть Вики:", {
        reply_markup: {
            inline_keyboard: [[{ text: "📖 Открыть", web_app: { url: "http://localhost:3000" } }]],
        },
    });
});

// 📌 Запускаем бота
bot.launch();
console.log("🤖 Бот запущен!");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
