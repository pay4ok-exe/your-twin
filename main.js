const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const VoiceListener = require('./src/voice-listener');
const CommandParser = require('./src/command-parser');
const SystemController = require('./src/system-controller');
const ClaudeIntegration = require('./src/claude-integration');
const config = require('./src/config');

class YourTwin {
  constructor() {
    this.mainWindow = null;
    this.tray = null;
    this.voiceListener = new VoiceListener();
    this.commandParser = new CommandParser();
    this.systemController = new SystemController();
    this.claudeIntegration = new ClaudeIntegration();
    this.isListening = false;
  }

  async init() {
    console.log('🤖 Your Twin запускается...');
    
    // Создаем главное окно
    this.createMainWindow();
    
    // Создаем трей
    this.createTray();
    
    // Регистрируем горячие клавиши
    this.registerGlobalShortcuts();
    
    // Настраиваем обработчики событий
    this.setupEventHandlers();
    
    console.log('✅ Your Twin готов к работе!');
    console.log(`🎤 Нажми ${config.HOTKEYS.VOICE_ACTIVATION} для активации голосовых команд`);
  }

  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 400,
      height: 300,
      show: false,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    this.mainWindow.loadFile('src/ui/index.html');
  }

  createTray() {
    const icon = nativeImage.createFromPath(path.join(__dirname, 'assets/icon.png'));
    this.tray = new Tray(icon.resize({ width: 16, height: 16 }));
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Your Twin',
        enabled: false
      },
      { type: 'separator' },
      {
        label: this.isListening ? '🎤 Слушаю...' : '⏸️ В ожидании',
        enabled: false
      },
      {
        label: 'Показать окно',
        click: () => this.showMainWindow()
      },
      {
        label: 'Настройки',
        click: () => this.openSettings()
      },
      { type: 'separator' },
      {
        label: 'Выход',
        click: () => app.quit()
      }
    ]);
    
    this.tray.setContextMenu(contextMenu);
    this.tray.setToolTip('Your Twin - AI Assistant');
  }

  registerGlobalShortcuts() {
    // Главная горячая клавиша для активации
    globalShortcut.register(config.HOTKEYS.VOICE_ACTIVATION, () => {
      this.toggleVoiceListening();
    });

    // Быстрые команды
    globalShortcut.register(config.HOTKEYS.QUICK_CURSOR, () => {
      this.systemController.openCursor();
    });

    globalShortcut.register(config.HOTKEYS.QUICK_CLAUDE, () => {
      this.systemController.openClaude();
    });
  }

  setupEventHandlers() {
    // Обработка распознанной речи
    this.voiceListener.on('speech', async (text) => {
      console.log(`🗣️ Распознано: "${text}"`);
      await this.handleVoiceCommand(text);
    });

    // Обработка ошибок распознавания
    this.voiceListener.on('error', (error) => {
      console.error('❌ Ошибка распознавания речи:', error);
      this.stopListening();
    });

    // Обработка окончания прослушивания
    this.voiceListener.on('end', () => {
      this.stopListening();
    });
  }

  async handleVoiceCommand(text) {
    try {
      // Парсим команду
      const command = this.commandParser.parse(text);
      console.log('📝 Команда:', command);

      if (!command) {
        console.log('❓ Команда не распознана');
        return;
      }

      // Выполняем системные действия
      if (command.systemAction) {
        await this.systemController.execute(command.systemAction);
      }

      // Отправляем запрос Claude если нужно
      if (command.claudeRequest) {
        await this.claudeIntegration.sendRequest(command.claudeRequest);
      }

    } catch (error) {
      console.error('❌ Ошибка обработки команды:', error);
    }
  }

  toggleVoiceListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  startListening() {
    console.log('🎤 Начинаю прослушивание...');
    this.isListening = true;
    this.voiceListener.start();
    this.showMainWindow();
    this.updateTrayStatus();
  }

  stopListening() {
    console.log('⏸️ Останавливаю прослушивание');
    this.isListening = false;
    this.voiceListener.stop();
    this.hideMainWindow();
    this.updateTrayStatus();
  }

  showMainWindow() {
    if (this.mainWindow) {
      this.mainWindow.show();
      this.mainWindow.center();
    }
  }

  hideMainWindow() {
    if (this.mainWindow) {
      this.mainWindow.hide();
    }
  }

  updateTrayStatus() {
    if (this.tray) {
      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Your Twin',
          enabled: false
        },
        { type: 'separator' },
        {
          label: this.isListening ? '🎤 Слушаю...' : '⏸️ В ожидании',
          enabled: false
        },
        {
          label: 'Показать окно',
          click: () => this.showMainWindow()
        },
        {
          label: 'Настройки',
          click: () => this.openSettings()
        },
        { type: 'separator' },
        {
          label: 'Выход',
          click: () => app.quit()
        }
      ]);
      this.tray.setContextMenu(contextMenu);
    }
  }

  openSettings() {
    // TODO: Открыть окно настроек
    console.log('⚙️ Открытие настроек...');
  }
}

// Создание экземпляра приложения
const yourTwin = new YourTwin();

// События приложения
app.whenReady().then(() => {
  yourTwin.init();
});

app.on('window-all-closed', () => {
  // Не закрываем приложение, оставляем в трее
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    yourTwin.createMainWindow();
  }
});

app.on('will-quit', () => {
  // Отменяем регистрацию всех горячих клавиш
  globalShortcut.unregisterAll();
});

console.log('🚀 Your Twin загружается...');