import { Low } from "lowdb";
import { JSONFile } from "lowdb/node"; // Новый путь импорта JSONFile
import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import express from "express"; // Добавляем Express для API
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
const PORT = 3000;

// Получаем путь к текущей директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

// Подключаем базу данных
const adapter = new JSONFile("db.json");

// ❗️ Передаем начальные данные при создании `Low`
const defaultData = { articles: {} };
const db = new Low(adapter, defaultData);

await db.read();

// Гарантируем, что база не пустая
db.data ||= defaultData;
await db.write();

bot.command("open", (ctx) => {
  ctx.reply("🔗 Открыть Вики:", {
      reply_markup: {
          inline_keyboard: [[{ text: "📖 Открыть", web_app: { url: "http://localhost:3000" } }]],
      },
  });
});

// Команда /start
bot.start((ctx) =>
  ctx.reply(
    "📖 Добро пожаловать в Телеграм-Вики!\n\n\
    Доступные команды:\n\
    /list - Показать статьи\n\
    /get [номер] - Получить статью\n\
    /add [номер] [текст] - Добавить статью\n\
    /edit [номер] [текст] - Добавить статью"
  )
);

// Команда /list
bot.command("list", async (ctx) => {
  await db.read();
  const keys = Object.keys(db.data.articles);
  if (keys.length === 0) return ctx.reply("📂 Вики пока пустая.");
  ctx.reply("📜 Доступные статьи:\n" + keys.map((k) => `📌 ${k}`).join("\n"));
});

// Команда /get
bot.command("get", async (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args.length < 2) return ctx.reply("❌ Используй: /get [номер]");

  await db.read();
  const article = db.data.articles[args[1]];
  if (!article) return ctx.reply("❌ Такой статьи нет.");

  ctx.reply(`📖 *Статья ${args[1]}:*\n${article}`, { parse_mode: "Markdown" });
});

// Команда /add
bot.command("add", async (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args.length < 3) return ctx.reply("❌ Используй: /add [номер] [текст]");

  const num = args[1];
  const text = args.slice(2).join(" ");

  await db.read();
  db.data.articles[num] = text;
  await db.write();

  ctx.reply(`✅ Статья ${num} сохранена!`);
});

// Команда /edit - редактировать статью
bot.command("edit", async (ctx) => {
    const args = ctx.message.text.split(" ");
    if (args.length < 3) return ctx.reply("❌ Используй: /edit [номер] [новый текст]");
  
    const num = args[1];
    const newText = args.slice(2).join(" ");
  
    await db.read();
    if (!db.data.articles[num]) return ctx.reply("❌ Такой статьи нет.");
  
    db.data.articles[num] = newText;
    await db.write();
  
    ctx.reply(`✏️ Статья ${num} обновлена!`);
  });

// Запуск бота
bot.launch();
console.log("🤖 Бот запущен!");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));


// Разрешаем CORS, чтобы веб-приложение могло запрашивать API
app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

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

// Запуск сервера
app.listen(PORT, () => console.log(`🚀 API запущен на http://localhost:${PORT}`));
