import { Request, Response } from 'express';
import { xboxAuthModel } from '../models/XboxModel';

async function xboxAuth(req: Request, res: Response): Promise<void> {

    //await xboxAuthModel();

    res.sendStatus(200);
    return;

}

export { xboxAuth };