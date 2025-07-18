const { exec, spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const config = require('./config');
const robot = require('robotjs');
const notifier = require('node-notifier');

class SystemController {
  constructor() {
    this.platform = os.platform();
  }

  async execute(action) {
    console.log(`⚡ Выполняю действие:`, action);
    
    try {
      switch (action.type) {
        case 'open_project':
          await this.openProject(action.projectName, action.path);
          break;
        case 'create_file':
          await this.createFile(action.fileName, action.path);
          break;
        case 'open_folder':
          await this.openFolder(action.path);
          break;
        case 'search_files':
          await this.searchFiles(action.searchTerm, action.path);
          break;
        case 'open_smart':
          await this.openSmart(action.target);
          break;
        default:
          console.log(`❓ Неизвестное действие: ${action.type}`);
      }
    } catch (error) {
      console.error(`❌ Ошибка выполнения действия:`, error);
      this.showNotification('Ошибка', `Не удалось выполнить: ${action.type}`);
    }
  }

  async openProject(projectName, projectPath) {
    console.log(`📂 Открываю проект: ${projectName}`);
    
    // Проверяем существование проекта
    try {
      await fs.access(projectPath);
    } catch (error) {
      console.log(`⚠️ Папка проекта не найдена: ${projectPath}`);
      
      // Ищем проект в других местах
      const foundPath = await this.findProject(projectName);
      if (foundPath) {
        projectPath = foundPath;
      } else {
        this.showNotification('Проект не найден', `Не могу найти проект: ${projectName}`);
        return;
      }
    }

    // Открываем проект в Cursor
    await this.openCursorWithProject(projectPath);
    this.showNotification('Проект открыт', `Проект ${projectName} открыт в Cursor`);
  }

  async findProject(projectName) {
    const searchPaths = [
      config.USER_FOLDERS.DESKTOP,
      config.USER_FOLDERS.DOCUMENTS,
      path.join(config.USER_FOLDERS.DESKTOP, 'projects'),
      path.join(config.USER_FOLDERS.DOCUMENTS, 'projects')
    ];

    for (const searchPath of searchPaths) {
      const possiblePath = path.join(searchPath, projectName);
      try {
        await fs.access(possiblePath);
        console.log(`✅ Проект найден: ${possiblePath}`);
        return possiblePath;
      } catch (error) {
        // Проект не найден в этом пути, продолжаем поиск
      }
    }

    return null;
  }

  async openCursorWithProject(projectPath) {
    const cursorPath = this.getApplicationPath('CURSOR');
    
    if (this.platform === 'win32') {
      exec(`"${cursorPath}" "${projectPath}"`);
    } else if (this.platform === 'darwin') {
      exec(`open -a "${cursorPath}" "${projectPath}"`);
    } else {
      exec(`"${cursorPath}" "${projectPath}"`);
    }
  }

  async openCursor() {
    console.log('🖱️ Открываю Cursor...');
    const cursorPath = this.getApplicationPath('CURSOR');
    
    if (this.platform === 'win32') {
      exec(`"${cursorPath}"`);
    } else if (this.platform === 'darwin') {
      exec(`open -a "${cursorPath}"`);
    } else {
      exec(`"${cursorPath}"`);
    }
  }

  async openClaude() {
    console.log('🤖 Открываю Claude...');
    const claudePath = this.getApplicationPath('CLAUDE');
    
    if (this.platform === 'win32') {
      exec(`"${claudePath}"`);
    } else if (this.platform === 'darwin') {
      exec(`open -a "${claudePath}"`);
    } else {
      exec(`"${claudePath}"`);
    }
  }

  async createFile(fileName, filePath) {
    console.log(`📄 Создаю файл: ${fileName}`);
    
    // Создаем директорию если не существует
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    // Создаем файл
    await fs.writeFile(filePath, '', 'utf8');
    
    this.showNotification('Файл создан', `Создан файл: ${fileName}`);
    
    // Открываем файл в Cursor
    await this.openCursorWithProject(filePath);
  }

  async openFolder(folderPath) {
    console.log(`📁 Открываю папку: ${folderPath}`);
    
    try {
      await fs.access(folderPath);
    } catch (error) {
      this.showNotification('Папка не найдена', `Не могу найти папку: ${folderPath}`);
      return;
    }

    if (this.platform === 'win32') {
      exec(`explorer "${folderPath}"`);
    } else if (this.platform === 'darwin') {
      exec(`open "${folderPath}"`);
    } else {
      exec(`xdg-open "${folderPath}"`);
    }

    this.showNotification('Папка открыта', `Открыта папка: ${path.basename(folderPath)}`);
  }

  async searchFiles(searchTerm, searchPath) {
    console.log(`🔍 Ищу файлы: ${searchTerm} в ${searchPath}`);
    
    try {
      const files = await this.findFiles(searchTerm, searchPath);
      
      if (files.length === 0) {
        this.showNotification('Файлы не найдены', `Не найдено файлов по запросу: ${searchTerm}`);
        return;
      }

      console.log(`✅ Найдено файлов: ${files.length}`);
      
      // Открываем первый найденный файл
      if (files.length > 0) {
        await this.openCursorWithProject(files[0]);
        this.showNotification('Файл найден', `Открыт файл: ${path.basename(files[0])}`);
      }
      
    } catch (error) {
      console.error('❌ Ошибка поиска файлов:', error);
      this.showNotification('Ошибка поиска', 'Не удалось выполнить поиск файлов');
    }
  }

  async findFiles(searchTerm, searchPath) {
    const files = [];
    
    async function searchRecursive(dir) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            await searchRecursive(fullPath);
          } else if (entry.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Игнорируем ошибки доступа к папкам
      }
    }
    
    await searchRecursive(searchPath);
    return files;
  }

  async openSmart(target) {
    console.log(`🧠 Умное открытие: ${target}`);
    
    // Пытаемся найти наилучшее совпадение
    const searchPaths = [
      config.USER_FOLDERS.DESKTOP,
      config.USER_FOLDERS.PROJECTS,
      config.USER_FOLDERS.DOCUMENTS
    ];

    for (const basePath of searchPaths) {
      try {
        const entries = await fs.readdir(basePath, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.name.toLowerCase().includes(target.toLowerCase())) {
            const fullPath = path.join(basePath, entry.name);
            
            if (entry.isDirectory()) {
              await this.openCursorWithProject(fullPath);
            } else {
              await this.openCursorWithProject(fullPath);
            }
            
            this.showNotification('Найдено и открыто', `Открыто: ${entry.name}`);
            return;
          }
        }
      } catch (error) {
        // Продолжаем поиск в других папках
      }
    }

    this.showNotification('Не найдено', `Не удалось найти: ${target}`);
  }

  getApplicationPath(appName) {
    const app = config.APPLICATIONS[appName];
    
    if (this.platform === 'win32') {
      return app.windows;
    } else if (this.platform === 'darwin') {
      return app.mac;
    } else {
      return app.linux;
    }
  }

  showNotification(title, message) {
    notifier.notify({
      title: `Your Twin - ${title}`,
      message,
      icon: path.join(__dirname, '..', 'assets', 'icon.png'),
      sound: false,
      wait: false
    });
  }
}

module.exports = SystemController;