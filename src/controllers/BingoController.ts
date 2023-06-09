import { Request, Response } from 'express';

//import { Objective } from '../entities/UserObjectiveList';

async function selectBingoObjectives(req: Request, res: Response): Promise<void> {

    const { title, size } = req.body as bingoPara;
    console.log(title, size);

    res.sendStatus(200);
    return;

}

export { selectBingoObjectives };