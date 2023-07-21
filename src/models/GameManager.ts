import { Game } from './Game';

class GameManager {
    static games: Record<string, Game> = {};

    static createNewGame(gameCode: string, user: string): void {
        GameManager.games[gameCode + user] = new Game(gameCode, user);
    }

    static getGame(gameCode: string): Game {
        return GameManager.games[gameCode];
    }


}

export { GameManager };