import { Operator, OperatorHeader, OperatorHeaderMap, RaceDescription, OperatorComparisonResultV2, OperatorComparisonDiffrenceV2 } from "./types";
import path from 'path';
import { getAllFileNamesInDirectory, readJson, doesFileExist } from "@/src/lib/filesystem";
import { 
    EXTERNAL_PATH_TO_OPERATOR_ICONS,
    LOCAL_PATH_TO_OPERATOR_ICONS, 
    PATH_TO_OPERATOR_DATA,
    PATH_TO_OPERATOR_RACE, 
} from "@/src/lib/paths";
import { Talent } from "../../talent/lib/types";
import { getOperatorTalentsData } from "../../talent/lib/utils";
import { getOperatorSkillsData } from "../../skill/lib/utils";


// Const
const imageFormat = '.webp';
const operatorDataFormat = '.json';
const localPathToOperators = path.join(process.cwd(), ...PATH_TO_OPERATOR_DATA);
const localPathToRaces = path.join(process.cwd(), ...PATH_TO_OPERATOR_RACE)
const pathToOperatorIcon = path.join(...EXTERNAL_PATH_TO_OPERATOR_ICONS)

/**
 * @param id is unique string for each operator (ex. R001 is Amiya).
 * @returns object of type {@link Operator} or undefined
 */
export const getOperatorById = (id: string): Operator | undefined => {
    const fileExist = doesFileExist(path.join(localPathToOperators, id + operatorDataFormat))
    if (fileExist == false) {
        //console.log(`File ${id + operatorDataFormat} not found`)
        return undefined
    }

    const json = readJson(path.join(localPathToOperators, id + operatorDataFormat)) as Operator | undefined;
    return json;
}

export const getAllOperators = (): Operator[] => {
    const fileNames: string[] = getAllFileNamesInDirectory(localPathToOperators); 

    const operators: Operator[] = [];
    fileNames.forEach(file => {
        const json = readJson(path.join(localPathToOperators, file)) as Operator | undefined;
        if (json !== undefined) {
            operators.push(json);
        }
    })

    return operators;
}

/**
 * @returns array of OperatorHeader for all operators.
 */
export const getAllOperatorHeaders = (): OperatorHeader[] => {
    const fileNames: string[] = getAllFileNamesInDirectory(localPathToOperators);

    const operatorHeaders: OperatorHeader[] = [];
    fileNames.forEach(file => {
        const json = readJson(path.join(localPathToOperators, file)) as Operator | undefined;
        if (json !== undefined) {
            const ch: OperatorHeader = {
                Id: json.Id,
                Name: json.Name,
            }
    
            operatorHeaders.push(ch);
        }
    })

    return operatorHeaders;
}

/**
 * @param id is unique string for each operator (ex. R001 is Amiya).
 * @returns route for operator icon art, you may need to add '/' for nextjs's Image component or undefined
 */
export const getAbsolutePathToIcon = (id: string): string | undefined => {
    const fileExist = doesFileExist(path.join(process.cwd(), pathToOperatorIcon, id + imageFormat))
    
    if (fileExist == false) {
        //console.log(`Icon ${id + imageFormat} not found`)
        return undefined;
    }

    const route = path.join(process.cwd(),'/public/',...LOCAL_PATH_TO_OPERATOR_ICONS, id + imageFormat);
    return route;
}

export const routeToOperatorIcon = (id: string) => {
    return `${path.join(...LOCAL_PATH_TO_OPERATOR_ICONS)}/${id}.${imageFormat}`
}

/**
 * @returns array of FileNames, they are in format `ID.json`
 */
export const getAllOperatorFileNames = (): string[] => {
    const fileNames: string[] = getAllFileNamesInDirectory(localPathToOperators);
    return fileNames;
}

/**
 * @returns Id of selected day operator
 */
