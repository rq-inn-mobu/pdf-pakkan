// select_language.js

window.Language = {
  current: "L2", // 日本語を初期値

  languages: [],
  messages: {},

  async init() {
    const [langCSV, msgCSV] = await Promise.all([
      fetch("./data/language.csv").then(r => r.text()),
      fetch("./data/message_button.csv").then(r => r.text())
    ]);

    this.languages = this.parseLanguageCSV(langCSV);
    this.messages = this.parseMessageCSV(msgCSV);
  },

  parseLanguageCSV(text) {
    const lines = text.trim().split("\n").slice(1);
    return lines.map(line => {
      const cols = line.split(",").map(c => c.trim());
      return {
        number: cols[0],
        name: cols[1]
      };
    });
  },

  parseMessageCSV(text) {
    const lines = text.trim().split("\n").map(l => l.replace(/\r/g, ""));
    const header = lines[0].split(",").map(h => h.trim());
    const map = {};

    lines.slice(1).forEach(line => {
      const cols = line.split(",").map(c => c.trim());
      const key = cols[0];
      map[key] = {};

      header.slice(1).forEach((langKey, i) => {
        map[key][langKey] = cols[i + 1] ?? "";
      });
    });

    return map;
  },

  t(key) {
    return this.messages[key]?.[this.current] || key;
  },

  setLanguage(lang) {
    this.current = lang;
    window.UI.render();
  }
};
