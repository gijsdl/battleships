const battleshipLayout = document.querySelector('.battleship');
const templateLayout = document.querySelector('.ships');
const templateShips = document.querySelectorAll('.template-ship');
const welcomeDiv = document.querySelector('.welcome');
const startInfoDiv = document.querySelector('.start-info');
const onePlayerBtn = document.querySelector('.one-player');
const twoPlayersBtn = document.querySelector('.two-players');
const difficultyDiv = document.querySelector('.difficulty');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const playerTurnDiv = document.querySelector('.player-turn');
const alertDiv = document.querySelector('.alert');
const alertBtn = document.querySelector('.alert-btn');
const endScreenDiv = document.querySelector('.end-screen');
const playerWonText = document.querySelector('.playerWon');
const resetBtn = document.querySelector('.reset-btn');

let ship = {};
let rotation = false;
let computer = true;
let difficulty = 0;
let lastHits = [];
let direction = null;
let flippedDirection = false;
let player1 = true;
let gameState = 'off';
let canShoot = false;
let buttonAction = 'none';
let ships = [];
let startShooting = true;

// Player is true for player one and false for player two. This is for a check later in the changeTemplateBoard function.
let shipsDown = [
    {
        player: true,
        name: "patrol",
        down: false
    },
    {
        player: true,
        name: "submarine",
        down: false
    },
    {
        player: true,
        name: "destroyer",
        down: false
    },
    {
        player: true,
        name: "battleship",
        down: false
    },
    {
        player: true,
        name: "carrier",
        down: false
    },
    {
        player: false,
        name: "patrol",
        down: false
    },
    {
        player: false,
        name: "submarine",
        down: false
    },
    {
        player: false,
        name: "destroyer",
        down: false
    },
    {
        player: false,
        name: "battleship",
        down: false
    },
    {
        player: false,
        name: "carrier",
        down: false
    }
];
let cells = [];

setup();

function setup() {
    for (let i = 1; i <= 10; i++) {
        const cellsX = [];
        for (let j = 1; j <= 10; j++) {

            const cellDiv = document.createElement('div');
            cellDiv.classList.add('cell');
            cellDiv.style.gridArea = `${j} / ${i} / ${j + 1} / ${i + 1}`;
            battleshipLayout.appendChild(cellDiv);
            cellDiv.addEventListener('click', () => {
                if (gameState === "shoot") {
                    shoot(i, j);
                } else if (gameState === 'place') {
                    placeShip(i, j, false);
                }
            });
            cellDiv.addEventListener('mouseover', () => {
                hoverShip(i, j);
            });
            cellDiv.addEventListener('mouseout', () => {
                removeHover(i, j);
            });
            cellDiv.addEventListener('contextmenu', (e) => {
                changeRotation(e, i, j);
            });
            cellsX[j] = {
                element: cellDiv,
                shipP1: null,
                shipP2: null,
                shotP1: false,
                shotP2: false
            };
        }
        cells[i] = cellsX;
    }

    //template setup
    for (let i = 1; i <= 8; i++) {
        for (let j = 1; j <= 5; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.style.gridArea = `${i} / ${j} / ${i + 1} / ${j + 1}`;
            templateLayout.appendChild(cell);
        }
    }
    for (let i = 0; i < templateShips.length; i++) {
        templateShips[i].addEventListener('click', chooseShip);
        ships.push(templateShips[i].classList[1].split('-').pop());
    }
    onePlayerBtn.addEventListener('click', askDifficulty);
    twoPlayersBtn.addEventListener('click', () => {
        startPlacement(2);
    });
    for (let i = 0; i < difficultyBtns.length; i++) {
        difficultyBtns[i].addEventListener('click', startWithDifficulty);
    }
    alertBtn.addEventListener('click', removeAlert);
    resetBtn.addEventListener('click', reset);
}

function askDifficulty() {
    difficultyDiv.classList.remove('hidden');
    welcomeDiv.classList.add('hidden');
}

function startWithDifficulty(e) {
    difficulty = parseInt(e.target.value);
    startPlacement(1);
}

function startPlacement(numberOfPlayers) {
    computer = numberOfPlayers === 1;
    startInfoDiv.classList.remove('hidden');
    startInfoDiv.children[0].textContent = "Speler 1";
    welcomeDiv.classList.add('hidden');
    difficultyDiv.classList.add('hidden');
    gameState = 'place';
}

function placeShip(x, y, computer) {
    if (ship.name === undefined && !computer) {
        showAlert('Let op!', 'Kies eerst een schip aan de rechterkant.');
        return false;
    }

    const shipObject = createShip(x, y);
    if (!shipObject) {
        if (!computer) {
            showAlert('Let op!', 'Je kan hier geen schip plaatsen.');
        }
        return false;
    }

    if (!computer) {
        document.querySelector('.template-' + ship.name).classList.add('used');
        ship = {};
        checkShipsPlaced();
    } else {
        return true;
    }

}

