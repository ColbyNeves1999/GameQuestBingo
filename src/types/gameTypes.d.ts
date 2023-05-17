type gameInfo = {

    name: string;
    platforms: [];
    age_ratings: [gameRating];

};

type gameRating = {
    id: string;
    rating: string;
}