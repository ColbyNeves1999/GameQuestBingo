import { Response } from 'express';

type SSEClient = {
    userId: string;
    res: Response;
};

class Game {
    gameCode: string;

    players: SSEClient[];

    playerNames: string[];

    spectatorNames: string[];

    board: boolean[][];

    owner: number[][];

    binObj: string[][];

    bal: number;

    winner: string;

    stopGame: number;

    constructor(gameCode: string) {
        this.board = [
            [false, false, false],
            [false, false, false],
            [false, false, false],
        ];

        this.owner = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ];

        this.playerNames = [];

        this.spectatorNames = [];

        this.binObj = [[]];

        this.bal = 3;

        this.gameCode = gameCode;
        this.players = [];

        this.winner = "";

        this.stopGame = 0;

    }

    addPlayer(playerId: string, res: Response): void {
        this.players.push({ userId: playerId, res });
    }

    updatePlayers(data: unknown): void {
        for (const player of this.players) {
            player.res.write(`data: ${JSON.stringify(data)}\n\n`);
        }
    }
}

export { Game };