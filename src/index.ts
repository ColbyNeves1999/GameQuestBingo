import './config';
import 'express-async-errors';
import express, { Express } from 'express';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import { scheduleJob } from 'node-schedule';

//Video Game related Imports
import { getAllGames } from './controllers/GameController';

//IGDB Imports
import { IGDBAuthorization, IGDBGameDatabasePull } from './controllers/IGDBController';
import { IGDBGameDatabasePullModel, IGDBAuthorizationModel } from './models/IGDBModel';

//Xbox Imports
//import { xboxAuth } from './controllers/XboxController';

//User related Imports
import { registerUser, logIn, playerHomePage } from './controllers/UserController';
import { objectiveSubmittedPage, objectiveSubmit, displayObjectives } from './controllers/UserObjectiveController';
import { validateNewUserBody, validateLoginBody } from './validators/loginValidators';
import { validateNewUserObj } from './validators/userObjectiveValidators';

//Bingo Imports
import { bingoCreatorPage } from './controllers/BingoController';
import { renderBoard, subscribeToUpdates, updateBoard, selectBingoObjectives, bingoJoinPage, sessionJoin, sessionLeave } from './controllers/BoardController';

//Steam Imports
import { steamGameGrabController } from './controllers/SteamController';
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

//Auto refreshes IGDB for ADMIN_EMAIL then pulls IGDB game database; Every Tuesday at 00:01 (12:01 AM);
function iRunEveryTuesday() {
    //ADMIN_EMAIL is in .env;
    IGDBAuthorizationModel(ADMIN_EMAIL);
    IGDBGameDatabasePullModel(ADMIN_EMAIL);
    steamGameGrab();

}

scheduleJob('1 0 * * 2', iRunEveryTuesday);

/*function iRunEveryFewMins() {

    clearEmptyBoards();

}*/

//scheduleJob('*/5 * * * *', iRunEveryFewMins);

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public', { extensions: ['html'] }));
app.set('view engine', 'ejs');

//Account register/login/data managment
app.post('/registerUser', validateNewUserBody, registerUser); //Registers a user
app.post('/login', validateLoginBody, logIn); //Lets a user login
app.post('/IGBDAuth', IGDBAuthorization); //Allows a user to get IGDB Authorization (will only be used by Admin emails)
app.post('/getGameDatabase', IGDBGameDatabasePull); //Allows for the IGDB game database to be pulled
app.get('/playerHomepage', playerHomePage);
app.post('/displayObjectives', displayObjectives);

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

app.get("/bingoJoinPage", bingoJoinPage); //Takes you to the page where you can join a bingo card
app.post("/sessionJoin", sessionJoin); //Assigns your name to the player or spectator list of a bingo card
app.get("/sessionLeave/:gameCode", sessionLeave);

app.get("/board/:gameCode", renderBoard); //Board rendering code. Basis Provided by Christopher Saldivar
app.get("/board/subscribe/:gameCode", subscribeToUpdates); //Board update subscription code. Basis Provided by Christopher Saldivar
app.post("/board/:gameCode", updateBoard); //Board update code. Basis Provided by Christopher Saldivar

app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});
