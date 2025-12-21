const gameContainer = document.getElementById("game-container");
const gameWrapper = document.getElementById("game-wrapper");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const movesCountDisplay = document.getElementById("moves-count");
const timeDisplay = document.getElementById("time");
const controlsOverlay = document.getElementById("controls-overlay");
const resultMessage = document.getElementById("result-message");


let cards = [];
let firstCard = null;
let secondCard = null;
let moves = 0;
let matchedCount = 0;
let timeInterval;
let seconds = 0;
let isGameActive = false;


const ITEMS = ["🍎", "🍌", "🍒", "🍇", "🥝", "🍋", "🍉", "🍍"];
const ROWS = 4;
const COLUMNS = 4;
const GRID_SIZE = ROWS * COLUMNS;
// --- Utility Functions ---

/**
 * Resets the move and time counters.
 */
const initializeStats = () => {
    moves = 0;
    seconds = 0;
    movesCountDisplay.textContent = moves;
    timeDisplay.textContent = `${seconds}s`;
};

  /**
 * Shuffles an array using the Fisher-Yates algorithm.
 * @param {Array} array The array to shuffle.
 * @returns {Array} The shuffled array.
 */
const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const startTimer = () => {
    stopTimer(); 
    timeInterval = setInterval(() => {
        seconds++;
        timeDisplay.textContent = `${seconds}s`;
    }, 1000);
};

const stopTimer = () => {
    clearInterval(timeInterval);
};

const generateCards = () => {
    let cardValues = ITEMS.slice(0, GRID_SIZE / 2);
    cardValues = [...cardValues, ...cardValues]; 
    cardValues = shuffle(cardValues);

    gameContainer.innerHTML = ""; 
    
    for (let i = 0; i < GRID_SIZE; i++) {
        const value = cardValues[i];
        
        const cardContainer = document.createElement("div");
        cardContainer.classList.add("card-container");
        cardContainer.dataset.value = value;
        cardContainer.dataset.index = i;
        
        const cardBefore = document.createElement("div");
        cardBefore.classList.add("card-before");
        cardBefore.textContent = "?";
        
        const cardAfter = document.createElement("div");
        cardAfter.classList.add("card-after");
        cardAfter.textContent = value;

        cardContainer.appendChild(cardBefore);
        cardContainer.appendChild(cardAfter);
        gameContainer.appendChild(cardContainer);
    }
    
    cards = document.querySelectorAll(".card-container");
    cards.forEach(card => card.addEventListener("click", flipCard));
};

const flipCard = function() {
    if (!isGameActive) return;
    if (this.classList.contains("flipped")) return; 
    if (secondCard) return; 

    this.classList.add("flipped");

    if (!firstCard) {
        firstCard = this;
    } else {
        secondCard = this;
        moves++;
        movesCountDisplay.textContent = moves;
        
        checkForMatch();
    }
};
  //카드 맞는지 확인 코드
const checkForMatch = () => {
    if (firstCard.dataset.value === secondCard.dataset.value) {
        matchedCount++;
        
        firstCard.removeEventListener("click", flipCard);
        secondCard.removeEventListener("click", flipCard);
        
        firstCard = null;
        secondCard = null;

        if (matchedCount === GRID_SIZE / 2) {
            endGame(true);
        }

    } else {
        setTimeout(() => {
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");
            
            firstCard = null;
            secondCard = null;
        }, 1000);
    }
};

const startGame = () => {
    isGameActive = true;
    matchedCount = 0;
    
    controlsOverlay.classList.add("hidden");
    gameWrapper.classList.remove("hidden");
    stopButton.classList.remove("hidden");
    
    initializeStats();
    startTimer();
    generateCards();
};

/**
 * Ends the game session (win or stop).
 * @param {boolean} isWin True if the player won, false if manually stopped.
 */
const endGame = (isWin) => {
    isGameActive = false;
    stopTimer();

    controlsOverlay.classList.remove("hidden");
    stopButton.classList.add("hidden");
    
    if (isWin) {
        resultMessage.innerHTML = `
            <h2>축하합니다!</h2>
            <h4>총 움직임: ${moves}회, 시간: ${seconds}초</h4>
            <p class="result-detail">성공적으로 모든 카드를 맞췄습니다. 다시 도전해 보세요!</p>
        `;
        startButton.textContent = "다시 시작";
    } else {
        resultMessage.innerHTML = `
            <h2>게임 중단</h2>
            <h4 class="result-detail">게임을 중단했습니다.</h4>
            <p class="result-detail">언제든지 '게임 다시 시작하기'을 눌러 다시 시작할 수 있습니다.</p>
        `;
        startButton.textContent = "게임 다시 시작하기";
    }
    
    gameWrapper.classList.add("hidden");
};



window.onload = function() {
    resultMessage.innerHTML = '치매 예방 기억력 게임';

    startButton.addEventListener("click", startGame);
    stopButton.addEventListener("click", () => endGame(false));
    
    generateCards();
    controlsOverlay.classList.remove("hidden");
    gameWrapper.classList.add("hidden");
};
