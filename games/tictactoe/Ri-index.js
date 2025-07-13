// DOM Elements
const gameSetup = document.getElementById('gameSetup');
const gameBoard = document.getElementById('gameBoard');
const gameModeSelect = document.getElementById('gameMode');
const aiOptions = document.getElementById('aiOptions');
const firstPlayerOptions = document.getElementById('firstPlayerOptions');
const startGameBtn = document.getElementById('startGameBtn');
const modeDisplay = document.getElementById('modeDisplay');
const difficultyDisplay = document.getElementById('difficultyDisplay');
const boxEls = document.querySelectorAll('.box');
const statusEl = document.querySelector('.status');
const restartBtnEl = document.querySelector('.restartBtn');
const newGameBtn = document.querySelector('.newGameBtn');
const avatarOptions = document.querySelectorAll('.avatar-option');
const soundToggleBtn = document.getElementById('soundToggleBtn');

// Game Variables
let options = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let running = false;
let gameMode = "pvp";
let aiDifficulty = "easy";
let firstPlayer = "player";
let isAITurn = false;

// Audio Variables
let isMuted = false;

// Avatar Variables
let selectedAvatars = {
    X: "pics/X-Player.png",
    O: "pics/O-Player.png"
};

// Player symbols
const xSymbol = "<img src='X-Player.png'>";
const oSymbol = "<img src='O-Player.png'>";

// Win combinations
const winCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Initialize the game
function init() {
    setupEventListeners();
    setupAvatarSelection();
    setupAudio();
    showGameSetup();
}

// Setup event listeners
function setupEventListeners() {
    // Game setup listeners
    gameModeSelect.addEventListener('change', handleGameModeChange);
    startGameBtn.addEventListener('click', startGame);
    newGameBtn.addEventListener('click', showGameSetup);
    
    // Game board listeners
    boxEls.forEach(box => box.addEventListener('click', boxClick));
    restartBtnEl.addEventListener('click', restartGame);
    
    // Audio listeners
    soundToggleBtn.addEventListener('click', toggleMute);
}

// Setup audio
function setupAudio() {
    // Add audio context resume on user interaction
    document.addEventListener('click', () => {
        gameRadio.play();
    }, { once: true });
    
    // Try to start music immediately on page load
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            gameRadio.play();
        }, 100);
    });
}

// Toggle mute
function toggleMute() {
    isMuted = !isMuted;
    gameRadio.setMuted(isMuted);
    soundToggleBtn.textContent = isMuted ? '🔇 Sound Off' : '🔊 Sound On';
}

// Setup avatar selection
function setupAvatarSelection() {
    avatarOptions.forEach(option => {
        option.addEventListener('click', handleAvatarSelection);
    });
    
    // Set default selections
    setDefaultAvatarSelections();
}

// Handle avatar selection
function handleAvatarSelection(e) {
    const player = e.currentTarget.dataset.player;
    const avatar = e.currentTarget.dataset.avatar;
    
    // Remove previous selection for this player
    avatarOptions.forEach(option => {
        if (option.dataset.player === player) {
            option.classList.remove('selected');
        }
    });
    
    // Add selection to clicked option
    e.currentTarget.classList.add('selected');
    
    // Update selected avatar
    selectedAvatars[player] = avatar;
}

// Set default avatar selections
function setDefaultAvatarSelections() {
    // Clear all selections first
    avatarOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Set default selections
    avatarOptions.forEach(option => {
        if (option.dataset.player === 'X' && option.dataset.avatar === 'pics/X-Player.png') {
            option.classList.add('selected');
        }
        if (option.dataset.player === 'O' && option.dataset.avatar === 'pics/O-Player.png') {
            option.classList.add('selected');
        }
    });
}

// Handle game mode change
function handleGameModeChange() {
    gameMode = gameModeSelect.value;
    if (gameMode === 'ai') {
        aiOptions.style.display = 'block';
        firstPlayerOptions.style.display = 'block';
    } else {
        aiOptions.style.display = 'none';
        firstPlayerOptions.style.display = 'none';
    }
}

// Show game setup screen
function showGameSetup() {
    gameSetup.style.display = 'block';
    gameBoard.style.display = 'none';
    soundToggleBtn.style.display = 'block';
    resetGame();
    setDefaultAvatarSelections();
    
    // Start background music if not already playing
    gameRadio.play();
}

// Start the game
function startGame() {
    gameMode = gameModeSelect.value;
    aiDifficulty = document.getElementById('aiDifficulty').value;
    firstPlayer = document.getElementById('firstPlayer').value;
    
    gameSetup.style.display = 'none';
    gameBoard.style.display = 'block';
    soundToggleBtn.style.display = 'block';
    
    // Update display
    modeDisplay.textContent = gameMode === 'ai' ? 'Player vs AI' : 'Player vs Player';
    if (gameMode === 'ai') {
        difficultyDisplay.style.display = 'block';
        difficultyDisplay.textContent = `AI: ${aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)}`;
    } else {
        difficultyDisplay.style.display = 'none';
    }
    
    resetGame();
    
    // Handle AI first move
    if (gameMode === 'ai' && firstPlayer === 'ai') {
        isAITurn = true;
        setTimeout(() => {
            makeAIMove();
        }, 500);
    }
}

