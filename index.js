import express from "express";
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

// База данных
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

// 📌 API: Добавление новой заметки
app.post("/notes", async (req, res) => {
    await db.read();
    db.data.notes ||= []; // Если массив не существует, создаём его

    const { title, text } = req.body;
    if (!title || !text) {
        return res.status(400).json({ error: "Заголовок и текст заметки обязательны" });
    }

    const newNote = {
        id: Date.now().toString(), // Генерируем уникальный ID
        title,
        text,
        createdAt: new Date().toISOString()
    };

    db.data.notes.push(newNote);
    await db.write();

    res.status(201).json({ message: "Заметка сохранена", note: newNote });
});

// 📌 Подключаем WebApp
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// 📌 Команда /open для запуска WebApp
bot.command("open", (ctx) => {
    ctx.reply("🔗 Открыть Вики:", {
        reply_markup: {
            inline_keyboard: [[{ text: "📖 Открыть", web_app: { url: process.env.WEB_APP_URL } }]],
        },
    });
});

// Запускаем API и бота
app.listen(PORT, () => console.log(`🚀 API запущен на http://localhost:${PORT}`));
bot.launch();
console.log("🤖 Бот запущен!");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
