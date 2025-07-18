class YourTwinUI {
    constructor() {
        this.isListening = false;
        this.elements = {
            status: document.getElementById('status'),
            listeningIndicator: document.getElementById('listeningIndicator'),
            commandText: document.getElementById('commandText'),
            commandHint: document.getElementById('commandHint'),
            toggleBtn: document.getElementById('toggleBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            closeBtn: document.getElementById('closeBtn'),
            container: document.querySelector('.container')
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUI();
        console.log('🎨 Your Twin UI initialized');
    }

    setupEventListeners() {
        // Кнопки управления
        this.elements.toggleBtn.addEventListener('click', () => {
            this.toggleListening();
        });

        this.elements.settingsBtn.addEventListener('click', () => {
            this.openSettings();
        });

        this.elements.closeBtn.addEventListener('click', () => {
            this.hide();
        });

        // Если это Electron окружение, подключаемся к IPC
        if (typeof require !== 'undefined') {
            try {
                const { ipcRenderer } = require('electron');
                
                // Слушаем события от главного процесса
                ipcRenderer.on('listening-started', () => {
                    this.setListening(true);
                });
                
                ipcRenderer.on('listening-stopped', () => {
                    this.setListening(false);
                });
                
                ipcRenderer.on('command-recognized', (event, command) => {
                    this.showCommand(command);
                });
                
                ipcRenderer.on('command-executing', (event, action) => {
                    this.showProcessing(action);
                });
                
                ipcRenderer.on('command-completed', (event, result) => {
                    this.showSuccess(result);
                });
                
            } catch (error) {
                console.log('📱 Не Electron окружение, используем демо режим');
                this.setupDemoMode();
            }
        } else {
            this.setupDemoMode();
        }
    }

    setupDemoMode() {
        // Демо режим для тестирования в браузере
        console.log('🎭 Запуск демо режима');
        
        // Симулируем активность каждые 5 секунд
        setInterval(() => {
            if (!this.isListening) {
                this.simulateActivity();
            }
        }, 5000);
    }

    simulateActivity() {
        const activities = [
            { command: 'Открыть проект imperium', type: 'project' },
            { command: 'Объяснить код main.js', type: 'explain' },
            { command: 'Создать файл readme.md', type: 'create' },
            { command: 'Найти файл config', type: 'search' }
        ];
        
        const activity = activities[Math.floor(Math.random() * activities.length)];
        
        this.setListening(true);
        
        setTimeout(() => {
            this.showCommand(activity.command);
        }, 1000);
        
        setTimeout(() => {
            this.showProcessing(`Выполняю: ${activity.command}`);
        }, 2000);
        
        setTimeout(() => {
            this.showSuccess('Команда выполнена успешно!');
            this.setListening(false);
        }, 3500);
    }

    toggleListening() {
        if (typeof require !== 'undefined') {
            try {
                const { ipcRenderer } = require('electron');
                ipcRenderer.send('toggle-listening');
            } catch (error) {
                // Демо режим
                this.setListening(!this.isListening);
            }
        } else {
            this.setListening(!this.isListening);
        }
    }

    setListening(listening) {
        this.isListening = listening;
        this.updateUI();
        
        if (listening) {
            this.elements.commandText.textContent = 'Слушаю... говорите команду';
            this.elements.commandHint.textContent = 'Скажите четко и ясно';
            this.elements.container.classList.add('listening');
            this.elements.listeningIndicator.classList.add('active');
            this.elements.toggleBtn.querySelector('.btn-text').textContent = 'Стоп';
            this.elements.toggleBtn.querySelector('.btn-icon').textContent = '⏹️';
        } else {
            this.elements.commandText.textContent = 'Нажмите Ctrl+Shift+V для активации';
            this.elements.commandHint.textContent = 'Скажите: "Открой проект imperium" или "Объясни код"';
            this.elements.container.classList.remove('listening', 'processing', 'success');
            this.elements.listeningIndicator.classList.remove('active');
            this.elements.toggleBtn.querySelector('.btn-text').textContent = 'Слушать';
            this.elements.toggleBtn.querySelector('.btn-icon').textContent = '🎤';
        }
    }

    showCommand(command) {
        this.elements.commandText.textContent = `Распознано: "${command}"`;
        this.elements.commandHint.textContent = 'Обрабатываю команду...';
        this.elements.container.classList.remove('listening');
        this.elements.container.classList.add('processing');
    }

    showProcessing(action) {
        this.elements.commandText.textContent = action;
        this.elements.commandHint.textContent = 'Пожалуйста, подождите...';
        this.elements.container.classList.add('processing');
    }

    showSuccess(message) {
        this.elements.commandText.textContent = message;
        this.elements.commandHint.textContent = 'Готов к следующей команде';
        this.elements.container.classList.remove('processing');
        this.elements.container.classList.add('success');
        
        // Убираем статус успеха через 3 секунды
        setTimeout(() => {
            if (!this.isListening) {
                this.elements.container.classList.remove('success');
                this.elements.commandText.textContent = 'Нажмите Ctrl+Shift+V для активации';
                this.elements.commandHint.textContent = 'Скажите: "Открой проект imperium" или "Объясни код"';
            }
        }, 3000);
    }

    showError(error) {
        this.elements.commandText.textContent = `Ошибка: ${error}`;
        this.elements.commandHint.textContent = 'Попробуйте еще раз';
        this.elements.container.classList.remove('listening', 'processing', 'success');
        
        setTimeout(() => {
            if (!this.isListening) {
                this.setListening(false);
            }
        }, 3000);
    }

    updateUI() {
        // Обновляем статус
        const statusText = this.elements.status.querySelector('.status-text');
        if (this.isListening) {
            statusText.textContent = 'Слушаю';
            this.elements.status.classList.add('listening');
        } else {
            statusText.textContent = 'В ожидании';
            this.elements.status.classList.remove('listening');
        }
    }

    openSettings() {
        console.log('⚙️ Открытие настроек...');
        
        if (typeof require !== 'undefined') {
            try {
                const { ipcRenderer } = require('electron');
                ipcRenderer.send('open-settings');
            } catch (error) {
                // Демо режим
                alert('Настройки откроются в будущей версии!');
            }
        } else {
            alert('Настройки откроются в будущей версии!');
        }
    }

    hide() {
        console.log('👻 Скрытие окна...');
        
        if (typeof require !== 'undefined') {
            try {
                const { ipcRenderer } = require('electron');
                ipcRenderer.send('hide-window');
            } catch (error) {
                // Демо режим
                document.body.style.opacity = '0';
                setTimeout(() => {
                    document.body.style.opacity = '1';
                }, 1000);
            }
        } else {
            document.body.style.opacity = '0';
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 1000);
        }
    }

    // Публичные методы для взаимодействия с главным процессом
    setStatus(status, message) {
        this.elements.commandText.textContent = message;
        this.elements.container.className = `container ${status}`;
    }

    showNotification(title, message) {
        // Можно добавить уведомления внутри UI
        console.log(`📢 ${title}: ${message}`);
    }
}

// Инициализируем UI когда DOM загружен
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.yourTwinUI = new YourTwinUI();
    });
} else {
    window.yourTwinUI = new YourTwinUI();
}

// Экспортируем для использования в Electron
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YourTwinUI;
}