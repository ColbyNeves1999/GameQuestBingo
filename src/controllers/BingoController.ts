import { Request, Response } from 'express';

import { bingoSelector } from '../models/BingoModel';

async function bingoCreatorPage(req: Request, res: Response): Promise<void> {

    const stateOfGame = "";

    res.render('bingoCreator', { stateOfGame });
    return;

}

async function selectBingoObjectives(req: Request, res: Response): Promise<void> {

    const { title, size } = req.body as bingoPara;

    const array = await bingoSelector(size, title);

    if (!array) {
        const stateOfGame = "Sorry, there are not enough objectives for this game to make a card. You can add your own though!"
        res.render('bingoCreator', { stateOfGame });
        return;
    }

    res.sendStatus(200);
    return;

}

export { selectBingoObjectives, bingoCreatorPage };