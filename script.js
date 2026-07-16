/* ===================================================================
   RUANG — AI Bot untuk Saran & Motivasi
   Menganalisis data pengguna dan memberikan suggestions yang personalized
=================================================================== */

class RuangAIBot {
  constructor() {
    this.suggestions = [];
    this.initBotUI();
  }

  initBotUI() {
    // Bot akan ter-inject ke dalam page setelah DOM siap
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupBot());
    } else {
      this.setupBot();
    }
  }

  setupBot() {
    // Cari panel AI atau buat jika belum ada
    let aiPanel = document.getElementById('ai-bot');
    if (!aiPanel) {
      // Buat panel AI Bot
      const mainContent = document.querySelector('.content');
      if (mainContent) {
        aiPanel = document.createElement('section');
        aiPanel.className = 'panel';
        aiPanel.id = 'ai-bot';
        aiPanel.innerHTML = `
          <div class="panel-head">
            <div>
              <p class="eyebrow">AI Companion</p>
              <h2>Saran & Motivasi Personal</h2>
            </div>
          </div>
          
          <div class="card">
            <div class="ai-bot-chat">
              <div class="ai-bot-messages" id="aiBotMessages"></div>
              <form class="ai-bot-input-form" id="aiBotForm">
                <input 
                  type="text" 
                  id="aiBotInput" 
                  placeholder="Tanya AI Bot untuk saran atau motivasi..."
                  autocomplete="off"
                >
                <button type="submit" class="btn btn-amber" id="aiBotSendBtn">Kirim</button>
              </form>
            </div>
          </div>

          <div class="card">
            <div class="card-head">
              <h3>Saran Harian</h3>
              <button class="btn-small" id="refreshSuggestionsBtn">Refresh</button>
            </div>
            <div id="aiSuggestionsBox" class="ai-suggestions-box"></div>
          </div>
        `;
        mainContent.appendChild(aiPanel);
      }
    }

    // Setup event listeners
    const form = document.getElementById('aiBotForm');
    const input = document.getElementById('aiBotInput');
    const sendBtn = document.getElementById('aiBotSendBtn');
    const refreshBtn = document.getElementById('refreshSuggestionsBtn');

    if (form) {
      form.addEventListener('submit', (e) => this.handleUserInput(e));
    }
    if (sendBtn) {
      sendBtn.addEventListener('click', (e) => this.handleUserInput(e));
    }
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.generateSuggestions());
    }

    // Add AI bot ke navigation
    this.addBotToNavigation();

    // Generate initial suggestions
    this.generateSuggestions();
  }

  addBotToNavigation() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    // Cek apakah sudah ada button AI
    if (nav.querySelector('[data-target="ai-bot"]')) return;

    const aiBotBtn = document.createElement('button');
    aiBotBtn.className = 'nav-item';
    aiBotBtn.dataset.target = 'ai-bot';
    aiBotBtn.innerHTML = `
      <svg viewBox="0 0 24 24" class="nav-icon">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
      </svg>
      <span>AI Bot</span>
    `;

    aiBotBtn.addEventListener('click', () => {
      const target = aiBotBtn.dataset.target;
      const panels = document.querySelectorAll('.panel');
      const navItems = document.querySelectorAll('.nav-item');
      panels.forEach(p => p.classList.toggle('is-active', p.id === target));
      navItems.forEach(n => n.classList.toggle('is-active', n.dataset.target === target));
      document.querySelector('.sidebar')?.classList.remove('is-open');
    });

    nav.appendChild(aiBotBtn);
  }

  generateSuggestions() {
    const suggestions = this.analyzeUserData();
    this.displaySuggestions(suggestions);
  }

  analyzeUserData() {
    const tips = [];

    // Analisis Tasks
    const taskTotal = state.tasks.length;
    const taskDone = state.tasks.filter(t => t.done).length;
    if (taskTotal > 0) {
      const taskCompletion = (taskDone / taskTotal) * 100;
      if (taskCompletion === 100) {
        tips.push({
          type: 'achievement',
          icon: '🎉',
          title: 'Luar Biasa!',
          text: 'Kamu sudah menyelesaikan semua tugas hari ini. Istirahat dan nikmati pencapaianmu!'
        });
      } else if (taskCompletion >= 75) {
        tips.push({
          type: 'motivation',
          icon: '💪',
          title: 'Hampir Selesai!',
          text: `Tinggal ${taskTotal - taskDone} tugas lagi. Kamu pasti bisa menyelesaikannya!`
        });
      } else if (taskCompletion === 0) {
        tips.push({
          type: 'reminder',
          icon: '📌',
          title: 'Mulai Beraksi',
          text: 'Kamu punya beberapa tugas menunggu. Pilih satu dan mulai sekarang!'
        });
      }
    } else {
      tips.push({
        type: 'suggestion',
        icon: '✍️',
        title: 'Tambah Tugas',
        text: 'Belum ada tugas? Buat beberapa untuk fokus hari ini.'
      });
    }

    // Analisis Habits
    const todayHabits = state.habits.filter(h => h.lastDone === todayISO()).length;
    const totalHabits = state.habits.length;
    if (totalHabits > 0) {
      if (todayHabits === totalHabits) {
        tips.push({
          type: 'achievement',
          icon: '🏆',
          title: 'Konsisten Sempurna!',
          text: 'Semua kebiasaan hari ini sudah tercapai. Pertahankan momentum ini!'
        });
      } else if (todayHabits > 0) {
        tips.push({
          type: 'motivation',
          icon: '🚀',
          title: 'Kebiasaan Bagus!',
          text: `Kamu sudah menyelesaikan ${todayHabits} dari ${totalHabits} kebiasaan. Lanjutkan!`
        });
      } else {
        tips.push({
          type: 'reminder',
          icon: '⏰',
          title: 'Jangan Lupa Kebiasaan',
          text: 'Cek dan tanda tangani kebiasaan harianmu untuk membangun konsistensi.'
        });
      }
    }

    // Analisis Mood
    const lastMood = state.moodData.slice().reverse()[0];
    if (lastMood) {
      const moodValue = { terrible: 1, bad: 2, neutral: 3, good: 4, excellent: 5 };
      const score = moodValue[lastMood.mood] || 0;
      if (score <= 2) {
        tips.push({
          type: 'wellness',
          icon: '💚',
          title: 'Mood Check-in',
          text: 'Sepertinya mood kamu kurang bagus. Istirahat sebentar atau berbicara dengan orang terpercaya.'
        });
      }
    }

    // Analisis Financial
    if (state.balanceSet) {
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      const monthExpenses = state.expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      });
      const spent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      const remaining = state.monthBudget - spent;
      const spentPercent = (spent / state.monthBudget) * 100;

      if (spentPercent >= 80) {
        tips.push({
          type: 'warning',
          icon: '💰',
          title: 'Budget Alert',
          text: `Hati-hati! Kamu sudah menghabiskan ${Math.round(spentPercent)}% dari budget bulan ini.`
        });
      } else if (spentPercent >= 50) {
        tips.push({
          type: 'reminder',
          icon: '💳',
          title: 'Monitor Pengeluaran',
          text: `Setengah budget bulan sudah terpakai. Pertahankan pengeluaran yang bijak!`
        });
      }
    }

    // Analisis Goals Progress
    const goals = state.goals || [];
    const activeGoals = goals.filter(g => (g.progress || 0) < 100);
    if (activeGoals.length > 0) {
      const avgProgress = Math.round(activeGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / activeGoals.length);
      if (avgProgress === 0) {
        tips.push({
          type: 'suggestion',
          icon: '🎯',
          title: 'Mulai Goal Mu',
          text: 'Kamu punya goal tapi belum memulai. Ambil langkah kecil pertama hari ini!'
        });
      } else if (avgProgress === 100) {
        tips.push({
          type: 'achievement',
          icon: '⭐',
          title: 'Goal Tercapai!',
          text: 'Selamat! Kamu sudah mencapai goal. Tentukan goal baru untuk terus berkembang.'
        });
      }
    }

    // General Motivation
    if (tips.length === 0) {
      tips.push({
        type: 'motivation',
        icon: '✨',
        title: 'Terus Semangat!',
        text: 'Setiap hari adalah kesempatan baru untuk menjadi lebih baik. Kamu bisa!'
      });
    }

    // Add general motivational quotes
    const quotes = [
      { icon: '💡', text: 'Kecil-kecilan dari sekarang, lama-lama menjadi bukit.' },
      { icon: '🌟', text: 'Produktivitas bukan tentang melakukan lebih banyak, tapi melakukan hal yang penting.' },
      { icon: '🎨', text: 'Setiap tugas selesai adalah langkah menuju versi terbaik dirimu.' },
      { icon: '🔥', text: 'Konsistensi adalah kunci kesuksesan jangka panjang.' },
      { icon: '🌱', text: 'Pertumbuhan dimulai dari zona nyaman. Tantang diri sendiri!' }
    ];

    const dailyQuote = quotes[new Date().getDate() % quotes.length];
    tips.push({
      type: 'quote',
      icon: dailyQuote.icon,
      title: 'Daily Wisdom',
      text: dailyQuote.text
    });

    return tips;
  }

  displaySuggestions(suggestions) {
    const box = document.getElementById('aiSuggestionsBox');
    if (!box) return;

    box.innerHTML = suggestions.map(s => `
      <div class="ai-suggestion-item ${s.type}">
        <span class="ai-suggestion-icon">${s.icon}</span>
        <div class="ai-suggestion-content">
          <div class="ai-suggestion-title">${s.title}</div>
          <div class="ai-suggestion-text">${s.text}</div>
        </div>
      </div>
    `).join('');
  }

  handleUserInput(e) {
    e.preventDefault();
    const input = document.getElementById('aiBotInput');
    if (!input) return;

    const userMessage = input.value.trim();
    if (!userMessage) return;

    // Add user message to chat
    this.addMessageToChat('user', userMessage);
    input.value = '';

    // Generate AI response
    setTimeout(() => {
      const response = this.generateResponse(userMessage);
      this.addMessageToChat('bot', response);
    }, 500);
  }

  addMessageToChat(sender, message) {
    const messagesBox = document.getElementById('aiBotMessages');
    if (!messagesBox) return;

    const messageEl = document.createElement('div');
    messageEl.className = `ai-message ${sender}`;
    messageEl.innerHTML = `
      <div class="ai-message-bubble">
        ${sender === 'bot' ? '<span class="ai-bot-icon">🤖</span>' : ''}
        <span class="ai-message-text">${escapeHTML(message)}</span>
      </div>
    `;

    messagesBox.appendChild(messageEl);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  generateResponse(userInput) {
    const input = userInput.toLowerCase();

    // Analisis intent dan berikan response
    if (input.includes('tugas') || input.includes('todo')) {
      const taskDone = state.tasks.filter(t => t.done).length;
      const taskTotal = state.tasks.length;
      return `Kamu punya ${taskTotal} tugas, ${taskDone} sudah selesai. ${taskTotal - taskDone > 0 ? `Fokus menyelesaikan ${taskTotal - taskDone} tugas tersisa!` : 'Semua tugas sudah selesai! 🎉'}`;
    }

    if (input.includes('kebiasaan') || input.includes('habit')) {
      const todayHabits = state.habits.filter(h => h.lastDone === todayISO()).length;
      const totalHabits = state.habits.length;
      return `Hari ini kamu sudah menyelesaikan ${todayHabits} dari ${totalHabits} kebiasaan. Teruskan konsistensimu! 💪`;
    }

    if (input.includes('motivasi') || input.includes('semangat')) {
      const motivations = [
        'Kamu lebih kuat dari hambatan apapun. Teruskan!',
        'Setiap hari adalah kesempatan baru. Manfaatkan hari ini!',
        'Istirahat adalah bagian dari produktivitas. Jangan lupa self-care!',
        'Kamu sudah melakukan yang terbaik. Bangga dengan dirimu sendiri!',
        'Perjalanan seribu mil dimulai dengan satu langkah. Mulai sekarang!'
      ];
      return motivations[Math.floor(Math.random() * motivations.length)];
    }

    if (input.includes('keuangan') || input.includes('uang') || input.includes('pengeluaran')) {
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      const monthExpenses = state.expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      });
      const spent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      const remaining = state.monthBudget - spent;
      return `Bulan ini kamu sudah menghabiskan ${(spent / 1000000).toFixed(1)}jt dari ${(state.monthBudget / 1000000).toFixed(1)}jt budget. Sisa ${(remaining / 1000000).toFixed(1)}jt. Belanja bijak! 💳`;
    }

    if (input.includes('goal') || input.includes('target')) {
      const goals = state.goals.filter(g => (g.progress || 0) < 100);
      if (goals.length > 0) {
        return `Kamu punya ${goals.length} goal aktif. Fokus satu per satu dan rayakan setiap milestone! 🎯`;
      }
      return 'Belum ada goal? Tentukan tujuan yang ingin dicapai dan mulai bekerja!';
    }

    if (input.includes('mood') || input.includes('perasaan')) {
      const lastMood = state.moodData.slice().reverse()[0];
      if (lastMood) {
        const moodLabels = {
          terrible: 'Sangat Buruk',
          bad: 'Buruk',
          neutral: 'Biasa Saja',
          good: 'Baik',
          excellent: 'Sangat Baik'
        };
        return `Mood terakhirmu adalah ${moodLabels[lastMood.mood]}. Ingat untuk merawat diri fisik dan mental. Istirahat cukup dan berbicara dengan orang terpercaya jika perlu. 💚`;
      }
      return 'Belum ada mood record. Cek mood mu untuk tracking kesehatan mental!';
    }

    if (input.includes('bantuan') || input.includes('help') || input.includes('apa')) {
      return 'Aku bisa membantu dengan:\n• Motivasi dan semangat\n• Info tentang tugas dan kebiasaan\n• Tracking keuangan dan budget\n• Progress goal\n• Wellness check dan mood tracking\n\nTanya aku tentang apapun untuk mendapat saran personal!';
    }

    // Default response
    const defaults = [
      'Itu pertanyaan bagus! Terus berfokus pada prioritas utama dan jangan lupa self-care. 😊',
      'Ingat, produktivitas bukan tentang kecepatan tapi tentang konsistensi dan kualitas. 🎯',
      'Setiap langkah kecil menuju tujuan adalah kesuksesan. Kamu pasti bisa! 💪',
      'Coba ambil break sejenak, refresh pikiran, kemudian lanjutkan dengan energi baru! ✨',
      'Kamu lebih baik dari yang kamu pikirkan. Percayai dirimu sendiri! 🌟'
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
  }
}

// Fungsi helper dari script.js
const todayISO = () => new Date().toISOString().slice(0, 10);
const escapeHTML = (str) => { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; };

// Initialize AI Bot
let ruangBot = null;
document.addEventListener('DOMContentLoaded', () => {
  if (!ruangBot) {
    ruangBot = new RuangAIBot();
  }
});

// Jika script sudah loaded setelah DOM
if (document.readyState !== 'loading' && !ruangBot) {
  ruangBot = new RuangAIBot();
}
