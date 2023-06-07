import { AppDataSource } from '../dataSource';
import { Objective } from '../entities/UserObjectiveList';
import { User } from '../entities/User';
import { Game } from '../entities/Game';

const objectiveRepository = AppDataSource.getRepository(Objective);

async function addObjective(title: Game, objective: string, user: User) {

    let newObj = new Objective();
    newObj.objective = objective;
    newObj.game = title;
    newObj.user = user;

    newObj = await objectiveRepository.save(newObj);

    return;

}

export { addObjective };