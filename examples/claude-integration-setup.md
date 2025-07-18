# Настройка интеграции с Claude через MCP

## 🎯 Цель интеграции

Your Twin интегрируется с Claude Desktop через файловую систему, используя MCP (Model Context Protocol). Это позволяет:

- Отправлять запросы Claude через файлы
- Получать ответы автоматически
- Анализировать проекты и код
- Создавать интеллектуальные рабочие процессы

## 📋 Пошаговая настройка

### Шаг 1: Настройка MCP в Cursor

1. Откройте Cursor
2. Перейдите в настройки (Ctrl+,)
3. Найдите секцию MCP или создайте файл `settings.json`
4. Добавьте конфигурацию:

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

### Шаг 2: Настройка папки для обмена

1. Your Twin автоматически создаст папку `claude-requests` на рабочем столе
2. Убедитесь, что путь в MCP совпадает с этой папкой
3. Проверьте права доступа к папке

### Шаг 3: Проверка работы

1. Запустите Your Twin
2. Скажите: "Объясни как работает voice-listener"
3. Your Twin создаст файл запроса
4. Откройте Cursor и проверьте, что Claude видит файл
5. Claude должен ответить, создав файл ответа

## 📁 Структура файлов интеграции

### Папка claude-requests
```
claude-requests/
├── claude_request.md     # Текущий запрос от Your Twin
├── claude_response.md    # Ответ от Claude
├── README.md            # Инструкции по использованию
└── project_analysis/    # Анализы проектов
    ├── imperium_analysis.md
    └── your-twin_analysis.md
```

### Формат файла запроса

```markdown
# Запрос от Your Twin

**Время:** 18.07.2025, 14:30:25  
**Тип:** analyze_project

## Анализ проекта: imperium

Claude, пожалуйста, проанализируй проект "imperium" и объясни:

1. Структуру проекта
2. Основное назначение
3. Используемые технологии
4. Ключевые файлы и их роль

Проект находится в папке: `imperium`

---

*Ответьте, создав или обновив файл `claude_response.md` в этой же папке.*
```

### Формат файла ответа

```markdown
# Ответ Claude - Анализ проекта imperium

**Время ответа:** 18.07.2025, 14:31:12
**Запрос:** analyze_project

## Структура проекта

Проект "imperium" представляет собой современное веб-приложение со следующей архитектурой:

```
imperium/
├── src/
│   ├── components/
│   ├── pages/
│   └── utils/
├── public/
├── package.json
└── README.md
```

## Основное назначение

[Детальный анализ проекта...]

## Технологии

- React.js для интерфейса
- Node.js для бэкенда
- Express.js для API
- MongoDB для базы данных

## Ключевые файлы

### package.json
Основной конфигурационный файл с зависимостями...

### src/App.js
Главный компонент приложения...

---

*Анализ завершен. Если нужны дополнительные детали, создайте новый запрос.*
```

## 🔧 Расширенная конфигурация MCP

### Для нескольких папок

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\ваш_пользователь\\Desktop",
        "C:\\Users\\ваш_пользователь\\Documents\\projects",
        "C:\\Users\\ваш_пользователь\\Desktop\\claude-requests"
      ]
    },
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ваш_токен"
      }
    }
  }
}
```

### Для разных операционных систем

#### Windows
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\%USERNAME%\\Desktop\\claude-requests"
      ]
    }
  }
}
```

#### macOS
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/$USER/Desktop/claude-requests"
      ]
    }
  }
}
```

#### Linux
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "$HOME/Desktop/claude-requests"
      ]
    }
  }
}
```

## 🚀 Автоматизация workflow

### Сценарий 1: Анализ нового проекта

1. **Команда:** "Открой проект new-app и объясни его структуру"
2. **Your Twin:**
   - Открывает проект в Cursor
   - Создает запрос анализа в `claude_request.md`
3. **Claude:**
   - Читает структуру проекта через MCP
   - Анализирует код и файлы
   - Создает детальный отчет в `claude_response.md`
4. **Your Twin:**
   - Читает ответ
   - Показывает уведомление
   - Может озвучить результат

### Сценарий 2: Поиск и объяснение функции

1. **Команда:** "Найди функцию handleSubmit и объясни как она работает"
2. **Your Twin:**
   - Ищет файлы с функцией
   - Открывает найденный файл
   - Создает запрос объяснения
3. **Claude:**
   - Анализирует функцию в контексте
   - Объясняет логику работы
   - Предлагает улучшения

### Сценарий 3: Создание документации

1. **Команда:** "Создай документацию для API endpoints"
2. **Your Twin:**
   - Сканирует проект на API маршруты
   - Создает запрос документации
3. **Claude:**
   - Анализирует все endpoints
   - Создает полную API документацию
   - Добавляет примеры использования

## 🔍 Мониторинг интеграции

### Проверка статуса MCP

1. Откройте Cursor
2. Перейдите в Developer Tools (Ctrl+Shift+I)
3. Проверьте консоль на ошибки MCP
4. Убедитесь, что сервер filesystem запущен

### Логи Your Twin

Проверьте файл `your-twin.log` на рабочем столе для:
- Статуса создания запросов
- Ошибок записи файлов
- Таймаутов ожидания ответов

