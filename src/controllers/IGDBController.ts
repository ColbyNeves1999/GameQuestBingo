import { Request, Response } from 'express';
import { IGDBAuthorizationModel, IGDBGameDatabasePullModel } from '../models/IGDBModel';
import { getUserByEmail } from '../models/UserModel';

//Saves the Authorization code for the user's account and current session
async function IGDBAuthorization(req: Request, res: Response): Promise<void> {

    await IGDBAuthorizationModel(req.session.authenticatedUser.email);

    const user = await getUserByEmail(req.session.authenticatedUser.email);
    req.session.authenticatedUser.IGDBCode = user.IGDBCode;

    res.sendStatus(200);
    return;

}

//Initiates the IGDB pulls
async function IGDBGameDatabasePull(req: Request, res: Response): Promise<void> {

    const user = await getUserByEmail(req.session.authenticatedUser.email);
    req.session.authenticatedUser.IGDBCode = user.IGDBCode;

    await IGDBGameDatabasePullModel(req.session.authenticatedUser.email);

    res.sendStatus(200);
    return;

}

export { IGDBAuthorization, IGDBGameDatabasePull };