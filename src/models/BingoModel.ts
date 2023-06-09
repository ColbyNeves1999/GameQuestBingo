import { AppDataSource } from '../dataSource';
import { Objective } from '../entities/UserObjectiveList';

import { getGameByName } from './GameModel';

const objectiveRepository = AppDataSource.getRepository(Objective);

async function bingoSelector(size: number, title: string): Promise<string[] | null> {

    const game = await getGameByName(title);
    const gameID = game.gameId;
    const listOfObjectives = await objectiveRepository
        .createQueryBuilder('objectives')
        .where('gameGameID = :gameID', { gameID })
        .getMany();
    const objLen = listOfObjectives.length;
    const bingoArray: string[] = [];

    //Size options are 3x3, 5x5, 9x9
    let bingoObjectives;

    if (size === 3) {
        bingoObjectives = 9;
    } else if (size === 5) {
        bingoObjectives = 25;
    } else if (size === 9) {
        bingoObjectives = 81;
    } else {
        return null;
    }

    //Prevents bingo cards bigger than number of objectives
    if (size === 9 && objLen < 81 && objLen >= 25) {
        bingoObjectives = 25;
    } else if (size === 9 && objLen < 25 && objLen >= 9) {
        bingoObjectives = 9
    } else if (size === 5 && objLen < 25 && objLen >= 9) {
        bingoObjectives = 9;
    } else {
        return null;
    }

    for (let i = 0; i < bingoObjectives; i++) {

        let addedObj = listOfObjectives[Math.floor(Math.random() * objLen) + 1];

        if (bingoArray.length === 0) {

            bingoArray[0] = addedObj.objective;

        } else if (bingoArray.includes(addedObj.objective)) {
            i--;
        } else {
            bingoArray[i] = addedObj.objective;
        }

    }

    return bingoArray;

}

export { bingoSelector };