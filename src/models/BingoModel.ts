import { AppDataSource } from '../dataSource';
import { Objective } from '../entities/UserObjectiveList';

import { getGameByName } from './GameModel';

const objectiveRepository = AppDataSource.getRepository(Objective);

async function bingoSelector(size: number, title: string): Promise<string[] | null> {

    //Ends function if requested game doesn't exist
    const game = await getGameByName(title);
    if (!game) {

        return null;

    }

    const gameID = game.gameId;
    //Makes an array of objectives for the given game
    const listOfObjectives = await objectiveRepository
        .createQueryBuilder('objectives')
        .where('gameGameID = :gameID', { gameID })
        .getMany();
    const objLen = listOfObjectives.length;
    const bingoArray: string[] = [];

    //Makes sure there are some objectives for the game
    if (listOfObjectives.length == 0) {

        return null;

    }

    //Size options are 3x3, 5x5, 9x9
    let bingoObjectives;

    if (size == 3) {
        bingoObjectives = 9;
    } else if (size == 5) {
        bingoObjectives = 25;
    } else if (size == 9) {
        bingoObjectives = 81;
    } else { //In case someone tries shinanigans to make a bigger card
        return null;
    }

    //Prevents bingo cards bigger than number of objectives
    if (size == 9 && objLen < 81 && objLen >= 25) {
        bingoObjectives = 25;
    } else if (size == 9 && objLen < 25 && objLen >= 9) {
        bingoObjectives = 9
    } else if (size == 5 && objLen < 25 && objLen >= 9) {
        bingoObjectives = 9;
    }

    //Generates an array of objectives based on the size determined before
    for (let i = 0; i < bingoObjectives; i++) {

        //Determines random objective from list determined earlier
        let addedObj = listOfObjectives[Math.floor(Math.random() * objLen)];

        if (bingoArray.length == 0) {
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