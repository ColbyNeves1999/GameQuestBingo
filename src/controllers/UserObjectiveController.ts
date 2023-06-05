import { Request, Response } from 'express';

import { getUserByEmail } from '../models/UserModel';
import { addObjective } from '../models/UserObjectivesModel';
import { getGameByName } from '../models/GameModel';

async function objectiveSubmittedPage(req: Request, res: Response): Promise<void> {

    res.render('submittedObjectiveList', {});

}

async function objectiveSubmit(req: Request, res: Response): Promise<void> {

    const { title, objective } = req.body as objPara;
    const game = await getGameByName(title);
    const user = await getUserByEmail(req.session.authenticatedUser.email);

    if (!user) {
        res.redirect('/login');
        return;
    }

    if (!game) {

        const errorOcc = "An error occured during submission";
        res.render('submittedObjectiveList', { errorOcc });
        return;

    }

    await addObjective(game, objective, user);

    res.sendStatus(200);
    return;

}

export { objectiveSubmittedPage, objectiveSubmit };