import { setUserIGDBAuth } from './UserModel';
import { getUserByEmail } from './UserModel';
import { addGame } from './GameModel';
import { addPlatformList } from './PlatformModel';
import querystring from 'querystring';

const CLIENT_ID = process.env.TWITCH_ID;
const CLIENT_SECRET = process.env.TWITCH_SECRET;

//Function gets the credentials needed to get game list from IGDB
async function IGDBAuthorizationModel(email: string): Promise<string> {

    var myObj = {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials',
    }

    var myJSON = querystring.stringify(myObj);

    const fetchResponse = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        body: myJSON,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    const resJson = await fetchResponse.json();
    const { access_token } = resJson as accessCode;

    await setUserIGDBAuth(email, access_token)

    return resJson;

}

//Function gets the actual database list from IGDB
async function IGDBGameDatabasePullModel(email: string): Promise<void> {

    console.log("I am grabbing new games.");

    const user = await getUserByEmail(email);

    await IGDBPlatformDatabasePullModel(email);

    //Offset used to keep moving forward on the list of games from IGDB
    let offset = 0;
    let loop = true;

    //Loops to get every game it can based on the body given
    while (loop) {

        let fetchResponse = await fetch('https://api.igdb.com/v4/games', {
            method: 'POST',
            body: `fields name, age_ratings, platforms, age_ratings.rating; 
                    limit 500; 
                    where platforms = (6,48,49,130,9,34,14,3,9,12,8,11,7,167,169,170,38,46,20,37,5,41,21,4,19,18,24,23,22,29,30,32,28,33,43,44,45,47,15,35) 
                        & age_ratings != null 
                        & version_parent = null 
                        & age_ratings.category = 2; 
                    offset ${offset};`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Client-ID': CLIENT_ID,
                Authorization: `Bearer ${user.IGDBCode}`
            }
        });

        const resJson = await fetchResponse.json();
        console.log(resJson);

        //Edge case where there's enough games for gameAmout%500 = 0 
        if (resJson.length === 0) {

            loop = false;

        } else {

            for (let i = 0; i < resJson.length; i++) {

                const { name, platforms, age_ratings } = resJson[i] as gameInfo;
                const temp = name.toLocaleLowerCase();
                await addGame(temp, platforms, age_ratings[0].rating);

            }

            //Sets the offset based on the length of the response, ends the loop at the end
            if (resJson.length === 500) {
                offset += resJson.length;
            } else {
                loop = false;
            }

        }
    }

    return;

}

//This function grabs all platforms IGDB has in order to apply data to games
async function IGDBPlatformDatabasePullModel(email: string): Promise<void> {

    const user = await getUserByEmail(email);

    //Gets as many game consoles as it can
    const fetchResponse = await fetch('https://api.igdb.com/v4/platforms', {
        method: 'POST',
        body: `fields name; limit 500;`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Client-ID': CLIENT_ID,
            Authorization: `Bearer ${user.IGDBCode}`
        }
    });

    const resJson = await fetchResponse.json();

    for (let i = 0; i < resJson.length; i++) {

        const { id, name } = resJson[i] as platformInfo;

        await addPlatformList(id, name);

    }

    return;
}

export { IGDBAuthorizationModel, IGDBGameDatabasePullModel, IGDBPlatformDatabasePullModel };