function checkShipsPlaced() {
    let used = true;
    for (let i = 0; i < templateShips.length; i++) {
        if (!templateShips[i].classList.contains('used')) {
            used = false;
        }
    }
    if (used) {
        let alert = ""
        if (player1) {
            alert = 'Je hebt alle schepen geplaatst. De volgende speler kan zijn schepen plaatsen';
        } else if (computer) {
            alert = 'Je hebt alle schepen geplaatst. De computer gaat zijn schepen plaatsen';
        } else {
            alert = "Je hebt alle schepen geplaatst. Start het spel"
        }
        showAlert('Volgende stap', alert);
        if (player1) {
            buttonAction = 'nextPlayer';
        } else {
            buttonAction = 'startGame';
        }
    }
}

function createShip(x, y) {
    const coordinates = [];
    for (let i = 0; i < ship.length; i++) {
        let newX = x;
        let newY = y;
        if (rotation) {
            newX += i;
            newY = y;
        } else {
            newY += i;
            newX = x;
        }
        if (newX > 10 || newY > 10) {
            return false;
        }
        if (cells[newX][newY].shipP1 && player1) {
            return false;
        }
        if (cells[newX][newY].shipP2 && !player1) {
            return false;
        }
        coordinates.push({x: newX, y: newY});
    }

    for (let i = 0; i < coordinates.length; i++) {

        const coordinate = coordinates[i];
        const cell = cells[coordinate.x][coordinate.y];
        if (!computer || player1) {
            cell.element.classList.add('ship');
        }
        if (player1) {
            cell.shipP1 = ship.name;
        } else {
            cell.shipP2 = ship.name;
        }
    }

    return true;

}

function hoverShip(x, y) {
    if (ship.name !== undefined) {
        const shipHover = document.createElement('div');
        shipHover.classList.add('ship', 'ship-hover');
        if (!rotation) {
            shipHover.style.gridArea = `${y} / ${x} / ${y + ship.length} / ${x}`;
        } else {
            shipHover.style.gridArea = `${y} / ${x} / ${y} / ${x + ship.length}`;
        }
        battleshipLayout.appendChild(shipHover);
    }

}

function removeHover(x, y) {
    const hover = document.querySelectorAll('.ship-hover');
    for (let i = 0; i < hover.length; i++) {
        battleshipLayout.removeChild(hover[i]);
    }
}

function chooseShip(e) {
    if (gameState !== "place") {
        return;
    }
    if (e.target.classList.contains('used')) {
        showAlert('Let op!', 'Je hebt dit schip al geplaatst.');
        return;
    }
    const classItem = e.target.classList[1];
    const name = classItem.split('-').pop();
    let length = 0;
    if (name === 'patrol') {
        length = 2;
    } else if (name === 'submarine') {
        length = 3;
    } else if (name === 'destroyer') {
        length = 3;
    } else if (name === 'battleship') {
        length = 4;
    } else if (name === 'carrier') {
        length = 5;
    }
    ship = {
        name: name,
        length: length,
    };

}

function changeRotation(e, x, y) {
    e.preventDefault()
    if (gameState === 'place') {
        rotation = !rotation;
        removeHover();
        hoverShip(x, y);
    }
}

function switchPlayer() {
    canShoot = false;
    player1 = !player1;

    if (gameState === 'shoot') {
        let timeout = 1000;
        if (startShooting) {
            timeout = 0;
        }
        startShooting = false;
        setTimeout(() => {
            changeBoard();
            if (computer && !player1) {
                setTimeout(shootComputer, 500);
            } else {
                canShoot = true;
            }
            if (player1) {
                playerTurnDiv.children[1].textContent = "Speler 1";
            } else if (computer) {
                playerTurnDiv.children[1].textContent = "Computer";
            } else {
                playerTurnDiv.children[1].textContent = "Speler 2";
            }
        }, timeout);

        return;
    }
    if (computer) {
        placeComputerShips();
        return;
    }
    startInfoDiv.children[0].textContent = "Speler 2";
    for (let i = 0; i < templateShips.length; i++) {
        templateShips[i].classList.remove('used');
    }
    for (let i = 1; i < cells.length; i++) {
        for (let j = 1; j < cells[i].length; j++) {
            cells[i][j].element.classList.remove('ship');
        }
    }
}

