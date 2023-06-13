import { Request, Response } from 'express';
import { steamGameGrab, steamAchievementGrab } from '../models/SteamModel';

async function steamGameGrabController(req: Request, res: Response): Promise<void> {

    await steamGameGrab();

    res.sendStatus(200);
    return;

}

async function steamAchievementGrabController(req: Request, res: Response): Promise<void> {

    await steamAchievementGrab();

    res.sendStatus(200);
    return;

}

export { steamGameGrabController, steamAchievementGrabController };