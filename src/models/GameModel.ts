import { AppDataSource } from '../dataSource';
import { Game } from '../entities/Game';

const gameRepository = AppDataSource.getRepository(Game);

async function addGame(title: string): Promise<void> {

    const existingGame = await getGameByName(title);

    if (existingGame) {
        return;
    }

    // Create the new user object and saves data
    let newGame = new Game();
    newGame.title = title;

    // Then save it to the database
    // NOTES: We reassign to `newUser` so we can access
    // NOTES: the fields the database autogenerates (the id & default columns)
    newGame = await gameRepository.save(newGame);

    return;

}

async function getGameByName(title: string): Promise<Game | null> {

    return gameRepository.findOne({ where: { title } });

}

export { addGame, getGameByName };