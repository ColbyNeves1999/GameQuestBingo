import { getGameByName, setSteamID } from "./GameModel";

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
            await setSteamID(appid, isItAlreadyHere);
        }
    }

    return;
}


async function steamAchievementGrab(): Promise<void> {

    const fetchResponse = await fetch('https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v1/?gameid=976730', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    const resJson = await fetchResponse.json();
    const { achievementpercentages } = resJson as steamAchievementPercentage;
    const { achievements } = achievementpercentages as steamAchievements;
    const { achievement } = achievements;

    for (let i = 0; i < achievement.length; i++) {
        const { name } = achievement[i];
        const newName = name.replace(/_/g, " ");
        let finalName;
        let temp = 0;
        let position;
        for (let i = 0; temp < 2; i++) {
            if (newName[i] === " ") {
                temp++;
            }
            if (temp === 2) {
                position = i;
            }
        }
        finalName = newName;
        for (let i = 0; i <= position; i++) {
            finalName = finalName.replace(newName[i], "");
        }

        console.log(finalName);

    }

    return;

}

export { steamGameGrab, steamAchievementGrab };