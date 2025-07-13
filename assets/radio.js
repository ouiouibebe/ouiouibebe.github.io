// Radio system for all games
class GameRadio {
  constructor() {
    this.tracks = [
      { id: 'none', name: 'None', file: null },
      { id: 'iris', name: 'Iris and I', file: '../../assets/audio/Iris and I.mp3' },
      { id: 'marias', name: 'Cariño - The Marías', file: '../../assets/audio/Instrumental Cariño - The Marías.mp3' },
      { id: 'dominic', name: 'Pasture Child', file: '../../assets/audio/Dominic Fike - Pasture Child (Official Audio).mp3' },
      { id: 'clairo', name: 'Glory Of The Snow', file: '../../assets/audio/Clairo - Glory Of The Snow (Instrumental).mp3' },
      { id: 'alvvays', name: 'Ones Who Love You', file: '../../assets/audio/Alvvays - Ones Who Love You.mp3' }
    ];
    
    this.currentTrack = this.getDefaultTrack();
    this.audioElement = null;
    this.isOpen = false;
    this.volume = 0.3;
    this.isMuted = false;
    
    this.init();
  }
  
  getDefaultTrack() {
    // Map each game to its default track based on current game page
    const path = window.location.pathname;
    if (path.includes('ri-runner') || path.includes('socks-clicker')) return 'clairo';
    if (path.includes('rat-cafe')) return 'dominic';
    if (path.includes('mirror-selfie-memory')) return 'alvvays';
    if (path.includes('queen-ris-hive')) return 'marias';
    if (path.includes('tictactoe') || path.includes('Ri-index')) return 'iris';
    if (path.includes('hmmm')) return 'iris'; // Default for hmmm
    return 'iris'; // fallback
  }
  
  init() {
    this.createRadioInterface();
    this.createAudioElement();
    this.loadTrack(this.currentTrack);
  }
  
  createAudioElement() {
    this.audioElement = document.createElement('audio');
    this.audioElement.loop = true;
    this.audioElement.volume = this.volume;
    document.body.appendChild(this.audioElement);
  }
  
  createRadioInterface() {
    const radioContainer = document.createElement('div');
    radioContainer.id = 'game-radio';
    
    // Adjust position for rat cafe where recipes button is
    const isRatCafe = window.location.pathname.includes('rat-cafe');
    const topPosition = isRatCafe ? '80px' : '20px';
    
    radioContainer.innerHTML = `
      <div class="radio-toggle">
        <button id="radio-btn">🎵</button>
      </div>
      <div class="radio-panel hidden">
        <div class="radio-header">
          <h3>Music Radio</h3>
          <button id="radio-close">×</button>
        </div>
        <div class="radio-tracks">
          ${this.tracks.map(track => `
            <div class="radio-track ${track.id === this.currentTrack ? 'active' : ''}" data-track="${track.id}">
              <span class="track-name">${track.name}</span>
              ${track.id === this.currentTrack ? '<span class="now-playing">♪</span>' : ''}
            </div>
          `).join('')}
        </div>
        <div class="radio-controls">
          <button id="mute-btn">${this.isMuted ? '🔇' : '🔊'}</button>
          <input type="range" id="volume-slider" min="0" max="100" value="${this.volume * 100}">
        </div>
      </div>
    `;
    
    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
      #game-radio {
        position: fixed;
        top: ${topPosition};
        right: 20px;
        z-index: 10000;
        font-family: 'Nunito', sans-serif;
      }
      
      .radio-toggle button {
        width: 50px;
        height: 50px;
        border-radius: 25px;
        border: 2px solid rgba(255,255,255,0.3);
        background: rgba(0,0,0,0.7);
        color: white;
        font-size: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }
      
      .radio-toggle button:hover {
        background: rgba(0,0,0,0.9);
        transform: scale(1.1);
      }
      
      .radio-panel {
        position: absolute;
        top: 60px;
        right: 0;
        width: 280px;
        background: rgba(0,0,0,0.95);
        border-radius: 12px;
        border: 2px solid rgba(255,255,255,0.2);
        backdrop-filter: blur(15px);
        color: white;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        overflow: hidden;
        transition: all 0.3s ease;
      }
      
      .radio-panel.hidden {
        opacity: 0;
        transform: translateY(-10px);
        pointer-events: none;
      }
      
