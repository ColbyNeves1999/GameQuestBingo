import './config';
import 'express-async-errors';
import express, { Express } from 'express';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import { scheduleJob } from 'node-schedule';
//Game related Imports
import { getAllGames } from './controllers/GameController';
//IGDB Imports
import { IGDBAuthorization, IGDBGameDatabasePull } from './controllers/IGDBController';
import { IGDBGameDatabasePullModel, IGDBAuthorizationModel } from './models/IGDBModel';
//Xbox Imports
//import { xboxAuth } from './controllers/XboxController';
//User related Imports
import { registerUser, logIn } from './controllers/UserController';
import { objectiveSubmittedPage, objectiveSubmit } from './controllers/UserObjectiveController';
import { validateNewUserBody, validateLoginBody } from './validators/loginValidators';
import { validateNewUserObj } from './validators/userObjectiveValidators';
//Bingo Imports
import { bingoCreatorPage } from './controllers/BingoController';
//Steam Imports
import { steamGameGrabController } from './controllers/SteamController';
import { steamGameGrab } from './models/SteamModel';
//Bingo Page Imports
import { renderBoard, subscribeToUpdates, updateBoard, selectBingoObjectives, bingoJoinPage, sessionJoin } from './controllers/BoardController';

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
function iRunEverySunday() {
    //ADMIN_EMAIL is in .env;
    IGDBAuthorizationModel(ADMIN_EMAIL);
    IGDBGameDatabasePullModel(ADMIN_EMAIL);
    steamGameGrab();
}

scheduleJob('1 0 * * 2', iRunEverySunday);

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public', { extensions: ['html'] }));
app.set('view engine', 'ejs');

//Account register/login/data managment
app.post('/registerUser', validateNewUserBody, registerUser); //Registers a user
app.post('/login', validateLoginBody, logIn); //Lets a user login
app.post('/IGBDAuth', IGDBAuthorization); //Allows a user to get IGDB Authorization (will only be used by Admin emails)
app.post('/getGameDatabase', IGDBGameDatabasePull); //Allows for the IGDB game database to be pulled

//Page requests
app.get('/getGames', getAllGames); //Gets alist of all games

//Xbox requests
//app.post("/xbox", xboxAuth); //Link intended for authorizing the website to access specific Xbox data

//Steam requests
app.post("/steamGames", steamGameGrabController); //link for testing steamGameGrab

//User objectives
app.post("/userObjectives", objectiveSubmittedPage); //Takes users to page where they can submit objectives
app.post("/createObjective", validateNewUserObj, objectiveSubmit); //Validates objectives and submits them

//Bingo Page
app.post("/bingoCreatorPage", bingoCreatorPage); //Takes users to page where they choose bingo parameters
app.post("/selectBingoObjectives", selectBingoObjectives); //Chooses objectives for bingo card

app.post("/bingoJoinPage", bingoJoinPage);
app.post("/sessionJoin", sessionJoin);

app.get('/board', renderBoard); //Board rendering code. Basis Provided by Christopher Saldivar
app.get('/board/subscribe', subscribeToUpdates); //Board update subscription code. Basis Provided by Christopher Saldivar
app.post('/board', updateBoard); //Board update code. Basis Provided by Christopher Saldivar

app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});
