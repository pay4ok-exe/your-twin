const config = require('./config');
const path = require('path');

class CommandParser {
  constructor() {
    this.patterns = config.COMMAND_PATTERNS;
  }

  parse(text) {
    const normalizedText = text.toLowerCase().trim();
    console.log(`🔍 Парсинг команды: "${normalizedText}"`);

    // Проверяем паттерны команд
    for (const [commandType, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        const match = normalizedText.match(pattern);
        if (match) {
          return this.buildCommand(commandType, match, normalizedText);
        }
      }
    }

    // Если точная команда не найдена, пытаемся определить намерение
    return this.parseIntent(normalizedText);
  }

  buildCommand(type, match, originalText) {
    const command = {
      type,
      originalText,
      parameters: match.slice(1), // Убираем первый элемент (полное совпадение)
      systemAction: null,
      claudeRequest: null
    };

    switch (type) {
      case 'OPEN_PROJECT':
        const projectName = match[1];
        command.systemAction = {
          type: 'open_project',
          projectName,
          path: path.join(config.USER_FOLDERS.PROJECTS, projectName)
        };
        command.claudeRequest = {
          type: 'analyze_project',
          projectName,
          question: `Проанализируй проект ${projectName} и объясни его структуру`
        };
        break;

      case 'EXPLAIN_CODE':
        const target = match[1];
        command.claudeRequest = {
          type: 'explain',
          target,
          question: `Объясни: ${target}`
        };
        break;

      case 'CREATE_FILE':
        const fileName = match[1];
        command.systemAction = {
          type: 'create_file',
          fileName,
          path: path.join(config.USER_FOLDERS.PROJECTS, fileName)
        };
        break;

      case 'OPEN_FOLDER':
        const folderName = match[1];
        command.systemAction = {
          type: 'open_folder',
          folderName,
          path: this.resolveFolderPath(folderName)
        };
        break;

      case 'SEARCH_FILES':
        const searchTerm = match[1];
        command.systemAction = {
          type: 'search_files',
          searchTerm,
          path: config.USER_FOLDERS.PROJECTS
        };
        break;
    }

    console.log(`✅ Команда распознана:`, command);
    return command;
  }

  parseIntent(text) {
    // Определяем намерение, если точная команда не найдена
    
    // Ключевые слова для открытия
    if (this.containsWords(text, ['открой', 'открыть', 'запусти', 'open'])) {
      // Ищем название проекта или папки
      const words = text.split(' ');
      const targetIndex = words.findIndex(word => 
        ['открой', 'открыть', 'запусти', 'open'].includes(word)
      );
      
      if (targetIndex >= 0 && targetIndex < words.length - 1) {
        const target = words.slice(targetIndex + 1).join(' ');
        
        return {
          type: 'OPEN_UNKNOWN',
          originalText: text,
          parameters: [target],
          systemAction: {
            type: 'open_smart',
            target
          },
          claudeRequest: {
            type: 'help_open',
            target,
            question: `Помоги открыть: ${target}`
          }
        };
      }
    }

    // Ключевые слова для объяснения
    if (this.containsWords(text, ['объясни', 'расскажи', 'что', 'как', 'explain', 'what', 'how'])) {
      return {
        type: 'EXPLAIN_GENERAL',
        originalText: text,
        parameters: [text],
        claudeRequest: {
          type: 'explain_general',
          question: text
        }
      };
    }

    // Если ничего не распознано, отправляем как общий вопрос Claude
    return {
      type: 'GENERAL_QUESTION',
      originalText: text,
      parameters: [text],
      claudeRequest: {
        type: 'general_question',
        question: text
      }
    };
  }

  containsWords(text, words) {
    return words.some(word => text.includes(word));
  }

  resolveFolderPath(folderName) {
    const lowerName = folderName.toLowerCase();
    
    // Специальные папки
    if (lowerName.includes('рабочий') || lowerName.includes('desktop')) {
      return config.USER_FOLDERS.DESKTOP;
    }
    if (lowerName.includes('загрузки') || lowerName.includes('downloads')) {
      return config.USER_FOLDERS.DOWNLOADS;
    }
    if (lowerName.includes('документы') || lowerName.includes('documents')) {
      return config.USER_FOLDERS.DOCUMENTS;
    }
    
    // По умолчанию ищем в папке проектов
    return path.join(config.USER_FOLDERS.PROJECTS, folderName);
  }
}

module.exports = CommandParser;