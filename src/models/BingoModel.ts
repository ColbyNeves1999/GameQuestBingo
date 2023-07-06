import { AppDataSource } from '../dataSource';
import { Objective } from '../entities/UserObjectiveList';
import { SteamAchieve } from '../entities/SteamAchievement';

import { getGameByName } from './GameModel';

const objectiveRepository = AppDataSource.getRepository(Objective);
const steamRepository = AppDataSource.getRepository(SteamAchieve);

async function bingoSelector(size: number, title: string, inex: number, free: number): Promise<(string)[] | null> {

    //Ends function if requested game doesn't exist
    const game = await getGameByName(title);
    if (!game) {

        return null;

    }

    const bingoArray: (string)[] = [];
    let listOfObjectives;
    let listOfAchievements;
    const gameID = game.gameId;

    listOfAchievements = await steamRepository
        .createQueryBuilder('steamAchieve')
        .where('gameGameID = :gameID', { gameID })
        .getMany();

    console.log(inex);
    if (inex == 1) {
        //Makes an array of objectives for the given game with user objectives
        listOfObjectives = await objectiveRepository
            .createQueryBuilder('objectives')
            .where('gameGameID = :gameID', { gameID })
            .getMany();
        console.log(listOfObjectives.length);
    }

    const achLen = listOfAchievements.length;
    console.log(achLen);
    let objLen;
    try {
        objLen = listOfObjectives.length;
    } catch {
        objLen = 0;
    }
    console.log(objLen);

    //Makes sure there are some objectives for the game
    if (achLen + objLen == 0) {

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

    console.log(bingoObjectives);

    //Prevents bingo cards bigger than number of objectives
    if (size == 9 && (objLen + achLen) < 81 && (objLen + achLen) >= 25) {
        bingoObjectives = 25;
    } else if (size == 9 && (objLen + achLen) < 25 && (objLen + achLen) >= 9) {
        bingoObjectives = 9
    } else if (size == 5 && (objLen + achLen) < 25 && (objLen + achLen) >= 9) {
        bingoObjectives = 9;
    }

    console.log(bingoObjectives);

    //Generates an array of objectives based on the size determined before
    for (let i = 0; i < bingoObjectives; i++) {

        //Generates random number from 0 to <(objLen + achLen) is
        let ranNum = Math.floor(Math.random() * (objLen + achLen));
        let addedObj;

        if (ranNum > (achLen - 1)) {
            ranNum = Math.floor(Math.random() * objLen);

            //Determines random objective from list determined earlier
            addedObj = listOfObjectives[ranNum].objective;

        } else {

            addedObj = listOfAchievements[ranNum].achievement;

        }
        console.log(ranNum);

        if (bingoArray.length == 0) {
            bingoArray[0] = addedObj;
        } else if (bingoArray.includes(addedObj)) {
            i--;
        } else {
            bingoArray[i] = addedObj;
        }

        if (free == 1) {

            if (bingoObjectives == 9) {
                bingoArray[4] = "Free Space";
            } else if (bingoObjectives == 25) {
                bingoArray[12] = "Free Space";
            } else if (bingoObjectives == 81) {
                bingoArray[41] = "Free Space";
            }

        }

    }



    console.log(bingoArray);
    return bingoArray;

}

export { bingoSelector };