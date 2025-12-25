const battleshipLayout = document.querySelector('.battleship');
const templateLayout = document.querySelector('.ships');
const templateShips = document.querySelectorAll('.template-ship');
let ship = {};
let rotation = false;
let computer = true;
let player1 = true;
let gameState = false;
let canShoot = false;

const shipsPlaced = {
    patrol: false,
    submarine: false,
    destroyer: false,
    battleship: false,
    carrier: false,
}

let ships = [];
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
                if (gameState) {
                    shoot(i, j);
                } else {
                    placeShip(i, j, false);
                }
            });
            cellDiv.addEventListener('mouseover', () => {
                hoverShip(i, j);
            });
            cellDiv.addEventListener('mouseout', () => {
                removeHover();
            });
            cellDiv.addEventListener('contextmenu', (e) => {
                changeRotation(e, i, j);
            });
            cellsX[j] = {
                element: cellDiv,
                shipP1: false,
                shipP2: false,
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
    }
}

function placeShip(x, y, computer) {
    if (ship.name === undefined && !computer) {
        alert('Kies een schip');
        //TODO: make better alert
        return false;
    }

    if (shipsPlaced[ship.name] && !computer) {
        alert('Dit schip is al geplaatst');
        //TODO: make better alert
        return false;
    }

    const shipObject = createShip(x, y);
    if (!shipObject) {
        if (!computer) {
            alert('Je kan het ship niet plaatsen');
            // TODO: make better alert
        }
        return false;
    }

    if (!computer) {
        shipsPlaced[ship.name] = true;
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
        alert("Alle schepen geplaatst");
        //TODO: better alert
        switchPlayer();
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
            cell.shipP1 = true;
        } else {
            cell.shipP2 = true;
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

function removeHover() {
    const hover = document.querySelectorAll('.ship-hover');
    for (let i = 0; i < hover.length; i++) {
        battleshipLayout.removeChild(hover[i]);
    }
}

function chooseShip(e) {
    if (e.target.classList.contains('used')) {
        alert('Dit schip is al geplaatst');
        //TODO: better alert
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
    rotation = !rotation;
    removeHover();
    hoverShip(x, y);
}

function switchPlayer() {
    canShoot = false;
    player1 = !player1;
    console.log(player1);
    if (gameState) {
        setTimeout(() => {
            changeBoard();
            if (computer && !player1) {
                shootComputer();
            } else {
                canShoot = true;
            }
        }, 500);

        return;
    }
    if (computer) {
        placeComputerShips();
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
    alert("computer heeft alle schepen geplaatst");
    // TODO: better alert
    startGame();
}

function startGame() {
    gameState = true;
    switchPlayer();
}

function shoot(x, y) {
    if (computer && !player1 || !canShoot) {
        return;
    }
    const cell = cells[x][y];
    if (player1) {
        if (cell.shotP1) {
            alert('already shot');
            //TODO: better alert
            return;
        }

        cell.shotP1 = true;
        cells[x][y].element.classList.add('shot');

        if (cell.shipP2) {
            cells[x][y].element.classList.add('hit');
        }

    }
    switchPlayer();
}

function shootComputer() {
    const notShotCells = [];
    for (let i = 1; i < cells.length; i++) {
        for (let j = 1; j < cells[i].length; j++) {
            if (!cells[i][j].shotP2) {
                notShotCells.push(cells[i][j]);
            }
        }
    }
    const random = Math.floor(Math.random() * notShotCells.length);
    const cell = notShotCells[random];
    cell.shotP2 = true;
    cell.element.classList.add('shot');
    if (cell.shipP1) {
        cell.element.classList.add('hit');
    }
    switchPlayer();
}

function changeBoard() {
    for (let i = 1; i < cells.length; i++) {
        for (let j = 1; j < cells[i].length; j++) {
            const cell = cells[i][j];
            cell.element.classList = "cell";
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
}