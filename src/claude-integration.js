const fs = require('fs').promises;
const path = require('path');
const chokidar = require('chokidar');
const config = require('./config');
const notifier = require('node-notifier');

class ClaudeIntegration {
  constructor() {
    this.sharedFolder = config.CLAUDE_INTEGRATION.SHARED_FOLDER;
    this.requestFile = path.join(this.sharedFolder, config.CLAUDE_INTEGRATION.REQUEST_FILE);
    this.responseFile = path.join(this.sharedFolder, config.CLAUDE_INTEGRATION.RESPONSE_FILE);
    this.isWaitingForResponse = false;
    this.responseWatcher = null;
    
    this.init();
  }

  async init() {
    // Создаем папку для обмена с Claude если не существует
    try {
      await fs.mkdir(this.sharedFolder, { recursive: true });
      console.log(`📁 Папка для Claude создана: ${this.sharedFolder}`);
      
      // Создаем инструкцию для пользователя
      await this.createInstructions();
      
    } catch (error) {
      console.error('❌ Ошибка создания папки для Claude:', error);
    }
  }

  async createInstructions() {
    const instructionsPath = path.join(this.sharedFolder, 'README.md');
    const instructions = `# Your Twin - Claude Integration

## Как это работает

1. Your Twin создает файлы запросов в эту папку
2. Claude в Cursor через MCP filesystem может читать эти файлы
3. Claude отвечает, создавая файл ответа
4. Your Twin читает ответ и может его озвучить

## Файлы

- \`claude_request.md\` - запросы от Your Twin к Claude
- \`claude_response.md\` - ответы от Claude
- \`project_analysis/\` - анализы проектов

## Настройка MCP в Cursor

Убедитесь, что в вашем \`settings.json\` Cursor есть:

\`\`\`json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "${this.sharedFolder.replace(/\\/g, '\\\\')}"
      ]
    }
  }
}
\`\`\`

Теперь Claude сможет видеть файлы в этой папке!
`;

    try {
      await fs.writeFile(instructionsPath, instructions, 'utf8');
    } catch (error) {
      console.error('❌ Ошибка создания инструкций:', error);
    }
  }

  async sendRequest(request) {
    console.log(`🤖 Отправляю запрос Claude:`, request);
    
    try {
      // Создаем структурированный запрос
      const requestContent = this.formatRequest(request);
      
      // Записываем запрос в файл
      await fs.writeFile(this.requestFile, requestContent, 'utf8');
      
      console.log(`✅ Запрос записан в: ${this.requestFile}`);
      
      // Показываем уведомление
      notifier.notify({
        title: 'Your Twin',
        message: 'Запрос отправлен Claude. Откройте Cursor для ответа.',
        icon: path.join(__dirname, '..', 'assets', 'icon.png'),
        sound: true,
        wait: false
      });
      
      // Начинаем ждать ответ
      this.waitForResponse();
      
    } catch (error) {
      console.error('❌ Ошибка отправки запроса:', error);
    }
  }

  formatRequest(request) {
    const timestamp = new Date().toLocaleString('ru-RU');
    
    let content = `# Запрос от Your Twin\n\n`;
    content += `**Время:** ${timestamp}\n`;
    content += `**Тип:** ${request.type}\n\n`;
    
    switch (request.type) {
      case 'analyze_project':
        content += `## Анализ проекта: ${request.projectName}\n\n`;
        content += `Claude, пожалуйста, проанализируй проект "${request.projectName}" и объясни:\n\n`;
        content += `1. Структуру проекта\n`;
        content += `2. Основное назначение\n`;
        content += `3. Используемые технологии\n`;
        content += `4. Ключевые файлы и их роль\n\n`;
        content += `Проект находится в папке: \`${request.projectName}\`\n\n`;
        break;
        
      case 'explain':
        content += `## Объяснение\n\n`;
        content += `${request.question}\n\n`;
        break;
        
      case 'general_question':
        content += `## Вопрос\n\n`;
        content += `${request.question}\n\n`;
        break;
        
      default:
        content += `${request.question}\n\n`;
    }
    
    content += `---\n\n`;
    content += `*Ответьте, создав или обновив файл \`claude_response.md\` в этой же папке.*\n`;
    
    return content;
  }

  waitForResponse() {
    if (this.isWaitingForResponse) {
      return;
    }
    
    console.log('⏳ Жду ответ от Claude...');
    this.isWaitingForResponse = true;
    
    // Наблюдаем за изменениями в файле ответов
    this.responseWatcher = chokidar.watch(this.responseFile, {
      persistent: true,
      ignoreInitial: true
    });
    
    this.responseWatcher.on('add', () => this.handleResponse());
    this.responseWatcher.on('change', () => this.handleResponse());
    
    // Таймаут на ожидание ответа (5 минут)
    setTimeout(() => {
      if (this.isWaitingForResponse) {
        this.stopWaitingForResponse();
        console.log('⏰ Таймаут ожидания ответа от Claude');
      }
    }, 5 * 60 * 1000);
  }

  async handleResponse() {
    if (!this.isWaitingForResponse) {
      return;
    }
    
    try {
      console.log('📨 Получен ответ от Claude!');
      
      const response = await fs.readFile(this.responseFile, 'utf8');
      
      // Показываем уведомление
      notifier.notify({
        title: 'Your Twin - Ответ получен',
        message: 'Claude ответил на ваш запрос!',
        icon: path.join(__dirname, '..', 'assets', 'icon.png'),
        sound: true,
        wait: false
      });
      
      // Логируем ответ
      console.log('📝 Ответ Claude:', response.substring(0, 200) + '...');
      
      // Можно добавить текст-в-речь здесь
      // await this.speakResponse(response);
      
    } catch (error) {
      console.error('❌ Ошибка чтения ответа:', error);
    } finally {
      this.stopWaitingForResponse();
    }
  }

  stopWaitingForResponse() {
    this.isWaitingForResponse = false;
    
    if (this.responseWatcher) {
      this.responseWatcher.close();
      this.responseWatcher = null;
    }
  }

  async speakResponse(response) {
    // TODO: Реализовать текст-в-речь
    // const say = require('say');
    // 
    // // Извлекаем основной текст ответа
    // const cleanText = response
    //   .replace(/#+\s*/g, '') // Убираем заголовки markdown
    //   .replace(/\*\*(.*?)\*\*/g, '$1') // Убираем жирный текст
    //   .replace(/\*(.*?)\*/g, '$1') // Убираем курсив
    //   .replace(/`(.*?)`/g, '$1') // Убираем код
    //   .substring(0, 500); // Ограничиваем длину
    // 
    // say.speak(cleanText, 'Microsoft Irina Desktop', 1.0);
    
    console.log('🔊 Озвучивание ответа (функция в разработке)');
  }

  // Метод для создания запроса анализа конкретного файла
  async analyzeFile(filePath) {
    const fileName = path.basename(filePath);
    
    const request = {
      type: 'analyze_file',
      fileName,
      question: `Проанализируй файл ${fileName} и объясни его назначение и содержимое`
    };
    
    await this.sendRequest(request);
  }

  // Метод для создания запроса сравнения файлов
  async compareFiles(file1, file2) {
    const request = {
      type: 'compare_files',
      files: [file1, file2],
      question: `Сравни файлы ${path.basename(file1)} и ${path.basename(file2)}. Найди различия и объясни их значение.`
    };
    
    await this.sendRequest(request);
  }
}

module.exports = ClaudeIntegration;