let isBlockMoving = true;

const unexpectedButton = document.getElementById('unexpectedButton');
const unexpectedLed = document.getElementById('unexpectedLed');
const horn = document.getElementById('horn');
const arrowUp = document.getElementById('arrowUp');
const arrowDown = document.getElementById('arrowDown');
const arrowLeft = document.getElementById('arrowLeft');
const arrowRight = document.getElementById('arrowRight');
const grid = document.getElementById('grid');
const powerButton = document.getElementById('powerButton');
const powerOffButton = document.getElementById('powerOffButton');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const resetButton = document.getElementById('resetButton');
const battery = document.getElementById('battery');
const powerLed = document.getElementById('powerLed');
const startLed = document.getElementById('startLed');
const simulateBatteryButton = document.getElementById('simulateBatteryButton');
const batteryText = document.querySelector('.battery-container div');
const blockDir = { right: '-90deg', left: '90deg', up: '180deg', down: '0deg' }
let blockPosition = { row: 0, col: 0, dir: 'right' };
let movingRight = true;
let arrowDirection = '';  
let animationSpeed = 500;
let animationInterval;
let batteryLevel = 100;
let isPowerOn = false;
let isAnimationStarted = false;
let purpleBlockPosition = { row: 0, col: 5 };
let movingDown = true;
let purpleBlockInterval;

const blackBlocks = [];

function playHorn() {
    const hornSound = document.getElementById('hornSound');
    hornSound.play();
}

function updateArrows() {
    if (blockPosition.row % 2 === 0) {
        if (arrowDirection !== 'right') {
            flashDownArrow();
            arrowDirection = 'right';
        }

        arrowRight.classList.add('arrow-on');
        arrowRight.classList.remove('arrow-off');
        arrowLeft.classList.add('arrow-off');
        arrowLeft.classList.remove('arrow-on');
    } else {
        if (arrowDirection !== 'left') {
            flashDownArrow();
            arrowDirection = 'left';
        }
    
        arrowLeft.classList.add('arrow-on');
        arrowLeft.classList.remove('arrow-off');
        arrowRight.classList.add('arrow-off');
        arrowRight.classList.remove('arrow-on');
    }
}

function flashDownArrow() {
    arrowDown.classList.add('arrow-on');
    arrowDown.classList.remove('arrow-off');

    setTimeout(() => {
        arrowDown.classList.add('arrow-off');
        arrowDown.classList.remove('arrow-on');
        updateArrows();
    }, 500); 
}

while (blackBlocks.length < 3) {
    const randomRow = Math.floor(Math.random() * 7);
    const randomCol = Math.floor(Math.random() * 7) + 1;
    if (randomCol !== 5 && blackBlocks.every(block => {
        const rowDiff = Math.abs(block.row - randomRow);
        const colDiff = Math.abs(block.col - randomCol);
        return rowDiff > 1 || colDiff > 1 || (rowDiff === 1 && colDiff === 1);
    })) {
        blackBlocks.push({ row: randomRow, col: randomCol });
    }
}

function createGrid() {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-item');
            grid.appendChild(cell);
        }
    }

    purpleBlock = document.createElement('div');
    purpleBlock.classList.add('block-purple', 'purple');

    const randomRow = Math.floor(Math.random() * 8);
    purpleBlockPosition.row = randomRow;
    purpleBlockPosition.col = 5;

    grid.children[randomRow * 9 + 5].appendChild(purpleBlock);

    placeBlock();
}

function placeBlock() {
    grid.innerHTML = '';

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-item');
            grid.appendChild(cell);
        }
    }

    grid.children[purpleBlockPosition.row * 9 + purpleBlockPosition.col].appendChild(purpleBlock);

    blackBlocks.forEach((block, index) => {
        const blackBlock = document.createElement('div');
        blackBlock.classList.add('block', `block-black-${index + 1}`);
        grid.children[block.row * 9 + block.col].appendChild(blackBlock);
    });

    const block = document.createElement('div');
    block.classList.add('block');
    block.style.cssText = `transform: rotate(${blockDir[blockPosition.dir]})`;

    if (blockPosition.row === 7 && blockPosition.col === 0) {
        block.classList.add('ok');
        block.style.cssText = `transform: rotate(90deg)`;
    }

    grid.children[blockPosition.row * 9 + blockPosition.col].appendChild(block);
    updateArrows();
}

