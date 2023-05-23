type xboxRefresh = {
    refresh_token: string;
    user_id: string;
};

type xboxAchievements = {

    achievements: [string];
    pagingInfo: pagingInfo;

};

type pagingInfo = {
    continuationToken: string;
};

type test = {

    gtg: string;
    xid: string;

};