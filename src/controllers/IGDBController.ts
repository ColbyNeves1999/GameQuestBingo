import { Request, Response } from 'express';
import { IGDBAuthorizationModel } from '../models/IGDBModel';
import { getUserByEmail } from '../models/UserModel';

async function IGDBAuthorization(req: Request, res: Response): Promise<void> {

    await IGDBAuthorizationModel(req.session.authenticatedUser.email);

    const user = await getUserByEmail(req.session.authenticatedUser.email);

    req.session.authenticatedUser.IGDBCode = user.IGDBCode;

    res.sendStatus(200);
    return;

}

export { IGDBAuthorization };