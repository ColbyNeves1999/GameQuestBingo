import { setUserIGDBAuth } from './UserModel';
import { getUserByEmail } from './UserModel';
import { addGame } from './GameModel';
import querystring from 'querystring';

const CLIENT_ID = process.env.TWITCH_ID;
const CLIENT_SECRET = process.env.TWITCH_SECRET;

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

async function IGDBGameDatabasePullModel(email: string): Promise<void> {

    const user = await getUserByEmail(email);

    let offset = 0;
    let num = 0;
    let fetchResponse;

    do {

        fetchResponse = await fetch('https://api.igdb.com/v4/games', {
            method: 'POST',
            body: `fields name, age_ratings; limit 500; where platforms = (48, 49, 130, 6) & age_ratings != null & parent_game = null; offset ${offset};`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Client-ID': CLIENT_ID,
                Authorization: `Bearer ${user.IGDBCode}`
            }
        });

        const resJson = await fetchResponse.json();

        console.log(resJson);

        for (let i = 0; i < 500; i++) {
            console.log(num);
            num += 1;
            const { name } = resJson[i] as gameInfo;

            await addGame(name);

        }

        offset += 500;

    } while (fetchResponse);
    //console.log(resJson);

    //console.log("https://api.igdb.com/v4/games?" + myJSON)

    return;

}

export { IGDBAuthorizationModel, IGDBGameDatabasePullModel };