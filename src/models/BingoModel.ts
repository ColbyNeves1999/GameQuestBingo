import { AppDataSource } from '../dataSource';
import { Objective } from '../entities/UserObjectiveList';
import { Game } from '../entities/Game';

import { getGameByName } from './GameModel';

const objectiveRepository = AppDataSource.getRepository(Objective);
const gameRepository = AppDataSource.getRepository(Game);

async function bingoSelector(size: number, title: string): Promise<string[] | null> {

    const game = await getGameByName(title);
    const gameID = game.gameId;
    const listOfObjectives = await objectiveRepository
        .createQueryBuilder('objectives')
        .where('gameGameID = :gameID', { gameID })
        .getMany();
    let errorOcc = "Card generated";

    //Size options are 3x3, 5x5, 9x9
    let bingoObjectives;

    if (size === 3) {
        bingoObjectives = 9;
    } else if (size === 5) {
        bingoObjectives = 25;
    } else {
        bingoObjectives = 81;
    }



}

export { bingoSelector };