// Reset game state
function resetGame() {
    options = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    running = true;
    isAITurn = false;
    
    boxEls.forEach(box => {
        box.innerHTML = "";
        box.classList.remove('win');
    });
    
    updateStatus();
}

// Handle box click
function boxClick(e) {
    if (!running || isAITurn) return;
    
    const index = e.target.dataset.index;
    if (options[index] !== "") return;
    
    updateBox(e.target, index);
    checkWinner();
    
    // AI turn if playing against AI
    if (gameMode === 'ai' && running) {
        isAITurn = true;
        setTimeout(() => {
            makeAIMove();
        }, 500);
    }
}

// Update box with player move
function updateBox(box, index) {
    options[index] = currentPlayer;
    const avatarPath = selectedAvatars[currentPlayer];
    box.innerHTML = `<img src="${avatarPath}">`;
}

// Make AI move
function makeAIMove() {
    if (!running) return;
    
    let move;
    switch (aiDifficulty) {
        case 'easy':
            move = getEasyAIMove();
            break;
        case 'medium':
            move = getMediumAIMove();
            break;
        case 'hard':
            move = getHardAIMove();
            break;
    }
    
    if (move !== -1) {
        updateBox(boxEls[move], move);
        checkWinner();
    }
    
    isAITurn = false;
}

// Easy AI: Random moves
function getEasyAIMove() {
    const emptyBoxes = options.map((option, index) => option === "" ? index : -1).filter(index => index !== -1);
    if (emptyBoxes.length === 0) return -1;
    return emptyBoxes[Math.floor(Math.random() * emptyBoxes.length)];
}

// Medium AI: Mix of random and smart moves
function getMediumAIMove() {
    // 70% chance of making a smart move, 30% random
    if (Math.random() < 0.7) {
        const smartMove = getSmartMove();
        if (smartMove !== -1) return smartMove;
    }
    return getEasyAIMove();
}

// Hard AI: Always makes the best move
function getHardAIMove() {
    return getSmartMove();
}

// Get smart move (blocking or winning)
function getSmartMove() {
    const aiPlayer = currentPlayer;
    const humanPlayer = currentPlayer === "X" ? "O" : "X";
    
    // First, try to win
    for (let combo of winCombinations) {
        const [a, b, c] = combo;
        if (options[a] === aiPlayer && options[b] === aiPlayer && options[c] === "") return c;
        if (options[a] === aiPlayer && options[c] === aiPlayer && options[b] === "") return b;
        if (options[b] === aiPlayer && options[c] === aiPlayer && options[a] === "") return a;
    }
    
    // Then, try to block
    for (let combo of winCombinations) {
        const [a, b, c] = combo;
        if (options[a] === humanPlayer && options[b] === humanPlayer && options[c] === "") return c;
        if (options[a] === humanPlayer && options[c] === humanPlayer && options[b] === "") return b;
        if (options[b] === humanPlayer && options[c] === humanPlayer && options[a] === "") return a;
    }
    
    // Take center if available
    if (options[4] === "") return 4;
    
    // Take corners if available
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(corner => options[corner] === "");
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Take any available edge
    const edges = [1, 3, 5, 7];
    const availableEdges = edges.filter(edge => options[edge] === "");
    if (availableEdges.length > 0) {
        return availableEdges[Math.floor(Math.random() * availableEdges.length)];
    }
    
    return -1;
}

// Check for winner
function checkWinner() {
    let isWon = false;
    
    for (let combo of winCombinations) {
        const [a, b, c] = combo;
        if (options[a] !== "" && options[a] === options[b] && options[b] === options[c]) {
            isWon = true;
            boxEls[a].classList.add('win');
            boxEls[b].classList.add('win');
            boxEls[c].classList.add('win');
            break;
        }
    }
    
    if (isWon) {
        const winner = gameMode === 'ai' && currentPlayer === (firstPlayer === 'ai' ? 'X' : 'O') ? 'AI' : 'Player';
        statusEl.textContent = `🎉 ${winner} Wins! 🎉`;
        statusEl.style.color = "green";
        restartBtnEl.textContent = "Play Again 😉";
        running = false;
    } else if (!options.includes("")) {
        statusEl.textContent = "😅 It's a Draw! 😅";
        statusEl.style.color = "orange";
        restartBtnEl.textContent = "Play Again 😉";
        running = false;
    } else {
        changePlayer();
    }
}

// Change player
function changePlayer() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateStatus();
}

// Update status display
function updateStatus() {
    if (gameMode === 'ai') {
        const currentPlayerName = currentPlayer === (firstPlayer === 'ai' ? 'X' : 'O') ? 'AI' : 'You';
        statusEl.textContent = `${currentPlayerName}'s Turn`;
    } else {
        statusEl.textContent = `Player ${currentPlayer}'s Turn`;
    }
    statusEl.style.color = "black";
    restartBtnEl.textContent = "Restart 🔁";
}

// Restart game
function restartGame() {
    resetGame();
    
    // Handle AI first move if needed
    if (gameMode === 'ai' && firstPlayer === 'ai') {
        isAITurn = true;
        setTimeout(() => {
            makeAIMove();
        }, 500);
    }
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', init); 