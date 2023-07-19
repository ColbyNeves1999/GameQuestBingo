import { Game } from './Game';

class GameManager {
    static games: Record<string, Game> = {};

    static createNewGame(gameCode: string): void {
        GameManager.games[gameCode] = new Game(gameCode);
    }

    static getGame(gameCode: string): Game {
        return GameManager.games[gameCode];
    }
}

export { GameManager };