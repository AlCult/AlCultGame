const API_URL = "https://alcult-alcultgame-01cc.twc1.net/articles";  // Обнови на свой сервер

async function loadArticles() {
    const response = await fetch(API_URL);
    const articles = await response.json();
    const container = document.getElementById("articles");
    container.innerHTML = "";

    Object.keys(articles).forEach(id => {
        const div = document.createElement("div");
        div.className = "article";
        div.innerText = `📌 ${id}: ${articles[id].slice(0, 30)}...`;
        div.onclick = () => showArticle(id);
        container.appendChild(div);
    });
}

// Функция показа статьи
async function showArticle(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error(`Ошибка ${response.status}`);

        const article = await response.json();
        if (!article.id || !article.text) throw new Error("Неверный формат данных");

        openDialog(`📖 ${article.id}`, article.text);
    } catch (error) {
        openDialog("❌ Ошибка", `Не удалось загрузить статью: ${error.message}`);
    }
}

// Функция показа диалогового окна
function openDialog(title, content) {
    const dialog = document.getElementById("articleDialog");
    document.getElementById("dialogTitle").textContent = title;
    document.getElementById("dialogContent").textContent = content;
    dialog.showModal();
}

// Функция закрытия диалога
function closeDialog() {
    document.getElementById("articleDialog").close();
}

Telegram.WebApp.expand();
loadArticles();
