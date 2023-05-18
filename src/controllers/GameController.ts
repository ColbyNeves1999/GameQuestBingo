import { Request, Response } from 'express';
import { getGames } from '../models/GameModel';

async function getAllGames(req: Request, res: Response): Promise<void> {

    const games = await getGames();

    res.render('gameList', { games });

}

export { getAllGames };