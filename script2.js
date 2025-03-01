/**
 * Juego de Wordle Personalizado
 * 
 * Este script implementa un juego tipo Wordle donde el usuario puede:
 * - Configurar su propia palabra para que otro jugador adivine
 * - Tiene 10 intentos para adivinar la palabra
 * - Las letras se colorean según si están en la posición correcta o presentes en la palabra
 * - Al acabar los intentos se muestra la palabra a adivinar
 */

// Constantes del juego
function Word() {
    let word = document.getElementById('custom-word').value;
    return word.length;
}


var WORD_LENGTH = Word();
const MAX_ATTEMPTS = 6;

// Variables globales
let targetWord = '';
let currentAttempt = 0;
let currentTile = 0;
let gameOver = false;

// Elementos DOM
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const customWordInput = document.getElementById('custom-word');
const startGameBtn = document.getElementById('start-game');
const resetGameBtn = document.getElementById('reset-game');
const playAgainBtn = document.getElementById('play-again');
const gameBoard = document.getElementById('game-board');
const attemptsCounter = document.getElementById('attempts');
const resultMessage = document.getElementById('result-message');
const solutionWord = document.getElementById('solution-word');
const keys = document.querySelectorAll('.key');

/**
 * Inicializa el juego
 */
function init() {
    // Event listeners
    startGameBtn.addEventListener('click', startGame);
    resetGameBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', resetGame);
    
    // Evento para teclas físicas
    document.addEventListener('keydown', handleKeyPress);
    
    // Eventos para el teclado virtual
    keys.forEach(key => {
        key.addEventListener('click', () => handleKeyClick(key.getAttribute('data-key')));
    });
    
    // Enfoca el input al cargar la página
    customWordInput.focus();
}

/**
 * Maneja las pulsaciones de teclas físicas
 */
function handleKeyPress(e) {
    if (gameScreen.classList.contains('hidden') || gameOver) return;
    
    const key = e.key.toUpperCase();
    
    if (key === 'ENTER') {
        submitWord();
    } else if (key === 'BACKSPACE' || key === 'DELETE') {
        deleteLetter();
    } else if (/^[A-ZÑ]$/.test(key)) {
        addLetter(key);
    }
}

/**
 * Maneja los clics en el teclado virtual
 */
function handleKeyClick(key) {
    if (gameScreen.classList.contains('hidden') || gameOver) return;
    
    if (key === 'Enter') {
        submitWord();
    } else if (key === 'Delete') {
        deleteLetter();
    } else {
        addLetter(key);
    }
}

/**
 * Inicia el juego con la palabra personalizada
 */
function startGame() {
    // Obtiene y valida la palabra
    let word = customWordInput.value.toUpperCase();

    if (word.length === 0) {
        alert('Por favor ingresa una palabra');
        customWordInput.focus();
        return;
    }

    // Actualiza la variable global correctamente
    WORD_LENGTH = word.length; 

    // Valida que solo contenga letras
    if (!/^[A-ZÑ]+$/.test(word)) {
        alert('La palabra solo puede contener letras');
        customWordInput.focus();
        return;
    }

    // Configura la palabra a adivinar
    targetWord = word;
    createGameBoard();

    // Cambia la vista
    setupScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    // Actualiza el contador de intentos
    updateAttemptsCounter();
}


/**
 * Crea el tablero de juego
 */
function createGameBoard() {
    gameBoard.innerHTML = '';
    
    // Crea las filas y casillas
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const row = document.createElement('div');
        row.classList.add('row');
        
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            row.appendChild(tile);
        }
        
        gameBoard.appendChild(row);
    }
    
    // Activa la primera fila
    activateRow(0);
}

/**
 * Activa la fila del intento actual
 */
function activateRow(rowIndex) {
    const rows = gameBoard.querySelectorAll('.row');
    const tiles = rows[rowIndex].querySelectorAll('.tile');
    
    tiles.forEach(tile => {
        tile.classList.add('active');
    });
}

/**
 * Actualiza el contador de intentos
 */
function updateAttemptsCounter() {
    attemptsCounter.textContent = MAX_ATTEMPTS - currentAttempt;
}

/**
 * Añade una letra a la casilla actual
 */
function addLetter(letter) {
    if (currentTile < WORD_LENGTH) {
        const rows = gameBoard.querySelectorAll('.row');
        const tiles = rows[currentAttempt].querySelectorAll('.tile');
        
        tiles[currentTile].textContent = letter;
        currentTile++;
    }
}

/**
 * Borra la última letra
 */
function deleteLetter() {
    if (currentTile > 0) {
        currentTile--;
        const rows = gameBoard.querySelectorAll('.row');
        const tiles = rows[currentAttempt].querySelectorAll('.tile');
        
        tiles[currentTile].textContent = '';
    }
}

/**
 * Envía la palabra para validación
 */
