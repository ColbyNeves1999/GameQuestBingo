/* eslint-disable @typescript-eslint/explicit-function-return-type */

// Immediately subscribe to updates
const gameCode = window.location.pathname.split('/').slice(-1);
const boardEvents = new EventSource(`/board/subscribe/${gameCode}`);

// Get all cells
const cells = Array.from(document.querySelectorAll('.cell'));

// Run this function when we receive an update on the cells state
boardEvents.onmessage = (e) => {
    // `e.data` will be the text from the string in BoardController.ts
    // This string -> `data: ${JSON.stringify(data)}\n\n`
    // So e.data will be this part "JSON.stringify(data)" we just have to parse it now
    const { x, y, z, position, isSelected } = JSON.parse(e.data);
    if (x === undefined) {
        return;
    }

    // Cells is a 1D array but we have 2D indices so we just convert them
    // to a 1D index to get the cell
    const selectedCell = cells[x * z + y];

    // Now toggle the cell's style and text
    if (position != 10) {
        if (isSelected) {

            selectedCell.classList.add(`chosenP${position}`);
            selectedCell.classList.remove('empty');

        } else {

            selectedCell.classList.add('empty');
            for (let i = 1; i <= 4; i++) {
                selectedCell.classList.remove(`chosenP${i}`);
            }

        }
    }

};

async function selectCell(x, y, z, position) {
    // Just send a post request to the server telling it we clicked the cell at (x, y)
    await fetch(`/board/${gameCode}`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ x, y, z, gameCode, position }),
    });

}

async function handleCellClick(event) {
    // event.target will be the cell that was clicked
    const selectedCell = event.target;

    // Get the x & y coordinates we set in the HTML
    const x = parseInt(selectedCell.getAttribute('x'), 10);
    const y = parseInt(selectedCell.getAttribute('y'), 10);
    const z = parseInt(selectedCell.getAttribute('z'), 10);
    const position = parseInt(selectedCell.getAttribute('position'));

    // Then "select" the cell
    await selectCell(x, y, z, position);
}

// Add an event listener to each cell so that our function runs whenever it is clicked
cells.forEach((cell) => cell.addEventListener('click', handleCellClick));