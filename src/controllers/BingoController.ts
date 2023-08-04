import { Request, Response } from 'express';

async function bingoCreatorPage(req: Request, res: Response): Promise<void> {

    if (!req.session.isLoggedIn) {
        res.redirect('/login');
        return;
    }

    const stateOfGame = "";

    res.render('bingoCreator', { stateOfGame });
    return;

}

export { bingoCreatorPage };