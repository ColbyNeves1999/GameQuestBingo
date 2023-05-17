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
    let loop = true;

    while (loop) {

        let fetchResponse = await fetch('https://api.igdb.com/v4/games', {
            method: 'POST',
            body: `fields name, age_ratings, platforms, age_ratings.rating; limit 500; where platforms = (12, 146, 48, 49, 130, 6, 167, 169) & age_ratings != null & version_parent = null & age_ratings.category = 2; offset ${offset};`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Client-ID': CLIENT_ID,
                Authorization: `Bearer ${user.IGDBCode}`
            }
        });

        const resJson = await fetchResponse.json();

        console.log(resJson);

        if (resJson.length === 0) {
            loop = false;
        } else {

            for (let i = 0; i < resJson.length; i++) {
                const { name, platforms, age_ratings } = resJson[i] as gameInfo;

                await addGame(name, platforms, age_ratings[0].rating);

            }

            offset += resJson.length;
        }
    }

    return;

}

export { IGDBAuthorizationModel, IGDBGameDatabasePullModel };