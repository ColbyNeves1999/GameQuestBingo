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
    const { x, y, z, position, isSelected, winner, refresh, playerOne, playerTwo, playerThree, playerFour } = JSON.parse(e.data);

    if (x === undefined) {
        return;
    }

    //Checks if a winner has been determined
    if (winner !== "" && !refresh) {

        // Cells is a 1D array but we have 2D indices so we just convert them
        // to a 1D index to get the cell
        const selectedCell = cells[x * z + y];

        // Now toggle the cell's style and text
        if (isSelected) {

            selectedCell.classList.add(`chosenP${position}`);
            selectedCell.classList.remove('empty');

        } else {

            selectedCell.classList.add('empty');
            for (let i = 1; i <= 4; i++) {
                selectedCell.classList.remove(`chosenP${i}`);
            }

        }

        let temp = ""

        //Sets the winner's player tile to Winner
        if (position == 1) {
            temp = document.getElementById('P1').innerHTML;
            document.getElementById('P1').innerHTML = "Winner";
            alert("Winner is: " + temp);
        } else if (position == 2) {
            temp = document.getElementById('P2').innerHTML;
            document.getElementById('P2').innerHTML = "Winner";
            alert("Winner is: " + temp);
        } else if (position == 3) {
            temp = document.getElementById('P3').innerHTML;
            document.getElementById('P3').innerHTML = "Winner";
            alert("Winner is: " + temp);
        } else if (position == 4) {
            temp = document.getElementById('P4').innerHTML;
            document.getElementById('P4').innerHTML = "Winner";
            alert("Winner is: " + temp);
        }

    } else if (refresh == 1) { //If refresh is 1, then it's updating all player's list of players.



        if (!playerOne) {
            document.getElementById('P1').innerHTML = "Player 1 Available";
        } else {
            document.getElementById('P1').innerHTML = playerOne;
        }

        if (!playerTwo) {
            document.getElementById('P2').innerHTML = "Player 2 Available";
        } else {
            document.getElementById('P2').innerHTML = playerTwo;
        }

        if (!playerThree) {
            document.getElementById('P3').innerHTML = "Player 3 Available";
        } else {
            document.getElementById('P3').innerHTML = playerThree;
        }

        if (!playerFour) {
            document.getElementById('P4').innerHTML = "Player 4 Available";
        } else {
            document.getElementById('P4').innerHTML = playerFour;
        }

    } else {
        // Cells is a 1D array but we have 2D indices so we just convert them
        // to a 1D index to get the cell
        const selectedCell = cells[x * z + y];

        // Now toggle the cell's style and text
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

async function selectCell(x, y, z, position, refresh) {
    // Post request to the server telling it we clicked the cell at (x, y) or to refresh the player list
    await fetch(`/board/${gameCode}`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ x, y, z, gameCode, position, refresh }),
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
    const refresh = 0;

    // Then "select" the cell
    await selectCell(x, y, z, position, refresh);
}

//Code to handle player list updates on page when someone loads the page
async function onPageLoad() {

    //Filling in specific values I can use to prevent incorrect data changes
    const x = 200;
    const y = 200;
    const z = 200;
    const position = 200;
    const refresh = 1;

    // Then "select" the cell
    await selectCell(x, y, z, position, refresh);

}

// Add an event listener to each cell so that our function runs whenever it is clicked
cells.forEach((cell) => cell.addEventListener('click', handleCellClick));