export const getDayOperatorId = (date: Date): string => {
    const seed: number = date.getMonth() * date.getDate() + date.getDate()

    // Operator data
    const operator: string[] = getAllOperatorFileNames();
    const amountOfOperators = operator.length;

    const indexOfOperatorArray = seed % amountOfOperators;
    // Operator array has filenames in ID.json format so we need ignore .json
    const id = operator[indexOfOperatorArray].split('.')[0];

    return id;
}

/** Creates Operator header map */
export const getOperatorHeaderMap = (): OperatorHeaderMap => {
    const headerMap: OperatorHeaderMap = new Map<string, OperatorHeader[]>();
    const operatorHeaders = getAllOperatorHeaders();

    operatorHeaders.forEach(header => {
        const firstLetterOfName = header.Name[0]
        const operatorHeaderArray = headerMap.get(firstLetterOfName)

        // If there is no array yet, then create it and populate with first header.
        if (typeof operatorHeaderArray === 'undefined') {
            headerMap.set(firstLetterOfName, [header])
        }
        else {
            operatorHeaderArray.push(header);
        }
    })

    return headerMap;
}

/**
 * Makes compariosn of two operators data
 * @param originalId Id of first operator
 * @param comparedId Id of second operator
 * @returns comparison result of type {@link OperatorComparisonResultV2}
 */
export const compareTwoOperatorsV2 = (originalId: string, comparedId: string): OperatorComparisonResultV2 => {
    // Get operator data
    const oc: Operator | undefined = getOperatorById(originalId);
    const cc: Operator | undefined = getOperatorById(comparedId);

    if (oc == undefined || cc == undefined) {
        throw new Error('One of given operators does not exist')
    }

    // Compare
    const diffrences: OperatorComparisonDiffrenceV2 | object = {};
    const data1 = new Map<string, unknown>(Object.entries(oc));
    const data2 = new Map<string, unknown>(Object.entries(cc));
    const keys = Array.from(data1.keys())
    let isCorrect: boolean = true;

    keys.forEach((key) => {
        if (key != 'Id' && key !== 'Name') {
            const result = __compareTwoOperatorsComparer(data1.get(key as string), data2.get(key as string))
            if (result != 1) { isCorrect = false; }
            Object.defineProperty(diffrences, key, {value: result, writable: true, enumerable: true});
        }
    })

    const output: OperatorComparisonResultV2 = {
        diffrences: diffrences as OperatorComparisonDiffrenceV2,
        operator: cc,
        isCorrect: isCorrect
    }
    
    return output;
}

/**
 * 1 means correct,
 * 0 means partial,
 * -1 means wrong
 * @param t1 can be anything
 * @param t2 can be anything
 * @returns number representing comparison result
 */
export const __compareTwoOperatorsComparer = (t1: unknown, t2: unknown): number => {
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

// All info was taken from arknights fandom wiki
// href: https://arknights.fandom.com/wiki/Arknights_Wiki
/**
 * Returns Operator race description object
 * @param raceName name of race
 * @returns object containing race data of type {@link RaceDescription} or undefied
 */
export const getRaceDescription = (raceName: string): RaceDescription | undefined => {
    const fileExist = doesFileExist(path.join(localPathToRaces, raceName + operatorDataFormat))
    if (fileExist == false) {
        //throw new Error(`File ${raceName + operatorDataFormat} not found`)
        return undefined;
    }

    const json = readJson(path.join(localPathToRaces, raceName + operatorDataFormat)) as RaceDescription | undefined;
    return json;
}

export const getOperatorHintTalent = (operator: OperatorHeader): string => {
    const talentsData = getOperatorTalentsData(operator.Id);
    if (talentsData === undefined) {
        return 'No talent'
    }
    
    const timestamp = new Date();
    const talents: Talent[] = talentsData.Talents

    return talents[ timestamp.getDate() % talents.length ].Name
}

export const getOperatorHintSkill = (operator: OperatorHeader): string => {
    const skillData = getOperatorSkillsData(operator.Id);
    if (skillData === undefined) {
        return 'No skill'
    }

    const timestamp = new Date();
    const skills = skillData.Skills;

    return skills[ timestamp.getDate() % skills.length ].Name
}