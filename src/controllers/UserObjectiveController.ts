import { Request, Response } from 'express';

import { getUserByEmail } from '../models/UserModel';
import { addObjective, getObj, getAllGameObjectives, deleteObjective } from '../models/UserObjectivesModel';
import { getGameByName } from '../models/GameModel';

async function objectiveSubmittedPage(req: Request, res: Response): Promise<void> {

    if (!req.session.isLoggedIn) {
        res.redirect('/login');
        return;
    }

    const errorOcc = "";
    res.render('userObjectiveList', { errorOcc });

}

async function objectiveSubmit(req: Request, res: Response): Promise<void> {

    const { title, objective } = req.body as objPara;
    const game = await getGameByName(title);
    const user = await getUserByEmail(req.session.authenticatedUser.email);

    let errorOcc = "Objective submitted";

    if (!user) {
        res.redirect('/login');
        return;
    }

    if (!game) {

        errorOcc = "No game with that title exists";
        res.render('userObjectiveList', { errorOcc });
        return;

    }

    const obj = await getObj(objective, title);

    if (obj) {

        errorOcc = "Someone has submitted that before";
        res.render('userObjectiveList', { errorOcc });
        return;

    }

    await addObjective(game, objective, user);

    res.render('userObjectiveList', { errorOcc });
    return;

}

async function displayObjectives(req: Request, res: Response): Promise<void> {

    const { title } = req.body as objPara;
    const temp = title.toLowerCase();

    const objectives = await getAllGameObjectives(temp);

    res.render('gameObjectivePage', { title, objectives });

}

async function deletePlayerObjective(req: Request, res: Response): Promise<void> {

    const user = await getUserByEmail(req.session.authenticatedUser.email);

    const { objectiveID, title } = req.body as objPara;
    const temp = title.toLowerCase();

    if (user.admin === false) {
        return;
    }

    await deleteObjective(objectiveID);

    const objectives = await getAllGameObjectives(temp);

    res.render('gameObjectivePage', { title, objectives });

}

export { objectiveSubmittedPage, objectiveSubmit, displayObjectives, deletePlayerObjective };