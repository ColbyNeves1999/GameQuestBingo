import { AppDataSource } from '../dataSource';
import { User } from '../entities/User';

const ADMIN_EMAIL = process.env.DATABASEADMIN_EMAIL;

const userRepository = AppDataSource.getRepository(User);

async function addUser(email: string, passwordHash: string): Promise<User> {

    //Create the new user object and saves data
    let newUser = new User();
    newUser.email = email;
    newUser.passwordHash = passwordHash;

    if (email === ADMIN_EMAIL) {
        newUser.admin = true;
    }

    //Then save the user to the database
    newUser = await userRepository.save(newUser);

    return newUser;

}

async function getUserByEmail(email: string): Promise<User | null> {
    return userRepository.findOne({ where: { email } });
}

async function setUserIGDBAuth(email: string, auth: string): Promise<void> {

    //Get user and set their IGDB authorization token
    const user = await getUserByEmail(email);

    if (email === ADMIN_EMAIL) {
        user.admin = true;
    }

    user.IGDBCode = auth;

    //Then save the code to the database
    await userRepository.save(user);

    return;

}

export { addUser, getUserByEmail, setUserIGDBAuth };