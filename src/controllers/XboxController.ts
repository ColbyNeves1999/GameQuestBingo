import { Request, Response } from 'express';
import { xboxAuthModel } from '../models/XboxModel';
import { getUserByEmail } from '../models/UserModel';

async function xboxAuth(req: Request, res: Response): Promise<void> {

    let user = await getUserByEmail(req.session.authenticatedUser.email);
    //await xboxAuthModel(#INSERT XBOX LIVE EMAIL HERE, #INSERT XBOX LIVE PASSWORD HERE, user);
    user = await getUserByEmail(req.session.authenticatedUser.email);

    req.session.authenticatedUser.xboxCode = user.xboxCode;

    res.sendStatus(200);
    return;

}

export { xboxAuth };