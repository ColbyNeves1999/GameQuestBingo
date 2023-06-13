import './config';
import 'express-async-errors';
import express, { Express } from 'express';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import { scheduleJob } from 'node-schedule';
import { registerUser, logIn } from './controllers/UserController';
import { IGDBAuthorization, IGDBGameDatabasePull } from './controllers/IGDBController';
import { IGDBGameDatabasePullModel } from './models/IGDBModel';
import { IGDBAuthorizationModel } from './models/IGDBModel';
import { getAllGames } from './controllers/GameController';
import { xboxAuth } from './controllers/XboxController';
import { objectiveSubmittedPage, objectiveSubmit } from './controllers/UserObjectiveController';
import { validateNewUserBody, validateLoginBody } from './validators/loginValidators';
import { validateNewUserObj } from './validators/userObjectiveValidators';
import { bingoCreatorPage, selectBingoObjectives } from './controllers/BingoController';
import { steamGameGrabController, steamAchievementGrabController } from './controllers/SteamController';
import { steamGameGrab } from './models/SteamModel';

const ADMIN_EMAIL = process.env.DATABASEADMIN_EMAIL;

const app: Express = express();
const { PORT, COOKIE_SECRET } = process.env;

const SQLiteStore = connectSqlite3(session);

app.use(
    session({
        store: new SQLiteStore({ db: 'sessions.sqlite' }),
        secret: COOKIE_SECRET,
        cookie: { maxAge: 8 * 60 * 60 * 1000 }, // 8 hours
        name: 'session',
        resave: false,
        saveUninitialized: false,
    })
);

app.use(express.json());

//Auto refreshes IGDB for ADMIN_EMAIL then pulls IGDB game database
function iRunEvery24Hours() {
    //ADMIN_EMAIL is in .env;
    IGDBAuthorizationModel(ADMIN_EMAIL);
    IGDBGameDatabasePullModel(ADMIN_EMAIL);
    steamGameGrab();
}

scheduleJob('0 24 * * *', iRunEvery24Hours);

function iRunEveryHour() {
    //ADMIN_EMAIL is in .env;
    IGDBAuthorizationModel(ADMIN_EMAIL);
}

scheduleJob('0 * * * *', iRunEveryHour);

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public', { extensions: ['html'] }));
app.set('view engine', 'ejs');

//Account register/login/data managment
app.post('/registerUser', validateNewUserBody, registerUser); //Registers a user
app.post('/login', validateLoginBody, logIn); //Lets a user login
app.post('/IGBDAuth', IGDBAuthorization); //Allows a user to get IGDB Authorization (won't likely be used by normal user)
app.post('/getGameDatabase', IGDBGameDatabasePull); //Allows for the IGDB game database to be pulled

//Page requests
app.get('/getGames', getAllGames); //Gets alist of all games

//Xbox requests
app.post("/xbox", xboxAuth);

//Steam requests
app.post("/steamGames", steamGameGrabController);
app.post("/steamAchievements", steamAchievementGrabController);

//User objectives
app.post("/userObjectives", objectiveSubmittedPage); //Takes users to page where they can submit objectives
app.post("/createObjective", validateNewUserObj, objectiveSubmit); //Validates objectives and submits them

//Bingo Page
app.post("/bingoCreatorPage", bingoCreatorPage); //Takes users to page where they choose bingo parameters
app.post("/selectBingoObjectives", selectBingoObjectives); //Chooses objectives for bingo card

app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});
