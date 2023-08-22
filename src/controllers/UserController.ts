import { Request, Response } from 'express';
import argon2 from 'argon2';

const ADMIN_EMAIL = process.env.DATABASEADMIN_EMAIL;

//Imported functions from models
import { addUser, getUserByEmail } from '../models/UserModel';
import { IGDBAuthorizationModel, IGDBGameDatabasePullModel } from '../models/IGDBModel';
import { steamGameGrab } from '../models/SteamModel';

async function registerUser(req: Request, res: Response): Promise<void> {

    const { email, password } = req.body as userLoginInfo;
    const user = await getUserByEmail(email);

    if (user) {
        res.redirect('/register');
        return;
    }

    // IMPORTANT: Hash the password
    const passwordHash = await argon2.hash(password);

    await addUser(email, passwordHash);

    res.redirect('/login');
    return;

}

async function logIn(req: Request, res: Response): Promise<void> {

    const { email, password } = req.body as userLoginInfo;
    const user = await getUserByEmail(email);

    if (!user) {
        res.redirect('/login');
        return;
    }

    const { passwordHash } = user;

    if (!(await argon2.verify(passwordHash, password))) {
        res.redirect('/login');
        return;
    }

    req.session.authenticatedUser = {
        email: user.email,
        userId: user.userId,
        IGDBCode: user.IGDBCode,
        playstationCode: user.playstationCode,
        xboxCode: user.xboxCode,
        nintendoCode: user.nintendoCode,
        pcCode: user.pcCode,
    };
    req.session.isLoggedIn = true;

    res.redirect('/index');
    return;

}

async function playerHomePage(req: Request, res: Response): Promise<void> {

    let user = undefined;

    if (req.session.isLoggedIn) {
        user = await getUserByEmail(req.session.authenticatedUser.email);
    } else {
        res.redirect('/login');
        return;
    }

    if (user.admin === false) {
        res.render('playerPage', { user });
    }

    if (user.admin === true) {
        res.render('adminPage', { user });
    }

}

//Forces a refresh of the database. Only accessible by admin page.
async function adminForceDatabaseRefresh(req: Request, res: Response) {
    await IGDBAuthorizationModel(ADMIN_EMAIL);
    await IGDBGameDatabasePullModel(ADMIN_EMAIL);
    await steamGameGrab();
}

export { registerUser, logIn, playerHomePage, adminForceDatabaseRefresh };