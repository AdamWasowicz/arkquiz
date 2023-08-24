import { Character, CharacterHeader, CharacterHeaderMap, CharacterComparisonResult } from "./types";
import path from 'path';
import { getAllFileNamesInDirectory, readJson, doesFileExist } from "@/lib/filesystem";
import { 
    EXTERNAL_PATH_TO_CHARACTER_ICONS,
    LOCAL_PATH_TO_CHARACTER_ICONS, 
    EXTERNAL_PATH_TO_CHARACTER_SPLASH, 
    LOCAL_PATH_TO_CHARACTER_SPLASH,
    PATH_TO_CHARACTER_DATA, 
} from "@/lib/paths";

// Const
const imageFormat = '.webp';
const characterDataFormat = '.json';
const localPathToCharacters = path.join(process.cwd(), ...PATH_TO_CHARACTER_DATA);
const pathToCharacterSplash = path.join(...EXTERNAL_PATH_TO_CHARACTER_SPLASH)
const pathToCharacterIcon = path.join(...EXTERNAL_PATH_TO_CHARACTER_ICONS)


// Functions
/**
 * 
 * @param id is unique string for each character (ex. R001 is Amiya).
 * @returns Character with that id
 */
export const getCharacterById = (id: string): Character => {
    const fileExist = doesFileExist(path.join(localPathToCharacters, id + characterDataFormat))
    if (fileExist == false) {
        throw new Error(`File ${id + characterDataFormat} not found`)
    }

    const character = readJson(path.join(localPathToCharacters, id + characterDataFormat)) as Character;
    return character;
}

/**
 * @returns array of CharacterHeader for all characters.
 */
export const getAllCharacterHeaders = (): CharacterHeader[] => {
    const fileNames: string[] = getAllFileNamesInDirectory(localPathToCharacters);

    const characterHeaders: CharacterHeader[] = [];
    fileNames.forEach(file => {
        const character = readJson(path.join(localPathToCharacters, file)) as Character;

        const ch: CharacterHeader = {
            Id: character.Id,
            Name: character.Name,
        }

        characterHeaders.push(ch);
    })

    return characterHeaders;
}

/**
 * 
 * @param id is unique string for each character (ex. R001 is Amiya).
 * @returns route for character splash art, you may need to add '/' for nextjs's Image component
 */
export const getCharacterSplashRoute = (id: string): string => {
    const fullPath = path.join(process.cwd(), pathToCharacterSplash, id + imageFormat)
    const fileExist = doesFileExist(fullPath)
    
    if (fileExist == false) {
        throw new Error(`Splash ${fullPath} not found`)
    }

    const route = path.join(...LOCAL_PATH_TO_CHARACTER_SPLASH, id + imageFormat);
    return route;
}

/**
 * 
 * @param id is unique string for each character (ex. R001 is Amiya).
 * @returns route for character icon art, you may need to add '/' for nextjs's Image component
 */
export const getCharacterIconRoute = (id: string): string => {
    const fileExist = doesFileExist(path.join(process.cwd(), pathToCharacterIcon, id + imageFormat))
    
    if (fileExist == false) {
        throw new Error(`Icon ${id + imageFormat} not found`)
    }

    const route = path.join(...LOCAL_PATH_TO_CHARACTER_ICONS, id + imageFormat);
    return route;
}

/**
 * @returns array of FileNames, they are in format `ID.json`
 */
export const getAllCharactersFileNames = (): string[] => {
    const fileNames: string[] = getAllFileNamesInDirectory(localPathToCharacters);
    return fileNames;
}

/**
 * @returns Id of today character
 */
export const getTodayCharacterId = (date: Date): string => {
    const seed: number = date.getMonth() * date.getDate() + date.getDate()

    // Character data
    const characters: string[] = getAllCharactersFileNames();
    const amountOfCharacters = characters.length;

    const indexOfCharacterArray = seed % amountOfCharacters;
    // characters array has filenames in ID.json format so we need ignore .json
    const id = characters[indexOfCharacterArray].split('.')[0];

    return id;
}

export const getAllCharactersHeaderMap = (): CharacterHeaderMap => {
    const headerMap: CharacterHeaderMap = new Map<string, CharacterHeader[]>();
    const charactersHeaders = getAllCharacterHeaders();

    charactersHeaders.forEach(header => {
        const firstLetterOfName = header.Name[0]
        const characterHeaderArray = headerMap.get(firstLetterOfName)

        // If there is no array yet, then create it and populate with first header.
        if (typeof characterHeaderArray === 'undefined') {
            headerMap.set(firstLetterOfName, [header])
        }
        else {
            characterHeaderArray.push(header);
        }
    })

    return headerMap;
}

export const getCharacterHeaderById = (id: string): CharacterHeader => {
    return getCharacterById(id).getCharacterHeader();
}

export const compareTwoCharacters = (originalId: string, comparedId: string): CharacterComparisonResult => {
    // Get characters data
    const oc: Character = getCharacterById(originalId);
    const cc: Character = getCharacterById(comparedId);

    // Compare
    const differencesArray: number[] = [];
    const data1 = new Map<string, unknown>(Object.entries(oc));
    const data2 = new Map<string, unknown>(Object.entries(cc));
    const keys = Array.from(data1.keys())

    keys.forEach((key) => {
        if (key != 'Id' && key !== 'Name') {
            differencesArray.push(compareTwoCharactersComparer(data1.get(key as string), data2.get(key as string)))
        }
    })

    const indexOfNotCorrectAnswer = differencesArray.findIndex((item) => {return item < 1});

    const outputObj: CharacterComparisonResult = {
        character: cc,
        differences: differencesArray,
        isCorrect: indexOfNotCorrectAnswer === -1 ? true : false
    }

    return outputObj;
}

const compareTwoCharactersComparer = (t1: unknown, t2: unknown): number => {
    //  1 means correct
    //  0 means partial
    // -1 means wrong

    if (typeof t1 !== 'object' && typeof t2 !== 'object') {
        return t1 === t2 ? 1 : -1;
    }

    let te1;
    let te2;
    if (typeof t1 === 'object' && typeof t2 !== 'object' || typeof t1 !== 'object' && typeof t2 === 'object') {
        if (typeof t1 === 'object') {
            te1 = t1 as unknown[]
            te2 = [t2]
        }
        else {
            te1 = [t1]
            te2 = t2 as unknown[]
        }
    }
    else {
        te1 = t1 as unknown[];
        te2 = t2 as unknown[];
    }

    const t1s = [...te1!.sort()];
    const t2s = [...te2!.sort()];
    let sameCounter = 0;

    t1s.forEach((item1) => {
        t2s.forEach((item2) => {
            if (item1 === item2) sameCounter++;
        })
    })

    if (sameCounter === 0) return -1;
    if (te1.length === te2.length && sameCounter === te1.length) return 1;
    return 0;
}