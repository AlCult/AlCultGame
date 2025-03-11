# Используем официальный образ Node.js
FROM node:20

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь код проекта
COPY . .

# Открываем порт для API/WebApp
EXPOSE 3000

# Указываем команду запуска
CMD ["node", "index.js"]
