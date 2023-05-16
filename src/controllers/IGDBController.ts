import { Request, Response } from 'express';
import { IGDBAuthorizationModel } from '../models/IGDBModel';

async function IGDBAuthorization(req: Request, res: Response): Promise<void> {

    await IGDBAuthorizationModel(req.session.authenticatedUser.email);

    return;

}

export { IGDBAuthorization };