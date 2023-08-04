//Base code for online board play provided Christopher Saldivar;

import { Request, Response } from 'express';
import { bingoSelector } from '../models/BingoModel';

import { GameManager } from '../models/GameManager';
import { Game } from '../models/Game';
//import argon2 from 'argon2';


function subscribeToUpdates(req: Request, res: Response): void {

    if (!req.session.isLoggedIn) {
        res.sendStatus(403);
    }

    const { gameCode } = req.params as bingoCode;

    const game = GameManager.getGame(gameCode);

    const { userId } = req.session.authenticatedUser;

    // These headers will tell the client to keep the HTTP connection alive so we can stream data
    // as often as we want
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush the headers to establish SSE with client

    // Add the new players to our array of players
    game.players.push({ userId, res })

    // We need to remove the player from the array when they close their connection
    // this happens if they navigate to another page/close the tab or browser/lose internet
    req.on('close', () => {
        console.log(`${userId} Connection closed`);
        game.players = game.players.filter((client) => client.userId !== userId);
    });
}

function broadcastUpdate(data: unknown, game: Game): void {

    // So you have to send data in a string in the format "data: <Data you want to send as JSON>\n\n"
    // You **must** have the literal text "data: " in the string and ending with two newlines
    game.players.forEach((client) => client.res.write(`data: ${JSON.stringify(data)}\n\n`));

}

function updateBoard(req: Request, res: Response): void {

    const { x, y, z, gameCode, position, refresh } = req.body as { x: number; y: number; z: number, gameCode: string, position: number, refresh: number };

    const game = GameManager.getGame(gameCode);

    //stopGame will always be 0 until someone gets a bingo, it is then set to 1
    if (game.stopGame === 0) {

        //10 prevents spectators from modifying the board, and 200 is used for 
        //refreshing the player list so that when a player joins, the list updates for everyone
        if (position != 10 && position != 200) {

            if (game.owner[x][y] == 0) {

                game.owner[x][y] = position;

            } else {
                game.owner[x][y] = 0;
            }

            game.board[x][y] = !game.board[x][y]; // toggle the cell

        }

        //Checks for a bingo in every direction from the position that is clicked
        //!200 is to prevent this from triggering when player list refreshes
        if (z && z !== 200) {

            let count = 0;

            //Horizontal check
            for (let i = 0; i < z; i++) {

                if (game.owner[i][y] === position) {
                    count++;
                }

            }

            if (count === z) {
                game.winner = req.session.authenticatedUser.email;
            } else {

                count = 0;

                //Vertical check
                for (let i = 0; i < z; i++) {

                    if (game.owner[x][i] === position) {
                        count++;
                    }

                }

                if (count === z) {
                    game.winner = req.session.authenticatedUser.email;
                } else {

                    count = 0;

                    //Left Diagonal check
                    for (let i = 0; i < z; i++) {

                        if (game.owner[i][i] === position) {
                            count++;
                        }

                    }

                    if (count === z) {
                        game.winner = req.session.authenticatedUser.email;
                    } else {

                        count = 0;

                        //Temp is used to keep track from the right side
                        let temp = z - 1;

                        //Right Diagonal check
                        for (let i = 0; i < z; i++) {

                            if (game.owner[i][temp] === position) {
                                count++;
                            }

                            temp = temp - 1;

                        }

                        if (count === z) {
                            game.winner = req.session.authenticatedUser.email;
                        }

                    }

                }
            }

        }

        let update;
        const winner = game.winner;

        //Different data is sent based on whether we're refreshing the player list or the board
        if (refresh == 0) {
            update = {
                x,
                y,
                z,
                position,
                winner,
                isSelected: game.board[x][y],
            };
        } else {
            update = {
                x,
                y,
                z,
                position,
                refresh,
                playerOne: game.playerNames[0],
                playerTwo: game.playerNames[1],
                playerThree: game.playerNames[2],
                playerFour: game.playerNames[3]
            };
        }


        broadcastUpdate(update, game);
        res.json(update);

        //This happens after broadcastUpdate because it would prevent proper board updates
        if (game.winner !== "") {
            game.stopGame = 1
        }
    }
}

