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
function iRunEveryHour() {
    //ADMIN_EMAIL is in .env;
    IGDBAuthorizationModel(ADMIN_EMAIL);
    IGDBGameDatabasePullModel(ADMIN_EMAIL);
}

scheduleJob('1 * * * *', iRunEveryHour);

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public', { extensions: ['html'] }));
app.set('view engine', 'ejs');

//Account register/login/data managment
app.post('/registerUser', registerUser); //Registers a user
app.post('/login', logIn); //Lets a user login
app.post('/IGBDAuth', IGDBAuthorization); //Allows a user to get IGDB Authorization (won't likely be used by user)
app.post('/getGameDatabase', IGDBGameDatabasePull); //Allows for the IGDB game database to be pulled

//Page requests
app.get('/getGames', getAllGames);

//Xbox requests
app.get("/xbox", xboxAuth);

app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});
