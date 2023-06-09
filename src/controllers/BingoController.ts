import { Request, Response } from 'express';

import { bingoSelector } from '../models/BingoModel';

async function bingoCreatorPage(req: Request, res: Response): Promise<void> {

    res.render('bingoCreator', {});

}

async function selectBingoObjectives(req: Request, res: Response): Promise<void> {

    const { title, size } = req.body as bingoPara;
    //console.log(title, size);

    console.log(await bingoSelector(size, title));

    res.sendStatus(200);
    return;

}

export { selectBingoObjectives, bingoCreatorPage };