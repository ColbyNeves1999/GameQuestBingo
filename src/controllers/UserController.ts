import { Request, Response } from 'express';
import argon2 from 'argon2';

//Imported functions from models
import { addUser, getUserByEmail } from '../models/UserModel';

async function registerUser(req: Request, res: Response): Promise<void> {

    const { email, password } = req.body as userLoginInfo;
    const user = await getUserByEmail(email);

    if (user) {
        //res.redirect('/login');
        res.sendStatus(404);
        return;
    }

    // IMPORTANT: Hash the password
    const passwordHash = await argon2.hash(password);

    await addUser(email, passwordHash);

    //res.redirect('/login');
    res.sendStatus(200);
    return;

}

async function logIn(req: Request, res: Response): Promise<void> {

    const { email, password } = req.body as userLoginInfo;
    const user = await getUserByEmail(email);

    if (!user) {
        res.sendStatus(404);
        return;
    }

    const { passwordHash } = user;

    if (!(await argon2.verify(passwordHash, password))) {
        res.sendStatus(404); // 404 Not Found
        return;
    }

    req.session.authenticatedUser = {
        email: user.email,
        userId: user.userId,
        gameDataCode: user.IGDBCode,
        playstationCode: user.playstationCode,
        xboxCode: user.xboxCode,
        nintendoCode: user.nintendoCode,
        pcCode: user.pcCode,
    };
    req.session.isLoggedIn = true;

    //res.redirect('/adminStatus');
    res.sendStatus(200);
    return;

}

export { registerUser, logIn };