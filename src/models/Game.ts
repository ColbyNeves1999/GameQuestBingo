import { Response } from 'express';

type SSEClient = {
    userId: string;
    res: Response;
};

class Game {
    gameCode: string;

    players: SSEClient[];

    board: boolean[][];

    binObj: string[][];

    sessionLeader: string;

    bal: number;

    constructor(gameCode: string, user: string) {
        this.board = [
            [false, false, false],
            [false, false, false],
            [false, false, false],
        ];

        this.binObj = [[]];

        this.bal = 3;

        this.sessionLeader = "";

        this.gameCode = gameCode + user;
        this.players = [];
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