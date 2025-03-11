const API_URL = "https://my-wiki-bot.ru/articles";  // Обнови на свой сервер

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

async function showArticle(id) {
    const response = await fetch(`${API_URL}/${id}`);
    const article = await response.json();
    alert(`📖 ${article.id}:\n\n${article.text}`);
}

Telegram.WebApp.expand();
loadArticles();
