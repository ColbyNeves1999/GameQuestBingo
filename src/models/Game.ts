import { Response } from 'express';

type SSEClient = {
    userId: string;
    res: Response;
};

class Game {
    gameCode: string;

    players: SSEClient[];

    board: boolean[][];

    constructor(gameCode: string) {
        this.board = [
            [false, false, false],
            [false, false, false],
            [false, false, false],
        ];

        this.gameCode = gameCode;
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