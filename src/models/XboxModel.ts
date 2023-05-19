import { authenticate } from '@xboxreplay/xboxlive-auth';
import { CredentialsAuthenticateInitialResponse } from '@xboxreplay/xboxlive-auth';

async function xboxAuthModel(email: string, password: string): Promise<void> {

    const response = await authenticate(email, password)

    console.log(response);

    const { xuid, display_claims } = response as CredentialsAuthenticateInitialResponse;
    const { gtg } = display_claims as xboxUserInfo;

    console.log(xuid, gtg);

    return;

}

export { xboxAuthModel };