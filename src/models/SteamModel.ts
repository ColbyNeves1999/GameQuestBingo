import { AppDataSource } from '../dataSource';

import { Game } from "../entities/Game";
import { SteamAchieve } from "../entities/SteamAchievement";

import { getGameByName } from "./GameModel";

const steamAchievementRepository = AppDataSource.getRepository(SteamAchieve);

//ATTENTION!!! DO NOT RUN steamGameGrab. THE CODE DOES IT ON ITS OWN. TAKES OVER AN HOUR TO COMPLETE.
//Grabs every game on steam and it's achievements, that isn't already in the database.
async function steamGameGrab(): Promise<void> {

    //Backend timing for troubleshooting purposes
    const start = getCurrentTime();

    console.log("Checking steam for games and achievements");
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

        //Gets name of game, and creates standard lower casing to make game searching reliable
        const { appid, name } = apps[i] as steamGameData;
        const lowerName = name.toLocaleLowerCase();
        const isItAlreadyHere = await getGameByName(lowerName);

        //Will take existing games and add steam ids to them and grabs their achievements
        if (isItAlreadyHere) {

            await steamAchievementGrab(appid, isItAlreadyHere);

        }

    }

    //Used to verify achievement grabbing has been completed
    console.log("I've grabbed all the achievements I can");

    const stop = getCurrentTime();
    console.log("Start time: ", start);
    console.log("Stop time: ", stop);

    return;
}

async function setSteamAchievements(achievement: string, game: Game): Promise<void> {

    let newAchieve = new SteamAchieve();
    newAchieve.achievement = achievement;
    newAchieve.game = game;

    await steamAchievementRepository.save(newAchieve);

    return;
}

async function getSteamAchievement(achievement: string, game: Game): Promise<SteamAchieve> {

    const gameID = game.gameId;

    return steamAchievementRepository.createQueryBuilder('steamachieve')
        .where('achievement = :achievement and gameGameID = :gameID', { achievement, gameID })
        .getOne();

}

//Grabs achievements for games on steam. Due to the inconsistant data Steam can and does return,
//there are try/catches constantly. Returned data can be wildly vary, and therefore fail, at any point
async function steamAchievementGrab(appid: string, steamGame: Game): Promise<void> {
    const steam_key = process.env.STEAM_API_KEY;

    try {

        //Fetching data from steam api found on TF2 wiki (Why is it classified on the TF2 wiki but not their website?)
        const fetchResponse = await fetch(`http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?key=${steam_key}&appid=${appid}&l=english&format=json`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!fetchResponse.ok) {
            console.error(`Error fetching schema for app ${appid}`);
            return;
        }

        //Breaks down fetch response into array of achievements
        const resJson = await fetchResponse.json();
        const { game } = resJson as steamAchievementPercentage;
        const { availableGameStats } = game;
        const { achievements } = availableGameStats;

        //This breaks down all achievements per game and adds them to the database
        for (let i = 0; i < achievements.length; i++) {

            try {
                //Makes sure duplicate achievements for steam aren't entered in
                const doesAchievementExist = await getSteamAchievement(achievements[i].displayName, steamGame);
                console.log(doesAchievementExist);
                if (!doesAchievementExist) {
                    await setSteamAchievements(achievements[i].displayName, steamGame);
                    console.log(achievements[i].displayName);
                }
            } catch {
                return;
            }
        }

    } catch (error) {
        console.error(error);
    }
}

//This only exists for backend testing to see how long the Steam grabs take
function getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString();
}

export { steamGameGrab, steamAchievementGrab, setSteamAchievements, getSteamAchievement };