function submitWord() {
    if (currentTile !== WORD_LENGTH) {
        shakeRow();
        return;
    }
    
    const rows = gameBoard.querySelectorAll('.row');
    const tiles = rows[currentAttempt].querySelectorAll('.tile');
    let word = '';
    
    // Obtiene la palabra del intento actual
    tiles.forEach(tile => {
        word += tile.textContent;
    });
    
    // Comprueba la palabra y actualiza colores
    const result = checkWord(word, tiles);
    
    // Actualiza el estado del juego
    currentAttempt++;
    currentTile = 0;
    updateAttemptsCounter();
    
    // Comprueba si ha ganado o perdido
    if (result) {
        gameOver = true;
        setTimeout(() => {
            showResult(true);
        }, 1500);
    } else if (currentAttempt >= MAX_ATTEMPTS) {
        gameOver = true;
        setTimeout(() => {
            showResult(false);
        }, 1500);
    } else {
        // Activa la siguiente fila
        activateRow(currentAttempt);
    }
}

/**
 * Comprueba la palabra y colorea las casillas
 * @returns {boolean} true si la palabra es correcta
 */
function checkWord(word, tiles) {
    if (word === targetWord) {
        // Palabra correcta
        animateRowCheck(tiles, 'correct');
        return true;
    }
    
    // Cuenta las ocurrencias de cada letra en la palabra objetivo
    const letterCount = {};
    for (let i = 0; i < targetWord.length; i++) {
        const letter = targetWord[i];
        letterCount[letter] = (letterCount[letter] || 0) + 1;
    }
    
    // Primero marca las letras correctas
    const tileStatus = Array(WORD_LENGTH).fill('absent');
    const remainingLetters = {...letterCount};
    
    // Primera pasada: marca las letras correctas
    for (let i = 0; i < WORD_LENGTH; i++) {
        const letter = word[i];
        
        if (letter === targetWord[i]) {
            tileStatus[i] = 'correct';
            remainingLetters[letter]--;
        }
    }
    
    // Segunda pasada: marca las letras presentes
    for (let i = 0; i < WORD_LENGTH; i++) {
        const letter = word[i];
        
        if (tileStatus[i] !== 'correct' && remainingLetters[letter] > 0) {
            tileStatus[i] = 'present';
            remainingLetters[letter]--;
        }
    }
    
    // Anima y aplica los colores
    animateRowCheck(tiles, tileStatus);
    
    // Actualiza los colores del teclado
    updateKeyboard(word, tileStatus);
    
    return false;
}

/**
 * Anima la fila al comprobar la palabra
 */
function animateRowCheck(tiles, status) {
    tiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add('flip');
            
            // Aplica el color después de la mitad de la animación
            setTimeout(() => {
                if (typeof status === 'string') {
                    // Si todos son correctos
                    tile.classList.add(status);
                } else {
                    // Status individual por letra
                    tile.classList.add(status[index]);
                }
            }, 250);
        }, index * 100);
    });
}

/**
 * Actualiza los colores del teclado
 */
function updateKeyboard(word, status) {
    for (let i = 0; i < word.length; i++) {
        const letter = word[i];
        const key = document.querySelector(`.key[data-key="${letter}"]`);
        
        if (!key) continue;
        
        // Prioriza los colores (correct > present > absent)
        if (status[i] === 'correct') {
            key.classList.remove('present', 'absent');
            key.classList.add('correct');
        } else if (status[i] === 'present' && !key.classList.contains('correct')) {
            key.classList.remove('absent');
            key.classList.add('present');
        } else if (!key.classList.contains('correct') && !key.classList.contains('present')) {
            key.classList.add('absent');
        }
    }
}

/**
 * Anima la fila cuando hay un error
 */
function shakeRow() {
    const rows = gameBoard.querySelectorAll('.row');
    rows[currentAttempt].classList.add('shake');
    
    setTimeout(() => {
        rows[currentAttempt].classList.remove('shake');
    }, 500);
}

/**
 * Muestra la pantalla de resultado
 */
function showResult(isWin) {
    resultScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
    
    if (isWin) {
        resultMessage.textContent = '¡Felicidades! ¡Has ganado!';
        resultMessage.style.color = '#538d4e';
    } else {
        resultMessage.textContent = 'Game Over';
        resultMessage.style.color = '#e35252';
    }
    
    solutionWord.textContent = targetWord;
}

/**
 * Reinicia el juego
 */
function resetGame() {
    // Reinicia variables
    targetWord = '';
    currentAttempt = 0;
    currentTile = 0;
    gameOver = false;
    
    // Limpia el tablero
    gameBoard.innerHTML = '';
    
    // Limpia el teclado
    keys.forEach(key => {
        key.classList.remove('correct', 'present', 'absent');
    });
    
    // Limpia el input
    customWordInput.value = '';
    
    // Cambia la vista
    setupScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    
    // Enfoca el input
    customWordInput.focus();
}

// Inicializa el juego al cargar la página
document.addEventListener('DOMContentLoaded', init);