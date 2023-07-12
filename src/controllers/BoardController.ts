import { Request, Response } from 'express';
import { bingoSelector } from '../models/BingoModel';

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
    const { x, y } = req.body as { x: number; y: number };

    board[x][y] = !board[x][y]; // toggle the cell
    const update = {
        x,
        y,
        isSelected: board[x][y],
    };
    broadcastUpdate(update);
    res.json(update);
}

function renderBoard(req: Request, res: Response): void {
    res.render('boardPage', { board });
}

async function selectBingoObjectives(req: Request, res: Response): Promise<void> {

    const { title, size, inex, free } = req.body as bingoPara;
    const temp = title.toLowerCase();

    const bingoArray = await bingoSelector(size, temp, inex, free);

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

    if (!bingoArray) {
        const stateOfGame = "Sorry, there are not enough objectives for this game to make a card. You can add your own though!";
        res.render('bingoCreator', { stateOfGame });
        return;
    }

    res.render('boardPage', { board, bal })
    //res.render('bingoDisplay', { bingoArray, title, size, inex, free });
    return;

}

export { subscribeToUpdates, updateBoard, renderBoard, selectBingoObjectives };