### Тестирование интеграции

```javascript
// Ручное тестирование в консоли разработчика
const claudeIntegration = require('./src/claude-integration');

// Отправка тестового запроса
claudeIntegration.sendRequest({
  type: 'test',
  question: 'Проверка связи с Claude'
});
```

## 🛠️ Устранение неполадок

### Claude не видит файлы запросов

**Проблема:** MCP не настроен или путь неверный

**Решение:**
1. Проверьте путь в настройках MCP
2. Убедитесь, что папка `claude-requests` существует
3. Перезапустите Cursor
4. Проверьте права доступа к папке

### Your Twin не получает ответы

**Проблема:** Файловый watcher не работает

**Решение:**
1. Проверьте, что `chokidar` установлен
2. Убедитесь, что файл `claude_response.md` создается
3. Проверьте логи на ошибки чтения файлов

### Запросы создаются, но некорректно

**Проблема:** Неправильное форматирование запросов

**Решение:**
1. Проверьте файл `claude_request.md`
2. Убедитесь, что используется правильный markdown
3. Проверьте кодировку файла (должна быть UTF-8)

### MCP сервер не запускается

**Проблема:** Отсутствует пакет или неправильная конфигурация

**Решение:**
```bash
# Установите MCP сервер вручную
npm install -g @modelcontextprotocol/server-filesystem

# Проверьте версию
npx @modelcontextprotocol/server-filesystem --version
```

## 🎨 Кастомизация интеграции

### Изменение формата запросов

В файле `src/claude-integration.js` найдите метод `formatRequest()` и измените шаблон:

```javascript
formatRequest(request) {
  let content = `# 🤖 Your Twin → Claude\n\n`;
  content += `**📅 Время:** ${new Date().toLocaleString('ru-RU')}\n`;
  content += `**🎯 Тип:** ${request.type}\n\n`;
  
  // Ваш кастомный формат...
  
  return content;
}
```

### Добавление новых типов запросов

```javascript
// В command-parser.js
case 'CUSTOM_ANALYSIS':
  command.claudeRequest = {
    type: 'custom_analysis',
    target: match[1],
    question: `Выполни кастомный анализ: ${match[1]}`
  };
  break;

// В claude-integration.js
case 'custom_analysis':
  content += `## 🔬 Кастомный анализ\n\n`;
  content += `Выполни специальный анализ для: ${request.target}\n`;
  // Дополнительная логика...
  break;
```

### Автоматическое архивирование

```javascript
// Добавить в claude-integration.js
async archiveOldRequests() {
  const archiveFolder = path.join(this.sharedFolder, 'archive');
  await fs.mkdir(archiveFolder, { recursive: true });
  
  // Перемещение старых файлов в архив
  const files = await fs.readdir(this.sharedFolder);
  for (const file of files) {
    if (file.endsWith('.md') && file !== 'README.md') {
      const filePath = path.join(this.sharedFolder, file);
      const stats = await fs.stat(filePath);
      
      // Архивировать файлы старше 7 дней
      if (Date.now() - stats.mtime.getTime() > 7 * 24 * 60 * 60 * 1000) {
        const archivePath = path.join(archiveFolder, `${Date.now()}_${file}`);
        await fs.rename(filePath, archivePath);
      }
    }
  }
}
```

## 🚀 Продвинутые возможности

### Контекстные запросы

Используйте информацию о текущем проекте:

```javascript
// Получение контекста текущего проекта
getCurrentProjectContext() {
  return {
    projectName: this.getCurrentProjectName(),
    openFiles: this.getOpenFiles(),
    recentChanges: this.getRecentChanges(),
    gitBranch: this.getCurrentGitBranch()
  };
}

// Добавление контекста в запрос
formatRequestWithContext(request) {
  const context = this.getCurrentProjectContext();
  
  let content = this.formatRequest(request);
  content += `\n## 📋 Контекст\n\n`;
  content += `- **Проект:** ${context.projectName}\n`;
  content += `- **Открытые файлы:** ${context.openFiles.join(', ')}\n`;
  content += `- **Git ветка:** ${context.gitBranch}\n`;
  
  return content;
}
```

### Обратная связь с прогрессом

```javascript
// Показ прогресса выполнения
showProgress(stage, message) {
  const stages = ['creating_request', 'waiting_claude', 'processing_response'];
  const progress = (stages.indexOf(stage) + 1) / stages.length * 100;
  
  notifier.notify({
    title: `Your Twin - ${Math.round(progress)}%`,
    message: message,
    icon: this.getProgressIcon(stage)
  });
}
```

---

## 📚 Дополнительные ресурсы

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Cursor MCP Setup Guide](https://cursor.sh/mcp)
- [Claude Desktop Documentation](https://claude.ai/desktop)
- [Your Twin GitHub Repository](https://github.com/pay4ok-exe/your-twin)

## 🤝 Поддержка

Если у вас возникли проблемы с настройкой интеграции:

1. Проверьте все пути и конфигурации
2. Изучите логи приложения
3. Создайте issue в GitHub репозитории
4. Опишите шаги воспроизведения проблемы

---

**Успешной интеграции! 🚀**