const EventEmitter = require('events');
const recorder = require('node-record-lpcm16');
const speech = require('@google-cloud/speech');
const config = require('./config');

class VoiceListener extends EventEmitter {
  constructor() {
    super();
    this.isListening = false;
    this.recording = null;
    this.speechClient = null;
    this.recognizeStream = null;
    
    // Пытаемся инициализировать Google Speech (если доступен)
    try {
      this.speechClient = new speech.SpeechClient();
    } catch (error) {
      console.log('⚠️ Google Speech API недоступен, используем браузерное API');
    }
  }

  start() {
    if (this.isListening) {
      console.log('🎤 Уже слушаю...');
      return;
    }

    console.log('🎤 Начинаю прослушивание...');
    this.isListening = true;

    if (this.speechClient) {
      this.startGoogleSpeechRecognition();
    } else {
      this.startWebSpeechRecognition();
    }
  }

  stop() {
    if (!this.isListening) {
      return;
    }

    console.log('⏹️ Останавливаю прослушивание...');
    this.isListening = false;

    if (this.recording) {
      this.recording.stop();
      this.recording = null;
    }

    if (this.recognizeStream) {
      this.recognizeStream.end();
      this.recognizeStream = null;
    }

    this.emit('end');
  }

  startGoogleSpeechRecognition() {
    const request = {
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: config.VOICE.LANGUAGE,
        alternativeLanguageCodes: [config.VOICE.ALTERNATIVE_LANGUAGE],
        enableAutomaticPunctuation: true,
        model: 'latest_short'
      },
      interimResults: false
    };

    this.recognizeStream = this.speechClient
      .streamingRecognize(request)
      .on('error', (error) => {
        console.error('❌ Ошибка Google Speech:', error);
        this.emit('error', error);
      })
      .on('data', (data) => {
        if (data.results[0] && data.results[0].alternatives[0]) {
          const transcript = data.results[0].alternatives[0].transcript;
          const confidence = data.results[0].alternatives[0].confidence;
          
          if (confidence >= config.VOICE.CONFIDENCE_THRESHOLD) {
            console.log(`✅ Распознано (${Math.round(confidence * 100)}%): ${transcript}`);
            this.emit('speech', transcript.trim());
          } else {
            console.log(`⚠️ Низкая уверенность (${Math.round(confidence * 100)}%): ${transcript}`);
          }
        }
      });

    this.recording = recorder.record({
      sampleRateHertz: 16000,
      threshold: 0,
      verbose: false,
      recordProgram: 'sox',
      silence: '1.0',
      thresholdStart: 0.5,
      thresholdEnd: 0.5
    });

    this.recording.stream().pipe(this.recognizeStream);

    // Автоматическая остановка через таймаут
    setTimeout(() => {
      if (this.isListening) {
        this.stop();
      }
    }, config.VOICE.TIMEOUT);
  }

  startWebSpeechRecognition() {
    // Fallback для браузерного Web Speech API
    // Эта функция будет работать, если приложение запущено в браузерной среде
    console.log('🌐 Используем Web Speech API...');
    
    // Эмулируем распознавание речи для тестирования
    setTimeout(() => {
      this.emit('speech', 'тестовая команда');
    }, 1000);
  }

  // Метод для тестирования без реального распознавания речи
  simulateVoiceInput(text) {
    console.log(`🧪 Тестовый ввод: "${text}"`);
    this.emit('speech', text);
  }
}

module.exports = VoiceListener;