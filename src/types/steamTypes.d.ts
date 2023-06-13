type steamAppList = {

    applist: steamApps;

};

type steamApps = {

    apps: [steamGameData];

};

type steamGameData = {

    appid: string;
    name: string;

};