function placeComputerShips() {
    const ships = [
        {
            name: 'patrol',
            length: 2
        },
        {
            name: 'submarine',
            length: 3
        },
        {
            name: 'destroyer',
            length: 3
        },
        {
            name: 'battleship',
            length: 4
        },
        {
            name: 'carrier',
            length: 5
        }
    ];
    for (let i = 0; i < ships.length; i++) {
        let placed = false;
        rotation = Math.round(Math.random()) === 1;
        ship = ships[i];
        while (!placed) {
            const x = Math.ceil(Math.random() * 10);
            const y = Math.ceil(Math.random() * 10);
            if (placeShip(x, y, true)) {
                placed = true;
                ship = {};
            }
        }
    }
    showAlert('Volgende stap', 'De computer heeft zijn schepen geplaatst. Je kan nu gaan schieten');
    buttonAction = 'startGame';
}

function startGame() {
    gameState = 'shoot';
    switchPlayer();
    for (let i = 0; i < templateShips.length; i++) {
        templateShips[i].classList.remove('used', 'clickable');
    }
    startInfoDiv.classList.add('hidden');
    playerTurnDiv.classList.remove('hidden');
}

function shoot(x, y) {
    if (computer && !player1 || !canShoot) {
        return;
    }
    const cell = cells[x][y];
    if (player1) {
        if (cell.shotP1) {
            showAlert('Let op!', 'Je hebt hier al geschoten.');
            return;
        }

        cell.shotP1 = true;
        cells[x][y].element.classList.add('shot');

        if (cell.shipP2) {
            cells[x][y].element.classList.add('hit');
        }

    } else {
        if (cell.shotP2) {
            showAlert('Let op!', 'Je hebt hier al geschoten.');
            return;
        }

        cell.shotP2 = true;
        cells[x][y].element.classList.add('shot');

        if (cell.shipP1) {
            cells[x][y].element.classList.add('hit');
        }
    }
    checkShotSatus();
}

function shootComputer() {

    const random = Math.ceil(Math.random() * 100);
    let cell = null
    let cellLocation = null;
    if (random > difficulty) {
        cellLocation = randomShoot();
    } else {
        if (lastHits.length === 0) {
            const otherTarget = getUnsunkenShips();
            if (otherTarget) {
                lastHits.push(otherTarget);
                cellLocation = thinkShoot();
            } else {
                cellLocation = randomShoot();
            }
        } else {
            cellLocation = thinkShoot();
        }
    }
    cell = cells[cellLocation.x][cellLocation.y];
    cell.shotP2 = true;
    cell.element.classList.add('shot');
    if (cell.shipP1) {
        cell.element.classList.add('hit');
        lastHits.push(cellLocation);
    } else if (direction !== null) {
        if (lastHits.length > 1) {
            flipDirection();
        } else {
            direction++;
            if (direction > 4) {
                direction = 1;
            }
        }
    }
    checkShotSatus();
}

function getUnsunkenShips() {
    for (let i = 1; i < cells.length; i++) {
        for (let j = 1; j < cells[i].length; j++) {
            for (let k = 5; k < shipsDown.length; k++) {

                if (cells[i][j].shipP1 === shipsDown[k].name && cells[i][j].shotP2 && !shipsDown[k].down) {
                    return {x: i, y: j};
                }

            }
        }
    }
    return null;
}

function thinkShoot() {
    let shoot = false;
    let cellLocation = {x: 0, y: 0};
    while (!shoot) {
        if (direction === null) {
            direction = Math.ceil(Math.random() * 4);
        }
        const lastHit = lastHits[lastHits.length - 1];
        if (direction === 1) {
            cellLocation = {x: lastHit.x + 1, y: lastHit.y};
            if (cellLocation.x > 10) {
                flipDirection();
                cellLocation = {x: lastHit.x, y: lastHit.y};
            }
        } else if (direction === 2) {
            cellLocation = {x: lastHit.x, y: lastHit.y + 1};
            if (cellLocation.y > 10) {
                flipDirection();
                cellLocation = {x: lastHit.x, y: lastHit.y};
            }
        } else if (direction === 3) {
            cellLocation = {x: lastHit.x - 1, y: lastHit.y};
            if (cellLocation.x < 1) {
                flipDirection();
                cellLocation = {x: lastHit.x, y: lastHit.y};
            }
        } else if (direction === 4) {
            cellLocation = {x: lastHit.x, y: lastHit.y - 1};
            if (cellLocation.y < 1) {
                flipDirection();
                cellLocation = {x: lastHit.x, y: lastHit.y};
            }
        }
        const cell = cells[cellLocation.x][cellLocation.y];
        if (!cell.shotP2) {
            shoot = true;
        } else {
            direction = null;
        }
    }

    return cellLocation;
}

function flipDirection() {
    if (!flippedDirection) {
        flippedDirection = true;
        direction += 2
        if (direction > 4) {
            direction -= 4;
        }
    } else {
        flippedDirection = false;
        direction++;
        if (direction > 4) {
            direction = 1;
        }
    }
    lastHits = lastHits.splice(0, 1);
}


