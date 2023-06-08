import { AppDataSource } from '../dataSource';
import { Objective } from '../entities/UserObjectiveList';
import { User } from '../entities/User';
import { Game } from '../entities/Game';

import { getGameByName } from './GameModel';

const objectiveRepository = AppDataSource.getRepository(Objective);

async function addObjective(title: Game, objective: string, user: User): Promise<void> {

    let newObj = new Objective();
    newObj.objective = objective;
    newObj.game = title;
    newObj.user = user;

    newObj = await objectiveRepository.save(newObj);

    return;

}

async function getObj(objective: string, title: string): Promise<Objective | null> {

    const game = await getGameByName(title);
    const gameID = game.gameId;

    return objectiveRepository.createQueryBuilder('song')
        .where('objective = :objective and gameGameID = :gameID', { objective, gameID })
        .getOne();
}

export { addObjective, getObj };