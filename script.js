const board = document.querySelector('#field');
const status = document.querySelector('#status');
const moveCountLabel = document.querySelector('#move-count');
const resetButton = document.querySelector('#reset');
const boardSize = 8;
const files = 'abcdefgh';
const knightMoves = [
    [1, 2], [2, 1], [2, -1], [1, -2],
    [-1, -2], [-2, -1], [-2, 1], [-1, 2]
];

let knightPosition = null;
let moveCount = 0;

function squareName(file, rank) {
    return `${files[file]}${boardSize - rank}`;
}

function getLegalMoves(file, rank) {
    return knightMoves
        .map(([fileOffset, rankOffset]) => [file + fileOffset, rank + rankOffset])
        .filter(([nextFile, nextRank]) =>
            nextFile >= 0 && nextFile < boardSize && nextRank >= 0 && nextRank < boardSize
        );
}

function createBoard() {
    const squares = document.createDocumentFragment();

    for (let rank = 0; rank < boardSize; rank++) {
        for (let file = 0; file < boardSize; file++) {
            const square = document.createElement('button');
            square.type = 'button';
            square.className = `square ${(file + rank) % 2 === 0 ? 'square-light' : 'square-dark'}`;
            square.dataset.file = file;
            square.dataset.rank = rank;
            square.dataset.coordinate = squareName(file, rank);
            square.setAttribute('aria-label', squareName(file, rank));
            square.innerHTML = '<span class="piece" aria-hidden="true"></span>';
            squares.append(square);
        }
    }

    board.append(squares);
}

function updateBoard() {
    const legalMoves = knightPosition ? getLegalMoves(...knightPosition) : [];

    board.querySelectorAll('.square').forEach((square) => {
        const file = Number(square.dataset.file);
        const rank = Number(square.dataset.rank);
        const isKnight = knightPosition && file === knightPosition[0] && rank === knightPosition[1];
        const isLegalMove = legalMoves.some(([nextFile, nextRank]) => file === nextFile && rank === nextRank);

        square.classList.toggle('is-knight', Boolean(isKnight));
        square.classList.toggle('is-legal', isLegalMove);
        square.setAttribute('aria-pressed', String(Boolean(isKnight)));
        square.setAttribute('aria-label', `${squareName(file, rank)}${isKnight ? ', конь' : isLegalMove ? ', возможный ход' : ''}`);
        square.querySelector('.piece').textContent = isKnight ? '♘' : '';
    });

    if (!knightPosition) {
        status.textContent = 'Выберите клетку для коня.';
        return;
    }

    const destinations = legalMoves.map(([file, rank]) => squareName(file, rank));
    status.textContent = `Конь на ${squareName(...knightPosition)}. Возможные ходы: ${destinations.join(', ')}.`;
}

board.addEventListener('click', (event) => {
    const square = event.target.closest('.square');
    if (!square) return;

    const nextPosition = [Number(square.dataset.file), Number(square.dataset.rank)];
    const isLegalMove = knightPosition && getLegalMoves(...knightPosition)
        .some(([file, rank]) => file === nextPosition[0] && rank === nextPosition[1]);

    if (isLegalMove) {
        moveCount++;
        moveCountLabel.textContent = moveCount;
    }

    knightPosition = nextPosition;
    updateBoard();
});

board.addEventListener('keydown', (event) => {
    const directions = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0]
    };
    const direction = directions[event.key];
    const square = event.target.closest('.square');
    if (!direction || !square) return;

    event.preventDefault();
    const file = Number(square.dataset.file) + direction[0];
    const rank = Number(square.dataset.rank) + direction[1];
    const target = board.querySelector(`[data-file="${file}"][data-rank="${rank}"]`);
    if (target) target.focus();
});

resetButton.addEventListener('click', () => {
    knightPosition = null;
    moveCount = 0;
    moveCountLabel.textContent = moveCount;
    updateBoard();
    board.querySelector('.square').focus();
});

createBoard();
updateBoard();