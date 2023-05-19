import { authenticate } from '@xboxreplay/xboxlive-auth';
import { CredentialsAuthenticateInitialResponse } from '@xboxreplay/xboxlive-auth';

async function xboxAuthModel(email: string, password: string): Promise<void> {

    const response = await authenticate(email, password)

    console.log(response);

    const { xuid } = response as CredentialsAuthenticateInitialResponse;

    console.log(xuid);

    return;

}

export { xboxAuthModel };