      .radio-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background: rgba(255,255,255,0.1);
        border-bottom: 1px solid rgba(255,255,255,0.2);
      }
      
      .radio-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
      
      .radio-header button {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .radio-tracks {
        max-height: 200px;
        overflow-y: auto;
      }
      
      .radio-track {
        padding: 12px 20px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background 0.2s ease;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }
      
      .radio-track:hover {
        background: rgba(255,255,255,0.1);
      }
      
      .radio-track.active {
        background: rgba(255,255,255,0.2);
        color: #4CAF50;
      }
      
      .track-name {
        font-size: 14px;
        font-weight: 500;
      }
      
      .now-playing {
        font-size: 12px;
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .radio-controls {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 15px 20px;
        background: rgba(255,255,255,0.05);
      }
      
      .radio-controls button {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 5px;
      }
      
      .radio-controls input {
        flex: 1;
        height: 4px;
        background: rgba(255,255,255,0.3);
        border-radius: 2px;
        outline: none;
        -webkit-appearance: none;
      }
      
      .radio-controls input::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        background: #4CAF50;
        border-radius: 50%;
        cursor: pointer;
      }
    `;
    
    document.head.appendChild(styles);
    document.body.appendChild(radioContainer);
    
    this.attachEventListeners();
  }
  
  attachEventListeners() {
    const radioBtn = document.getElementById('radio-btn');
    const radioClose = document.getElementById('radio-close');
    const radioPanel = document.querySelector('.radio-panel');
    const muteBtn = document.getElementById('mute-btn');
    const volumeSlider = document.getElementById('volume-slider');
    
    radioBtn.addEventListener('click', () => this.togglePanel());
    radioClose.addEventListener('click', () => this.closePanel());
    
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!document.getElementById('game-radio').contains(e.target)) {
        this.closePanel();
      }
    });
    
    // Track selection
    document.querySelectorAll('.radio-track').forEach(track => {
      track.addEventListener('click', () => {
        const trackId = track.dataset.track;
        this.selectTrack(trackId);
      });
    });
    
    // Mute toggle
    muteBtn.addEventListener('click', () => this.toggleMute());
    
    // Volume control
    volumeSlider.addEventListener('input', (e) => {
      this.setVolume(e.target.value / 100);
    });
  }
  
  togglePanel() {
    this.isOpen = !this.isOpen;
    const panel = document.querySelector('.radio-panel');
    if (this.isOpen) {
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  }
  
  closePanel() {
    this.isOpen = false;
    document.querySelector('.radio-panel').classList.add('hidden');
  }
  
  selectTrack(trackId) {
    this.currentTrack = trackId;
    this.loadTrack(trackId);
    this.updateInterface();
  }
  
  loadTrack(trackId) {
    const track = this.tracks.find(t => t.id === trackId);
    
    if (track.file) {
      this.audioElement.src = track.file;
      this.audioElement.muted = this.isMuted;
      this.audioElement.play().catch(err => console.log('Music play error:', err));
    } else {
      // No music selected
      this.audioElement.pause();
      this.audioElement.src = '';
    }
  }
  
  updateInterface() {
    // Update active track
    document.querySelectorAll('.radio-track').forEach(track => {
      const trackId = track.dataset.track;
      if (trackId === this.currentTrack) {
        track.classList.add('active');
        track.innerHTML = `
          <span class="track-name">${this.tracks.find(t => t.id === trackId).name}</span>
          <span class="now-playing">♪</span>
        `;
      } else {
        track.classList.remove('active');
        track.innerHTML = `<span class="track-name">${this.tracks.find(t => t.id === trackId).name}</span>`;
      }
    });
  }
  
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.audioElement.muted = this.isMuted;
    document.getElementById('mute-btn').textContent = this.isMuted ? '🔇' : '🔊';
  }
  
  setVolume(volume) {
    this.volume = volume;
    this.audioElement.volume = volume;
  }
  
  // Public methods for game integration
  play() {
    if (this.currentTrack !== 'none' && this.audioElement.src) {
      this.audioElement.play().catch(err => console.log('Music play error:', err));
    }
  }
  
  pause() {
    this.audioElement.pause();
  }
  
  setMuted(muted) {
    this.isMuted = muted;
    this.audioElement.muted = muted;
    document.getElementById('mute-btn').textContent = this.isMuted ? '🔇' : '🔊';
  }
}

// Global radio instance
let gameRadio;

// Initialize radio when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  gameRadio = new GameRadio();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameRadio;
} 