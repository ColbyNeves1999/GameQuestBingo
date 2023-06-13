import { AppDataSource } from '../dataSource';
import { Game } from '../entities/Game';
import { Platform } from '../entities/Platforms';
import { getPlatformFromListByID } from './PlatformModel';

const gameRepository = AppDataSource.getRepository(Game);
const platformRepository = AppDataSource.getRepository(Platform);


async function addGame(title: string, platforms: [], rating: string): Promise<void> {

    //Just making sure this exact game doesn't exist already
    const existingGame = await getGameByName(title);
    if (existingGame) {
        return;
    }

    // Create the new user object and saves data
    let newGame = new Game();
    newGame.title = title;
    newGame.rating = rating;

    // Then save game to the database
    newGame = await gameRepository.save(newGame);

    await addPlatform(platforms, newGame);

    return;

}

async function addPlatform(platforms: [], game: Game): Promise<void> {

    //Associates each game with each platform that version of the game was released on
    for (let i = 0; i < platforms.length; i++) {

        let newPlatform = new Platform();

        const platName = await getPlatformFromListByID(platforms[i]);

        newPlatform.platform = platName.platformName;
        newPlatform.game = game;

        await platformRepository.save(newPlatform);

    }

    return;

}

async function setSteamID(steamID: string, game: Game): Promise<void> {

    //Associates each game with steamID
    game.steamID = steamID;

    await gameRepository.save(game);

    return;

}

async function getGameByName(title: string): Promise<Game | null> {

    return gameRepository.findOne({ where: { title } });

}

async function getGames(): Promise<Game[]> {
    return await gameRepository.find();
}

export { addGame, getGameByName, getGames, setSteamID };