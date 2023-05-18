import { AppDataSource } from '../dataSource';
import { PlatformList } from '../entities/PlatformList';

const platforListRepository = AppDataSource.getRepository(PlatformList);

async function addPlatformList(id: string, name: string): Promise<void> {

    //Just making sure this exact game doesn't exist already
    const existingPlatform = await getPlatformFromListByID(id);
    if (existingPlatform) {
        return;
    }

    // Create the new user object and saves data
    let newList = new PlatformList();
    newList.platformIGDBID = id;
    newList.platformName = name;

    // Then save game to the database
    newList = await platforListRepository.save(newList);

    return;

}

async function getPlatformFromListByID(platformIGDBID: string): Promise<PlatformList | null> {

    return platforListRepository.findOne({ where: { platformIGDBID } });

}

async function getPlatformNameByID(platformIGDBID: string): Promise<PlatformList | null> {

    return platforListRepository.findOne({ where: { platformIGDBID } });

}


export { addPlatformList, getPlatformFromListByID, getPlatformNameByID };