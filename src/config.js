const path = require('path');
const os = require('os');

module.exports = {
  // Горячие клавиши
  HOTKEYS: {
    VOICE_ACTIVATION: 'CommandOrControl+Shift+V',
    QUICK_CURSOR: 'CommandOrControl+Shift+C',
    QUICK_CLAUDE: 'CommandOrControl+Shift+A'
  },

  // Пути к приложениям
  APPLICATIONS: {
    CURSOR: {
      windows: 'C:\\Users\\pay4o\\AppData\\Local\\Programs\\cursor\\Cursor.exe',
      mac: '/Applications/Cursor.app',
      linux: '/usr/bin/cursor'
    },
    CLAUDE: {
      windows: 'C:\\Users\\pay4o\\AppData\\Local\\Programs\\Claude\\Claude.exe',
      mac: '/Applications/Claude.app',
      linux: '/usr/bin/claude'
    }
  },

  // Пути для интеграции с Claude через файлы
  CLAUDE_INTEGRATION: {
    // Папка для обмена файлами с Claude (должна быть в MCP filesystem)
    SHARED_FOLDER: path.join(os.homedir(), 'Desktop', 'claude-requests'),
    REQUEST_FILE: 'claude_request.md',
    RESPONSE_FILE: 'claude_response.md',
    TEMP_FOLDER: path.join(os.homedir(), 'Desktop', 'your-twin-temp')
  },

  // Настройки распознавания речи
  VOICE: {
    LANGUAGE: 'ru-RU',
    ALTERNATIVE_LANGUAGE: 'en-US',
    TIMEOUT: 5000, // 5 секунд
    CONFIDENCE_THRESHOLD: 0.7
  },

  // Рабочие папки пользователя
  USER_FOLDERS: {
    DESKTOP: path.join(os.homedir(), 'Desktop'),
    DOWNLOADS: path.join(os.homedir(), 'Downloads'),
    DOCUMENTS: path.join(os.homedir(), 'Documents'),
    PROJECTS: path.join(os.homedir(), 'Desktop') // Можно изменить на свою папку с проектами
  },

  // Команды и их паттерны
  COMMAND_PATTERNS: {
    OPEN_PROJECT: [
      /открой проект (\w+)/i,
      /открыть проект (\w+)/i,
      /запусти проект (\w+)/i,
      /open project (\w+)/i
    ],
    EXPLAIN_CODE: [
      /объясни (.*)/i,
      /расскажи про (.*)/i,
      /что делает (.*)/i,
      /explain (.*)/i
    ],
    CREATE_FILE: [
      /создай файл (.*)/i,
      /создать файл (.*)/i,
      /новый файл (.*)/i,
      /create file (.*)/i
    ],
    OPEN_FOLDER: [
      /открой папку (.*)/i,
      /открыть папку (.*)/i,
      /показать папку (.*)/i,
      /open folder (.*)/i
    ],
    SEARCH_FILES: [
      /найди файл (.*)/i,
      /найти файл (.*)/i,
      /поиск файла (.*)/i,
      /search file (.*)/i
    ]
  },

  // Настройки логирования
  LOGGING: {
    LEVEL: 'info',
    FILE: path.join(os.homedir(), 'Desktop', 'your-twin.log')
  }
};