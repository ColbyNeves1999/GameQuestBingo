
async function getAuthenticationToken(npsso: string): Promise<string> {
    const params = [
        'access_type=offline',
        'client_id=09515159-7237-4370-9b40-3806e67c0891',
        'response_type=code',
        'scope=psn:mobile.v2.core psn:clientapp',
        'redirect_uri=com.scee.psxandroid.scecompcall://redirect',
    ];

    const url = `https://ca.account.sony.com/api/authz/v3/oauth/authorize?${params.join('&')}`;

    try {
        const response = await fetch(url, {
            headers: {
                Cookie: `npsso=${npsso}`,
            },
        });

        if (response.status !== 200) {
            console.log('Error: Check npsso');
            return '';
        }

        const locationHeader = response.headers.get('location');
        if (locationHeader && locationHeader.startsWith('?code=v3')) {
            const query = new URLSearchParams(locationHeader);
            const code = query.get('code');
            if (code) {
                const body = new URLSearchParams({
                    code,
                    redirect_uri: 'com.scee.psxandroid.scecompcall://redirect',
                    grant_type: 'authorization_code',
                    token_format: 'jwt',
                });

                const tokenUrl = 'https://ca.account.sony.com/api/authz/v3/oauth/token';
                const tokenResponse = await fetch(tokenUrl, {
                    method: 'POST',
                    body,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Authorization: 'Basic MDk1MTUxNTktNzIzNy00MzcwLTliNDAtMzgwNmU2N2MwODkxOnVjUGprYTV0bnRCMktxc1A=',
                    },
                });

                if (tokenResponse.status === 200) {
                    const token = (await tokenResponse.json()).access_token;
                    console.log('Authentication Token successfully granted');
                    return token;
                }
            }
        }

        console.log('Error: Unable to obtain Authentication Token');
        return '';
    } catch (error) {
        console.log('Error: Unable to obtain Authentication Token');
        return '';
    }
}
