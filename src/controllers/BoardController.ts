import { Request, Response } from 'express';
import { bingoSelector } from '../models/BingoModel';

import { Game } from '../models/Game';
import { GameManager } from '../models/GameManager';

type SSEClient = {
    userId: string;
    res: Response;
};

// This array will hold all of the clients that are waiting for updates
let clients: SSEClient[] = [];

// I just made this as a dummy "board"
let board = [
    [false, false, false],
    [false, false, false],
    [false, false, false],
];

function subscribeToUpdates(req: Request, res: Response): void {
    // I'm just doing this since I'll be using the userId. up to you if you want them to be logged in
    // But you'll need a unique identifier for the clients.
    if (!req.session.isLoggedIn) {
        res.sendStatus(403);
    }

    const { userId } = req.session.authenticatedUser;

    // These headers will tell the client to keep the HTTP connection alive so we can stream data
    // as often as we want
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush the headers to establish SSE with client

    // Add the new client to our array of clients
    clients.push({ userId, res });

    // We need to remove the client from the array when they close their connection
    // this happens if they navigate to another page/close the tab or browser/lose internet
    req.on('close', () => {
        console.log(`${userId} Connection closed`);
        clients = clients.filter((client) => client.userId !== userId);
    });
}

function broadcastUpdate(data: unknown): void {
    // So you have to send data in a string in the format "data: <Data you want to send as JSON>\n\n"
    // You **must** have the literal text "data: " in the string and ending with two newlines
    clients.forEach((client) => client.res.write(`data: ${JSON.stringify(data)}\n\n`));
}

function updateBoard(req: Request, res: Response): void {
    console.log(req.body);
    const { x, y, z } = req.body as { x: number; y: number; z: number };

    board[x][y] = !board[x][y]; // toggle the cell
    const update = {
        x,
        y,
        z,
        isSelected: board[x][y],
    };
    broadcastUpdate(update);
    res.json(update);
}

function renderBoard(req: Request, res: Response): void {
    res.render('boardPage', { board });
}

async function selectBingoObjectives(req: Request, res: Response): Promise<void> {

    const { title, size, inex, free, gameCode } = req.body as bingoPara;
    const temp = title.toLowerCase();

    const bingoArray = await bingoSelector(size, temp, inex, free);

    if (!bingoArray) {
        const stateOfGame = "Sorry, there are not enough objectives for this game to make a card. You can add your own though!";
        res.render('bingoCreator', { stateOfGame });
        return;
    }

    let bal = 3;

    if (bingoArray.length == 25) {
        bal = 5;
        board = [
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
        ];
    } else if (bingoArray.length == 81) {
        bal = 9;
        board = [
            [false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false],
        ];
    }

    let binObj;

    if (bingoArray.length == 9) {
        binObj = [
            [bingoArray[0], bingoArray[1], bingoArray[2]],
            [bingoArray[3], bingoArray[4], bingoArray[5]],
            [bingoArray[6], bingoArray[7], bingoArray[8]],
        ];
    } else if (bingoArray.length == 25) {

        binObj = [
            [bingoArray[0], bingoArray[1], bingoArray[2], bingoArray[3], bingoArray[4]],
            [bingoArray[5], bingoArray[6], bingoArray[7], bingoArray[8], bingoArray[9]],
            [bingoArray[10], bingoArray[11], bingoArray[12], bingoArray[13], bingoArray[14]],
            [bingoArray[15], bingoArray[16], bingoArray[17], bingoArray[18], bingoArray[19]],
            [bingoArray[20], bingoArray[21], bingoArray[22], bingoArray[23], bingoArray[24]]
        ];

    } else {
        binObj = [
            [bingoArray[0], bingoArray[1], bingoArray[2], bingoArray[3], bingoArray[4], bingoArray[5], bingoArray[6], bingoArray[7], bingoArray[8]],
            [bingoArray[9], bingoArray[10], bingoArray[11], bingoArray[12], bingoArray[13], bingoArray[14], bingoArray[15], bingoArray[16], bingoArray[17]],
            [bingoArray[18], bingoArray[19], bingoArray[20], bingoArray[21], bingoArray[22], bingoArray[23], bingoArray[24], bingoArray[25], bingoArray[26]],
            [bingoArray[27], bingoArray[28], bingoArray[29], bingoArray[30], bingoArray[31], bingoArray[32], bingoArray[33], bingoArray[34], bingoArray[35]],
            [bingoArray[36], bingoArray[37], bingoArray[38], bingoArray[39], bingoArray[40], bingoArray[41], bingoArray[42], bingoArray[43], bingoArray[44]],
            [bingoArray[45], bingoArray[46], bingoArray[47], bingoArray[48], bingoArray[49], bingoArray[50], bingoArray[51], bingoArray[52], bingoArray[53]],
            [bingoArray[54], bingoArray[55], bingoArray[56], bingoArray[57], bingoArray[58], bingoArray[59], bingoArray[60], bingoArray[61], bingoArray[62]],
            [bingoArray[63], bingoArray[64], bingoArray[65], bingoArray[66], bingoArray[67], bingoArray[68], bingoArray[69], bingoArray[70], bingoArray[71]],
            [bingoArray[72], bingoArray[73], bingoArray[74], bingoArray[75], bingoArray[76], bingoArray[77], bingoArray[78], bingoArray[79], bingoArray[80]]
        ];
    }

    const newGame = new Game(gameCode);

    res.render('boardPage', { board, bal, binObj });
    return;

}

export { subscribeToUpdates, updateBoard, renderBoard, selectBingoObjectives };