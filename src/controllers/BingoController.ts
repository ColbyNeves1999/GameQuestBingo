import { Request, Response } from 'express';

import { getUserByEmail } from '../models/UserModel';

async function bingoCreatorPage(req: Request, res: Response): Promise<void> {

    const user = await getUserByEmail(req.session.authenticatedUser.email);

    if (!user) {
        res.redirect('/login');
        return;
    }

    const stateOfGame = "";

    res.render('bingoCreator', { stateOfGame });
    return;

}

export { bingoCreatorPage };