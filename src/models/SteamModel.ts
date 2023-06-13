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

    console.log(apps);
    return;
}

export { steamGameGrab };