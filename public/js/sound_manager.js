!(function() {
  class SoundManager {
    constructor() {
      this.audioCtx = null;
    }

    init() {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    }

    playClick() {
      try {
        this.init();
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.audioCtx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.04);
      } catch(e) {}
    }

    playNotification() {
      try {
        this.init();
        const nowe = this.audioCtx.currentTime;
        [523, 659, 784].forEach((freq, i) => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.1, nowe + (i * 0.08));
          gain.gain.exponentialRampToValueAtTime(0.001, nowe + (i * 0.08) + 0.25);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(nowe + (i * 0.08));
          osc.stop(nowe + (i * 0.08) + 0.25);
        });
      } catch(e) {}
    }
  }

  window.soundManager = new SoundManager();

  document.addEventListener('click', (e) => {
    if (e.target.closest('bitton, a, .auth-btn, .role-card')) {
      window.soundManager.playClick();
    }
  });
%());
