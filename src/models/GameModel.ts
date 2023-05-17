import { AppDataSource } from '../dataSource';
import { Game } from '../entities/Game';
import { Platform } from '../entities/Platforms';

const gameRepository = AppDataSource.getRepository(Game);
const platformRepository = AppDataSource.getRepository(Platform);

async function addGame(title: string, platforms: [], rating: string): Promise<void> {

    const existingGame = await getGameByName(title);

    if (existingGame) {
        return;
    }

    // Create the new user object and saves data
    let newGame = new Game();
    newGame.title = title;
    newGame.rating = rating;

    // Then save it to the database
    // NOTES: We reassign to `newUser` so we can access
    // NOTES: the fields the database autogenerates (the id & default columns)
    newGame = await gameRepository.save(newGame);

    await addPlatform(platforms, newGame);

    return;

}

async function addPlatform(platforms: [], game: Game): Promise<void> {

    for (let i = 0; i < platforms.length; i++) {

        let newPlatform = new Platform();
        newPlatform.platform = platforms[i];
        newPlatform.game = game;

        await platformRepository.save(newPlatform);

    }

    return;

}

async function getGameByName(title: string): Promise<Game | null> {

    return gameRepository.findOne({ where: { title } });

}

export { addGame, getGameByName };