//Central board rendering function. Allows for less code when joining/creating boards
function renderBoard(req: Request, res: Response): void {

    const { gameCode } = req.params as bingoCode;

    const game = GameManager.getGame(gameCode);

    let position = 0;

    //Controls game size. If there are already 4 players in the game, then any later joins will be spectators
    if (game.playerNames.length >= 4 && !game.playerNames.includes(req.session.authenticatedUser.email)) {

        position = 10;
        game.spectatorNames.push(req.session.authenticatedUser.email);
        game.addPlayer(req.session.authenticatedUser.email, res);

    } else {

        if (game.playerNames.length >= 4 && !game.playerNames.includes(req.session.authenticatedUser.email)) {

            const stateOfGame = "Sorry, this game is at maximum capacity. But you can make you own!";
            res.render('bingoCreator', { stateOfGame });
            return;

        }

        let inIt = 0;
        for (let i = 0; i < game.players.length; i++) {
            if (game.players[i].userId === req.session.authenticatedUser.email) {
                inIt = 1;
            }
        }

        if (inIt === 0) {
            game.addPlayer(req.session.authenticatedUser.email, res);
            game.playerNames.push(req.session.authenticatedUser.email);
        }

        if (game.playerNames[0] == req.session.authenticatedUser.email) {

            position = 1;

        } else if (game.playerNames[1] == req.session.authenticatedUser.email) {

            position = 2;

        } else if (game.playerNames[2] == req.session.authenticatedUser.email) {

            position = 3;

        } else {
            position = 4;
        }
    }

    let titleArr;

    if (game.bal === 3) {
        titleArr = ["G", "Q", "B"];
    } else if (game.bal === 5) {
        titleArr = ["B", "I", "N", "G", "O"];
    } else {
        titleArr = ["G", "A", "M", "E", "Q", "U", "E", "S", "T"];
    }

    res.render('boardPage', { game, position, titleArr });
}

//Renders the Bingo join page
function bingoJoinPage(req: Request, res: Response): void {

    if (!req.session.isLoggedIn) {
        res.redirect('/login');
        return;
    }

    res.render('bingoJoin', {});

}

//Manages the joining of a session and renders the board once done
async function sessionJoin(req: Request, res: Response): Promise<void> {

    if (!req.session.isLoggedIn) {
        res.redirect('/login');
        return;
    }

    const { gameCode, sessionLeader } = req.body as bingoPara;

    const code = gameCode + sessionLeader;
    //TODO: Hide key from URL. Mainly to allow anyone streaming to hide their key.
    //const codeHash = await argon2.hash(code);

    const game = GameManager.getGame(code); // to get a game

    if (!game) {
        res.redirect('/bingoJoinPage');
        return;
    }

    res.redirect(`/board/${game.gameCode}`);

}

//Selects the bingo objectives and then creates the board for said objectives
async function selectBingoObjectives(req: Request, res: Response): Promise<void> {

    if (!req.session.isLoggedIn) {
        res.redirect('/login');
        return;
    }

    const { title, size, inex, free, gameCode } = req.body as bingoPara;
    const temp = title.toLowerCase();

    //bal stands for bingo array length
    let bal = 3;
    let binObj;
    let boardOwner;

    let board = [
        [false, false, false],
        [false, false, false],
        [false, false, false],
    ];

    const bingoArray = await bingoSelector(size, temp, inex, free);

    if (!bingoArray) {
        const stateOfGame = "Sorry, there are not enough objectives for this game to make a card. You can add your own though!";
        res.render('bingoCreator', { stateOfGame });
        return;
    }

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

    //TODO: Condense 220-271; Leave alone till project is mostly finished
    //Creates the bingo board's array of data, and the True/False array for board
    if (bingoArray.length == 9) {
        binObj = [
            [bingoArray[0], bingoArray[1], bingoArray[2]],
            [bingoArray[3], bingoArray[4], bingoArray[5]],
            [bingoArray[6], bingoArray[7], bingoArray[8]],
        ];
        boardOwner = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ];
    } else if (bingoArray.length == 25) {

        binObj = [
            [bingoArray[0], bingoArray[1], bingoArray[2], bingoArray[3], bingoArray[4]],
            [bingoArray[5], bingoArray[6], bingoArray[7], bingoArray[8], bingoArray[9]],
            [bingoArray[10], bingoArray[11], bingoArray[12], bingoArray[13], bingoArray[14]],
            [bingoArray[15], bingoArray[16], bingoArray[17], bingoArray[18], bingoArray[19]],
            [bingoArray[20], bingoArray[21], bingoArray[22], bingoArray[23], bingoArray[24]]
        ];
        boardOwner = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
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
        boardOwner = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]
        ];
    }

    const code = gameCode + req.session.authenticatedUser.email;

    //TODO: Hide key from URL. Mainly to allow anyone streaming to hide their key.
    //const codeHash = await argon2.hash(code); 

    GameManager.createNewGame(code); // to add a new game
    const game = GameManager.getGame(code); // to get a game

    game.board = board;
    game.binObj = binObj;
    game.bal = bal;
    game.owner = boardOwner;

    //Redirects to "generic" board rendering function
    res.redirect(`/board/${game.gameCode}`);

}

export { subscribeToUpdates, updateBoard, renderBoard, selectBingoObjectives, bingoJoinPage, sessionJoin };