function randomShoot() {
    const notShotCells = [];
    for (let i = 1; i < cells.length; i++) {
        for (let j = 1; j < cells[i].length; j++) {
            if (!cells[i][j].shotP2) {
                notShotCells.push({x: i, y: j});
            }
        }
    }
    const random = Math.floor(Math.random() * notShotCells.length);
    return notShotCells[random];
}

function changeBoard() {
    for (let i = 1; i < cells.length; i++) {
        for (let j = 1; j < cells[i].length; j++) {
            const cell = cells[i][j];
            cell.element.classList = "cell";
            if (!player1 && computer) {
                cell.element.classList.add('cursor-none');
            } else {
                cell.element.classList.add('active');
            }
            if (player1) {
                if (cell.shotP1) {
                    cell.element.classList.add('shot');
                    if (cell.shipP2) {
                        cell.element.classList.add('hit');
                    }
                }
            } else {
                if (cell.shotP2) {
                    cell.element.classList.add('shot');
                    if (cell.shipP1) {
                        cell.element.classList.add('hit');
                    }
                }
            }
        }
    }

    changeTemplateBoard();
}

function changeTemplateBoard() {
    for (let i = 0; i < templateShips.length; i++) {
        templateShips[i].classList.remove('hit');
        const name = templateShips[i].classList[1].split('-').pop();

        for (let j = 0; j < shipsDown.length; j++) {
            if (name === shipsDown[j].name && shipsDown[j].down && shipsDown[j].player === player1) {
                templateShips[i].classList.add('hit');
            }
        }
    }
}

function checkShotSatus() {
    oldShipsDown = [];
    for (let i = 5; i < shipsDown.length; i++) {
        oldShipsDown.push(shipsDown[i].down);
    }
    for (let i = 0; i < shipsDown.length; i++) {
        shipsDown[i].down = true;
    }
    for (let i = 1; i < cells.length; i++) {
        for (let j = 1; j < cells[i].length; j++) {
            const cell = cells[i][j];
            for (let k = 0; k < ships.length; k++) {
                if (cell.shipP2 === ships[k] && !cell.shotP1) {
                    shipsDown[k].down = false;
                }
            }
            for (let k = 0; k < ships.length; k++) {
                if (cell.shipP1 === ships[k] && !cell.shotP2) {
                    shipsDown[k + 5].down = false;
                }
            }
        }
    }
    if (computer) {
        for (let i = 0; i < oldShipsDown.length; i++) {
            if (oldShipsDown[i] !== shipsDown[i + 5].down) {
                lastHits = [];
                direction = null;
                flippedDirection = false;
            }
        }
    }
    changeTemplateBoard();
    checkWinStatus();
}

function checkWinStatus() {
    let winP1 = true;
    let winP2 = true;
    for (let i = 0; i < shipsDown.length; i++) {
        if (!shipsDown[i].down) {
            if (i < shipsDown.length / 2) {
                winP1 = false;
            } else {
                winP2 = false;
            }
        }
    }
    if (winP1) {
        showEndScreen('1');
    } else if (winP2) {
        showEndScreen('2');
    } else {
        switchPlayer();
    }
}

function showAlert(title, alert) {
    alertDiv.children[0].textContent = title;
    alertDiv.children[1].textContent = alert;
    alertDiv.classList.remove('hidden');
}

function removeAlert() {
    alertDiv.classList.add('hidden');
    if (buttonAction === 'nextPlayer') {
        buttonAction = 'none';
        switchPlayer();
    } else if (buttonAction === 'startGame') {
        buttonAction = 'none';
        startGame();
    }

}

function showEndScreen(playerWon) {
    let player = '';
    if (playerWon === '1') {
        player = 'Speler 1'
    } else if (computer) {
        player = 'De computer'
    } else {
        player = 'Speler 2'
    }
    playerWonText.textContent = `${player} heeft gewonnen!`;
    endScreenDiv.classList.remove('hidden');
}

function reset() {
    for (let i = 1; i < cells.length; i++) {
        for (let j = 1; j < cells[i].length; j++) {
            const cell = cells[i][j];
            cell.element.classList = "cell";
            cell.shipP1 = null;
            cell.shipP2 = null;
            cell.shotP1 = false;
            cell.shotP2 = false;
        }
    }
    for (let i = 0; i < templateShips.length; i++) {
        templateShips[i].classList.remove('hit');
        templateShips[i].classList.add('clickable');
    }
    for (let i = 0; i < shipsDown.length; i++) {
        shipsDown[i].down = false;
    }
    playerTurnDiv.classList.add('hidden');
    welcomeDiv.classList.remove('hidden');
    rotation = false;
    gameState = 'off';
    canShoot = false;
    buttonAction = 'none';
    player1 = true;
    endScreenDiv.classList.add('hidden');
    startShooting = true;
}