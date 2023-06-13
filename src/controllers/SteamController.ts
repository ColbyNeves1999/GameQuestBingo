import { Request, Response } from 'express';
import { steamGameGrab } from '../models/SteamModel';

async function steamGameGrabController(req: Request, res: Response): Promise<void> {

    await steamGameGrab();

    res.sendStatus(200);
    return;

}

export { steamGameGrabController };