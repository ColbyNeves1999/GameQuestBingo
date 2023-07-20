import { AppDataSource } from '../dataSource';
import { boardName } from '../entities/BoardNames';

import { GameManager } from './GameManager';

const boardRepository = AppDataSource.getRepository(boardName);

async function addBoard(sessionName: string): Promise<void> {

    //Create the new user object and saves data
    let newBoard = new boardName();
    newBoard.sessionName = sessionName;

    //Then save the user to the database
    await boardRepository.save(newBoard);

    return;

}

async function clearEmptyBoards(): Promise<void> {

    const boardArray = await boardRepository.find();

    for (let i = 0; i < boardArray.length; i++) {

        if (GameManager.games[i].players[0].userId === "") {



        }

    }

}

async function deleteBoard(sessionName: string): Promise<void> {

    await boardRepository
        .createQueryBuilder('sessionName')
        .delete()
        .where('sessionName = :sessionName', { sessionName })
        .execute();

}

export { addBoard, deleteBoard, clearEmptyBoards };