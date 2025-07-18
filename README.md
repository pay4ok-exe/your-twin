# Your Twin 🤖

**Персональный AI-ассистент с голосовым управлением**

> Ваш цифровой близнец для автоматизации всего рабочего процесса

![Your Twin Demo](https://img.shields.io/badge/Status-Ready-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

## 🌟 Что это такое?

Your Twin — это персональный AI-ассистент, похожий на JARVIS из фильмов про Железного Человека. Он слушает ваши голосовые команды и автоматически выполняет различные задачи:

- 🎤 **Голосовое управление** — активируется горячими клавишами
- 📁 **Управление проектами** — открывает проекты в Cursor
- 🤖 **Интеграция с Claude** — анализирует код и отвечает на вопросы
- ⚡ **Автоматизация системы** — работа с файлами и приложениями
- 🔗 **MCP поддержка** — использует ваши настроенные серверы

## 🚀 Быстрый старт

### 1. Клонирование репозитория
```bash
git clone https://github.com/pay4ok-exe/your-twin.git
cd your-twin
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка конфигурации
Откройте `src/config.js` и настройте пути к вашим приложениям:

```javascript
APPLICATIONS: {
  CURSOR: {
    windows: 'C:\\Users\\ваш_пользователь\\AppData\\Local\\Programs\\cursor\\Cursor.exe',
    // ...
  }
}
```

### 4. Настройка интеграции с Claude
Убедитесь, что в вашем Cursor настроен MCP filesystem для папки `claude-requests`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\ваш_пользователь\\Desktop\\claude-requests"
      ]
    }
  }
}
```

### 5. Запуск
```bash
npm start
```

## 🎮 Как использовать

### Горячие клавиши
- **Ctrl+Shift+V** — Активация голосового ввода
- **Ctrl+Shift+C** — Быстрое открытие Cursor
- **Ctrl+Shift+A** — Быстрое открытие Claude

### Примеры команд

#### 📂 Управление проектами
```
"Открой проект imperium"
"Запусти проект your-twin"
"Открыть проект website"
```

#### 🤖 Работа с Claude
```
"Объясни код main.js"
"Расскажи про этот проект"
"Что делает функция parseCommand"
```

#### 📁 Работа с файлами
```
"Создай файл readme.md"
"Найди файл config"
"Открой папку downloads"
```

#### 🔍 Поиск
```
"Найти файл package.json"
"Поиск файла config в проектах"
```

## 🏗️ Архитектура

```
Your Twin
├── 🎤 Voice Listener       # Распознавание речи
├── 🧠 Command Parser       # Парсинг команд
├── ⚙️  System Controller   # Выполнение системных операций
├── 🤖 Claude Integration   # Связь с Claude через файлы
└── 🎨 UI                   # Пользовательский интерфейс
```

### Интеграция с Claude

Your Twin использует умную систему интеграции с Claude:

1. **Создание запроса** — Your Twin создает файл `claude_request.md`
2. **MCP файловая система** — Claude в Cursor видит этот файл
3. **Обработка Claude** — Claude анализирует запрос и создает ответ
4. **Получение ответа** — Your Twin читает ответ и может его озвучить

## 📁 Структура проекта

```
your-twin/
├── main.js                 # Главный файл Electron
├── package.json            # Конфигурация проекта
├── src/
│   ├── config.js           # Настройки приложения
│   ├── voice-listener.js   # Модуль распознавания речи
│   ├── command-parser.js   # Парсер голосовых команд
│   ├── system-controller.js # Контроллер системных операций
│   ├── claude-integration.js # Интеграция с Claude
│   └── ui/                 # Интерфейс приложения
│       ├── index.html
│       ├── style.css
│       └── script.js
├── assets/                 # Ресурсы (иконки, звуки)
└── README.md              # Эта документация
```

## ⚙️ Настройка

### Пути к приложениям
Настройте пути в `src/config.js`:

```javascript
APPLICATIONS: {
  CURSOR: {
    windows: 'путь\\к\\Cursor.exe',
    mac: '/Applications/Cursor.app',
    linux: '/usr/bin/cursor'
  },
  CLAUDE: {
    windows: 'путь\\к\\Claude.exe',
    mac: '/Applications/Claude.app', 
    linux: '/usr/bin/claude'
  }
}
```

### Папки проектов
```javascript
USER_FOLDERS: {
  DESKTOP: 'C:\\Users\\ваш_пользователь\\Desktop',
  PROJECTS: 'C:\\Users\\ваш_пользователь\\Desktop\\projects'
}
```

### Распознавание речи
```javascript
VOICE: {
  LANGUAGE: 'ru-RU',           # Основной язык
  ALTERNATIVE_LANGUAGE: 'en-US', # Альтернативный язык
  TIMEOUT: 5000,               # Таймаут распознавания
  CONFIDENCE_THRESHOLD: 0.7    # Порог уверенности
}
```

## 🔧 Разработка

### Команды разработчика
```bash
npm run dev     # Запуск в режиме разработки
npm run build   # Сборка приложения
npm test        # Запуск тестов
```

### Добавление новых команд

1. **Добавьте паттерн** в `src/config.js`:
```javascript
COMMAND_PATTERNS: {
  MY_COMMAND: [
    /моя команда (\w+)/i,
    /my command (\w+)/i
  ]
}
```

2. **Обработайте в парсере** `src/command-parser.js`:
```javascript
case 'MY_COMMAND':
  // логика обработки
  break;
```

3. **Реализуйте действие** в `src/system-controller.js`:
```javascript
case 'my_action':
  await this.executeMyAction(action.parameter);
  break;
```

## 🤝 Интеграции

### MCP серверы
Your Twin работает с вашими настроенными MCP серверами:
- **GitHub** — управление репозиториями
- **Filesystem** — работа с файлами
- **Figma** — работа с дизайнами
- И любые другие MCP серверы

### API сервисы
- **Google Speech API** — для распознавания речи
- **Claude Desktop** — через файловую интеграцию
- **System APIs** — для автоматизации ОС

## 🐛 Устранение неполадок

### Голосовое распознавание не работает
1. Проверьте подключение микрофона
2. Убедитесь, что установлен Google Speech API
3. Проверьте права доступа к микрофону

### Claude не отвечает
1. Убедитесь, что MCP filesystem настроен правильно
2. Проверьте путь к папке `claude-requests`
3. Убедитесь, что Claude Desktop запущен

### Проекты не открываются
1. Проверьте пути к приложениям в `config.js`
2. Убедитесь, что Cursor установлен
3. Проверьте права доступа к папкам проектов

## 📋 Требования

- **Node.js** >= 16.0.0
- **Electron** >= 27.0.0
- **Python** >= 3.8 (для некоторых зависимостей)
- **Cursor** или другой редактор кода
- **Claude Desktop** (опционально)

### Windows
- Visual Studio Build Tools
- Windows SDK

### macOS
- Xcode Command Line Tools

### Linux
- build-essential
- libasound2-dev

## 🌟 Возможности

- ✅ Голосовое управление на русском и английском
- ✅ Интеграция с Cursor через MCP
- ✅ Интеграция с Claude через файлы
- ✅ Автоматизация системных операций
- ✅ Красивый пользовательский интерфейс
- ✅ Уведомления и обратная связь
- ✅ Горячие клавиши
- ✅ Работа в системном трее

## 🗺️ Планы развития

- 🔄 Интеграция с Claude API (когда будет доступ)
- 🔊 Синтез речи для ответов
- 📱 Веб-интерфейс
- 🧩 Система плагинов
- 📊 Аналитика использования
- 🔒 Система безопасности
- 🌐 Поддержка других языков

## 🤝 Участие в разработке

1. Форкните репозиторий
2. Создайте ветку для фичи: `git checkout -b feature/amazing-feature`
3. Закоммитьте изменения: `git commit -m 'Add amazing feature'`
4. Запушьте в ветку: `git push origin feature/amazing-feature`
5. Откройте Pull Request

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE)

## 👨‍💻 Автор

**pay4ok-exe**
- GitHub: [@pay4ok-exe](https://github.com/pay4ok-exe)

## 🙏 Благодарности

- **Anthropic** за Claude
- **Cursor** за отличный редактор
- **Electron** за возможность создавать десктопные приложения
- **Open Source community** за библиотеки и инструменты

---

**Сделано с ❤️ для автоматизации вашей работы**

> "Лучший способ предсказать будущее — это создать его" - Alan Kay