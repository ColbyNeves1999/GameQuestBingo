import { authenticate, AuthenticateOptions } from '@xboxreplay/xboxlive-auth';
import { AppDataSource } from '../dataSource';
//import { CredentialsAuthenticateInitialResponse, CredentialsAuthenticateRawResponse } from '@xboxreplay/xboxlive-auth';
import { CredentialsAuthenticateRawResponse } from '@xboxreplay/xboxlive-auth';
import { User } from '../entities/User';

const userRepository = AppDataSource.getRepository(User);

async function xboxAuthModel(email: string, password: string, user: User): Promise<void> {

    const temp: AuthenticateOptions = {
        raw: true,
    }

    const response = await authenticate(email, password, temp);

    //console.log(response);

    const { "login.live.com": LiveAuthResponse, 'xsts.auth.xboxlive.com': XBLExchangeTokensResponse } = response as CredentialsAuthenticateRawResponse;

    const { refresh_token } = LiveAuthResponse as xboxRefresh;

    const { DisplayClaims, Token } = XBLExchangeTokensResponse;
    const { xui } = DisplayClaims;
    const { xid, uhs } = xui[0];

    user.xboxCode = xid;
    user.xboxRefreshCode = refresh_token;
    //user.xboxUsername = gtg;

    await getAchievements(xid, Token, uhs);

    await userRepository.save(user);

    return;

}

async function getAchievements(xuid: string, xsts_token: string, user_hash: string): Promise<void> {

    let continuationToken;

    let fetchResponse = await fetch(`https://achievements.xboxlive.com/users/xuid(${xuid})/achievements`, {
        method: 'GET',
        headers: {
            'Authorization': `XBL3.0 x=${user_hash};${xsts_token}`,
        }
    });

    const resJson = await fetchResponse.json();
    console.log(resJson);
    const { pagingInfo } = resJson as xboxAchievements;
    continuationToken = pagingInfo.continuationToken;

    do {

        let fetchResponse = await fetch(`https://achievements.xboxlive.com/users/xuid(${xuid})/achievements?continuationToken=${continuationToken}`, {
            method: 'GET',
            headers: {
                'Authorization': `XBL3.0 x=${user_hash};${xsts_token}`,
            }
        });

        const resJson = await fetchResponse.json();
        console.log(resJson);
        const { pagingInfo } = resJson as xboxAchievements;
        continuationToken = pagingInfo.continuationToken;

    } while (continuationToken)

    console.log("YARG");

    return;

}

export { xboxAuthModel };