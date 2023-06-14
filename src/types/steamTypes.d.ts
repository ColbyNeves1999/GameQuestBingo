
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

    game: steamGameStats;
    achievementpercentages: steamAchievements;

};

type steamGameStats = {

    availableGameStats: steamAchievements

};

type steamAchievements = {

    achievements: [steamAchievementData];

};

/*type steamAchievement = {
    achievement: steamAchievementData
};*/

type steamAchievementData = {

    displayName: string;

};