const API_URL = "https://alcult-alcultgame-01cc.twc1.net/articles"; // Замените на свой URL

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

// Функция добавления статьи
async function addArticle() {
    const title = document.getElementById("articleTitle").value.trim();
    const text = document.getElementById("articleText").value.trim();
    

    if (!title || !text) {
        openDialog("⚠ Ошибка", "Заполните все поля!");
        return;
    }

    try {
        alert ("мы пришли")
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, text })
        });

        alert ("Прошли регу")

        if (!response.ok) throw new Error(`Ошибка ${response.status}`);
        
        alert ("мы Ошибку")
        const newArticle = await response.json();
        alert (newArticle)
        openDialog("✅ Успех", `Статья добавлена (ID: ${newArticle.id})!`);
        document.getElementById("addArticleDialog").close(); // Закрываем окно после успеха
    } catch (error) {
        openDialog("❌ Ошибка", `Не удалось добавить статью: ${error.message}`);
    }
}

// Функция открытия формы добавления статьи
function openAddArticleDialog() {
    document.getElementById("addArticleDialog").showModal();
}

// Функция закрытия формы добавления статьи
function closeAddArticleDialog() {
    document.getElementById("addArticleDialog").close();
}