function moveBlock() {
    if (blockPosition.row === 7 && blockPosition.col === 0) {
        return;
    }
    
    grid.children[blockPosition.row * 9 + blockPosition.col].removeChild(grid.children[blockPosition.row * 9 + blockPosition.col].firstChild);

    if (movingRight) {
        if (blockPosition.col < 8) {
            blockPosition.col++;
        } else {
            blockPosition.row++;
            movingRight = false;
        }
    } else {
        if (blockPosition.col > 0) {
            blockPosition.col--;
        } else {
            blockPosition.row++;
            movingRight = true;
        }
    }

    blockPosition.dir = movingRight ? 'right' : 'left'
    updateArrows(); 

    placeBlock();
    decreaseBatteryLevel();
}

function movePurpleBlock() {
    const previousRow = purpleBlockPosition.row;

    if (movingDown) {
        if (purpleBlockPosition.row < 7 && (blockPosition.row !== purpleBlockPosition.row + 1 || blockPosition.col !== purpleBlockPosition.col)) {
            purpleBlockPosition.row++;
        } else {
            movingDown = false;
        }
    } else {
        if (purpleBlockPosition.row > 0 && (blockPosition.row !== purpleBlockPosition.row - 1 || blockPosition.col !== purpleBlockPosition.col)) {
            purpleBlockPosition.row--;
        } else {
            movingDown = true;
        }
    }

    if (blackBlocks.some(block => block.row === purpleBlockPosition.row && block.col === purpleBlockPosition.col)) {
        movingDown = !movingDown;
    }

    grid.children[purpleBlockPosition.row * 9 + purpleBlockPosition.col].appendChild(purpleBlock);
}

function stopAnimation() {
    clearInterval(animationInterval);
    isAnimationStarted = false;
}

function resetAnimation() {
    stopAnimation();
    grid.style.display = 'none';
    blockPosition = { row: 0, col: 0 };
    movingRight = true;
    batteryLevel = 100;
    purpleBlock.style.display = 'block';
    updateBatteryLevel();
}

function decreaseBatteryLevel() {
    if (batteryLevel > 0) {
        batteryLevel -= 1;
        updateBatteryLevel();
    } else {
        stopAnimation();
        battery.classList.add('battery-red');
        startButton.disabled = true;
    }
}

function updateBatteryLevel() {
    battery.style.width = `${batteryLevel}%`;
}

function togglePower() {
    if (isPowerOn) {
        powerLed.classList.remove('led-on');
        powerLed.classList.add('led-off');
        isPowerOn = false;
        resetAnimation();
        grid.style.display = 'none';
    } else {
        powerLed.classList.remove('led-off');
        powerLed.classList.add('led-on');
        isPowerOn = true;
        grid.style.display = 'grid';
    }
}

function toggleStart() {
    if (isPowerOn) {
        if (batteryLevel > 0) {
            if (isAnimationStarted) {
                startLed.classList.remove('led-on');
                startLed.classList.add('led-off');
                stopAnimation();
            } else {
                startLed.classList.remove('led-off');
                startLed.classList.add('led-on');
                purpleBlock.style.display = 'block';
                startAnimation();
            }
        }
    }
}

function startAnimation() {
    if (blockPosition.row === 8) {
        blockPosition = { row: 0, col: 0 };
        createGrid();
    }
    if (!isAnimationStarted && isPowerOn && batteryLevel > 0) {
        isAnimationStarted = true;
        animationInterval = setInterval(() => {
            moveBlock();
        }, animationSpeed);

        purpleBlockInterval = setInterval(() => {
            movePurpleBlock();
        }, animationSpeed / 2);
    }
}

powerButton.addEventListener('click', togglePower);
startButton.addEventListener('click', toggleStart);
stopButton.addEventListener('click', toggleStart);

powerOffButton.addEventListener('click', () => {
    togglePower();
    resetAnimation();
    location.reload();
});

resetButton.addEventListener('click', () => {
    location.reload()
});

simulateBatteryButton.addEventListener('click', () => {
    batteryLevel = 0;
    updateBatteryLevel();

    if (isAnimationStarted) {
        toggleStart();
    }

    battery.classList.add('battery-red');
});

unexpectedButton.addEventListener('click', () => {
    unexpectedLed.classList.toggle('led-off');
    unexpectedLed.classList.toggle('led-on');

    horn.classList.toggle('horn-off');
    horn.classList.toggle('horn-on');

    playHorn();
        
    isBlockMoving = !isBlockMoving;
    if (isBlockMoving) {
        startAnimation();
    } else {
        stopAnimation();
    }
});

createGrid();
