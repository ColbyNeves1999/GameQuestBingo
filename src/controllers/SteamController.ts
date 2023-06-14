import { Request, Response } from 'express';
import { steamGameGrab } from '../models/SteamModel';

async function steamGameGrabController(req: Request, res: Response): Promise<void> {

    await steamGameGrab();

    res.sendStatus(200);
    return;

}

//Now defunct since steamAchievementGrab is ran when steamGameGrab. Leaving for possible future use
/*async function steamAchievementGrabController(req: Request, res: Response): Promise<void> {

    await steamAchievementGrab();

    res.sendStatus(200);
    return;

}*/

export { steamGameGrabController };