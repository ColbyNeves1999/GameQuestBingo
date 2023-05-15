import { Request, Response } from 'express';
import argon2 from 'argon2';

//Imported functions from models
import { addUser, getUserByEmail } from '../models/UserModel';

async function registerUser(req: Request, res: Response): Promise<void> {

    const { email, password } = req.body as userLoginInfo;
    const user = await getUserByEmail(email);

    if (user) {
        res.sendStatus(404);
        return;
    }

    // IMPORTANT: Hash the password
    const passwordHash = await argon2.hash(password);

    await addUser(email, passwordHash);
    res.redirect('/login');

}

export { registerUser };