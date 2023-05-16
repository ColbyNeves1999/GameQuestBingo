import { setUserIGDBAuth } from './UserModel';
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

export { IGDBAuthorizationModel };