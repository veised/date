// logging.js
class Logger {
  static logs = [];
  static marks = {};

  // Инициализация: читаем из localStorage
  static init() {
    const savedLogs = localStorage.getItem('app_logs');
    if (savedLogs) {
      try {
        this.logs = JSON.parse(savedLogs);
      } catch (e) {
        console.error("Ошибка чтения логов из localStorage", e);
      }
    }
  }

  static log(action, details = {}, level = 'info') {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      details,
      level,
      page: window.location.pathname
    };
    this.logs.push(entry);
    this.saveToStorage();

    const color = { info: 'blue', warn: 'orange', error: 'red', success: 'green' }[level] || 'black';
    console.log(`%c[LOG ${level.toUpperCase()}] ${action}`, `color: ${color}; font-weight: bold`, details);
  }

  static markStart(name) {
    this.marks[name] = performance.now();
  }

  static markEnd(name) {
    if (this.marks[name]) {
      const duration = performance.now() - this.marks[name];
      this.log('Function executed', { name, duration: duration.toFixed(2) + 'ms' }, 'info');
      return duration;
    }
    return null;
  }

  static saveToStorage() {
    if (this.logs.length > 200) {
      this.logs = this.logs.slice(-200);
    }
    localStorage.setItem('app_logs', JSON.stringify(this.logs));
  }

  static getLogs() {
    return this.logs;
  }

  static exportLogs() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.logs, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", "test-logs.json");
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  static clear() {
    this.logs = [];
    localStorage.removeItem('app_logs');
  }
}

// Глобальные сокращения
const log = (action, details) => Logger.log(action, details, 'info');
const warn = (action, details) => Logger.log(action, details, 'warn');
const error = (action, details) => Logger.log(action, details, 'error');
const success = (action, details) => Logger.log(action, details, 'success');
const start = (name) => Logger.markStart(name);
const end = (name) => Logger.markEnd(name);

// Инициализация при загрузке страницы
if (typeof window !== 'undefined') {
  Logger.init();
}