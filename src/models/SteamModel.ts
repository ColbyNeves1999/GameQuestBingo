import { AppDataSource } from '../dataSource';

import { Game } from "../entities/Game";
import { SteamAchieve } from "../entities/SteamAchievement";

import { getGameByName, setSteamID } from "./GameModel";

//const gameRepository = AppDataSource.getRepository(Game);
const steamAchievementRepository = AppDataSource.getRepository(SteamAchieve);

async function steamGameGrab(): Promise<void> {
    const fetchResponse = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    const resJson = await fetchResponse.json();

    const { applist } = resJson as steamAppList;
    const { apps } = applist as steamApps;


    for (let i = 0; i < apps.length; i++) {

        const { appid, name } = apps[i] as steamGameData;
        const lowerName = name.toLocaleLowerCase();
        const isItAlreadyHere = await getGameByName(lowerName);
        let platform = [];
        platform[0] = "6";

        //Will take existing games and add steam ids to them
        if (isItAlreadyHere) {
            console.log(isItAlreadyHere.title);
            await setSteamID(appid, isItAlreadyHere);

            await steamAchievementGrab(appid, isItAlreadyHere);

        }
    }

    console.log("I've grabbed all the achievements I can");

    return;
}

async function setSteamAchievements(achievement: string, game: Game): Promise<void> {

    let newAchieve = new SteamAchieve();
    newAchieve.achievement = achievement;
    newAchieve.game = game;
    console.log("Saving");
    await steamAchievementRepository.save(newAchieve);

    return;
}

async function getSteamAchievement(achievement: string, game: Game): Promise<SteamAchieve> {

    const gameID = game.gameId;

    return steamAchievementRepository.createQueryBuilder('steamachieve')
        .where('achievement = :achievement and gameGameID = :gameID', { achievement, gameID })
        .getOne();

}

async function steamAchievementGrab(appid: string, steamGame: Game): Promise<void> {

    const steam_key = process.env.STEAM_API_KEY;

    const fetchResponse = await fetch(`http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?key=${steam_key}&appid=${appid}&l=english&format=json`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    const resJson = await fetchResponse.json();

    const { game } = resJson as steamAchievementPercentage;
    const { availableGameStats } = game;
    if (availableGameStats !== null && availableGameStats !== undefined) {
        const { achievements } = availableGameStats;
        if (achievements !== null && achievements !== undefined && achievements[0] !== null && achievements[0] !== undefined) {
            console.log(achievements.length);
            if (achievements.length > 0) {
                for (let i = 0; i < achievements.length; i++) {

                    const doesAchievementExist = await getSteamAchievement(achievements[i].displayName, steamGame);

                    if (!doesAchievementExist) {
                        await setSteamAchievements(achievements[i].displayName, steamGame);
                        console.log(achievements[i].displayName);
                    }
                }
            }
        }
    }


    return;

}

export { steamGameGrab, steamAchievementGrab, setSteamAchievements, getSteamAchievement };