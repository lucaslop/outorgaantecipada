const ANIMATION_SPEED = 500;
const DECREASE_BATTERY = 1;
const NUM_ROWS = 8;
const NUM_COLS = 8;
const INIT = { x: 0, y: 0}
const FINAL = { x: 7, y: 0}

let isBlockMoving = true;

const gardenDict = { free: 0, cutter: 1, obstacles: 2, pet: 3 }
let garden = [
    [1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
];
let visited = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
];
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
const battery = document.getElementById('battery-level');
const powerLed = document.getElementById('powerLed');
const startLed = document.getElementById('startLed');
const simulateBatteryButton = document.getElementById('simulateBatteryButton');
const batteryText = document.querySelector('.battery-text');
const blockDir = { RIGHT: '-90deg', LEFT: '90deg', UP: '180deg', DOWN: '0deg' }
let finalPath;
let index = 0
let cutterPosition = { row: 0, col: 0, dir: 'DOWN' };
let movingRight = true;
let arrowDirection = '';  
let animationInterval;
let batteryLevel = 100;
let isPowerOn = false;
let isAnimationStarted = false;
let petcutterPosition = { row: 0, col: 5 };
let petBlock;
let movingDown = true;
let petBlockInterval;

const blackBlocks = [];

function playHorn() {
    const hornSound = document.getElementById('hornSound');
    hornSound.play();
}

function updateArrows() {
    if (cutterPosition.row % 2 === 0) {
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
        garden[randomRow][randomCol] = gardenDict.obstacles
    }
}

function createGrid() {
    for (let row = 0; row < NUM_ROWS; row++) {
        for (let col = 0; col < NUM_COLS; col++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-item');
            grid.appendChild(cell);
        }
    }

    petBlock = document.createElement('div');
    petBlock.classList.add('block-purple', 'purple');

    const randomRow = Math.floor(Math.random() * NUM_ROWS);
    const petCol = 5;
    petcutterPosition.row = randomRow;
    petcutterPosition.col = petCol;

    grid.children[randomRow * NUM_ROWS + petCol].appendChild(petBlock);
    garden[randomRow][petCol] = gardenDict.pet

    placeBlock();
}

function placeBlock() {
    grid.innerHTML = '';

    for (let i = 0; i < NUM_ROWS; i++) {
        for (let j = 0; j < NUM_COLS; j++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-item');
            if (visited[i][j]) cell.classList.add('cutted')
            grid.appendChild(cell);
        }
    }

    grid.children[petcutterPosition.row * NUM_ROWS + petcutterPosition.col].appendChild(petBlock);

    blackBlocks.forEach((block, index) => {
        const blackBlock = document.createElement('div');
        blackBlock.classList.add('block', `block-black-${index + 1}`);
        grid.children[block.row * NUM_ROWS + block.col].appendChild(blackBlock);
    });

    const cutter = document.createElement('div');
    cutter.classList.add('block');
    cutter.style.cssText = `transform: rotate(${blockDir[cutterPosition.dir]})`;

    if (cutterPosition.row === (NUM_ROWS - 1) && cutterPosition.col === 0) {
        cutter.classList.add('ok');
        cutter.style.cssText = `transform: rotate(90deg)`;
    }

    if (blackBlocks.some(b => b.row === cutterPosition.row && b.col === cutterPosition.col)) {
        console.log('BATEU NOS ITENS')
    }
    if (petcutterPosition.row === cutterPosition.row && petcutterPosition.col === cutterPosition.col) {
        console.log('BATEU NO CACHORROOOOOOOO')
    }

    grid.children[cutterPosition.row * NUM_ROWS + cutterPosition.col].appendChild(cutter);
    console.log(garden)
    updateArrows();
}

function moveCutter() {
    garden[cutterPosition.row][cutterPosition.col] = gardenDict.free
    // if (cutterPosition.row === 7 && cutterPosition.col === 0) {
    //     return;
    // }
    
    // grid.children[cutterPosition.row * 9 + cutterPosition.col].removeChild(grid.children[cutterPosition.row * 9 + cutterPosition.col].firstChild);

    // if (movingRight) {
    //     if (cutterPosition.col < 8) {
    //         cutterPosition.col++;
    //     } else {
    //         cutterPosition.row++;
    //         movingRight = false;
    //     }
    // } else {
    //     if (cutterPosition.col > 0) {
    //         cutterPosition.col--;
    //     } else {
    //         cutterPosition.row++;
    //         movingRight = true;
    //     }
    // }

    cutterPosition.row = finalPath[index].x
    cutterPosition.col = finalPath[index].y

    cutterPosition.dir = finalPath[index++].direction
    garden[cutterPosition.row][cutterPosition.col] = gardenDict.cutter
    visited[cutterPosition.row][cutterPosition.col] = 1
    updateArrows(); 

    placeBlock();
    decreaseBatteryLevel();
}

function movePetBlock() {
    garden[petcutterPosition.row][petcutterPosition.col] = gardenDict.free

    if (movingDown) {
        if (petcutterPosition.row < 7 && (cutterPosition.row !== petcutterPosition.row + 1 || cutterPosition.col !== petcutterPosition.col)) {
            petcutterPosition.row++;
        } else {
            movingDown = false;
        }
    } else {
        if (petcutterPosition.row > 0 && (cutterPosition.row !== petcutterPosition.row - 1 || cutterPosition.col !== petcutterPosition.col)) {
            petcutterPosition.row--;
        } else {
            movingDown = true;
        }
    }

    if (blackBlocks.some(block => block.row === petcutterPosition.row && block.col === petcutterPosition.col)) {
        movingDown = !movingDown;
    }
    
    garden[petcutterPosition.row][petcutterPosition.col] = gardenDict.pet
    grid.children[petcutterPosition.row * NUM_ROWS + petcutterPosition.col].appendChild(petBlock);
}

function stopAnimation() {
    clearInterval(animationInterval);
    isAnimationStarted = false;
}

function resetAnimation() {
    console.log(garden)
    stopAnimation();
    grid.style.display = 'none';
    cutterPosition = { row: 0, col: 0 };
    movingRight = true;
    batteryLevel = 100;
    petBlock.style.display = 'block';
    updateBatteryLevel();
}

function decreaseBatteryLevel() {
    if (batteryLevel > 0) {
        batteryLevel -= DECREASE_BATTERY;
        updateBatteryLevel();
    } 
    
    if (batteryLevel <= 0) {
        stopAnimation();
        batteryText.classList.add('battery-text-red');
        startButton.disabled = true;
        powerButton.disabled = true;
    }
}

function updateBatteryLevel() {
    battery.style.width = `${batteryLevel}%`;
    batteryText.textContent = `${batteryLevel}%`
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
                petBlock.style.display = 'block';
                startAnimation();
            }
        }
    }
}

function startAnimation() {
    finalPath = findPath(garden)
    console.log(finalPath)
    if (cutterPosition.row === NUM_ROWS) {
        cutterPosition = { row: 0, col: 0 };
        createGrid();
    }
    if (!isAnimationStarted && isPowerOn && batteryLevel > 0) {
        isAnimationStarted = true;
        animationInterval = setInterval(() => {
            moveCutter();
        }, ANIMATION_SPEED);

        petBlockInterval = setInterval(() => {
            movePetBlock();
        }, ANIMATION_SPEED / 2);
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
