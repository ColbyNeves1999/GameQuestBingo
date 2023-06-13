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

/////////////

type steamAchievementPercentage = {

    achievementpercentages: steamAchievements;

};

type steamAchievements = {

    achievements: { achievement: [{ name: string }] };

};

/*type steamAchievementsInner = {
    achievement: steamAchievementData;
};

type steamAchievementData = {

    name: string;

};*/