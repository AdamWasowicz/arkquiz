import { NextRequest, NextResponse } from "next/server";
import { 
    compareTwoOperatorsV2, getOperatorById, getOperatorHintSkill, 
    getOperatorHintTalent, getRaceDescription, getDayOperatorId 
} from "./server-utils";
import { getUndiscoveredOperatorTrait } from "./client-utils";
import { Operator, OperatorComparisonDiffrenceV2 } from "./types";


/**
 * @param req is of type {@link NextRequest}
 * @returns NextResponse of type {@link OperatorComparisonResultV2}
 */
export const POST_Operator_Guess = async (req: NextRequest): Promise<NextResponse> => {
    const body = await req.json();
    const guess = body.id;
    const timestamp = body.timestamp;
    const todayId = getDayOperatorId(new Date(timestamp));

    if (getOperatorById(guess) == undefined) {
        return new NextResponse(null, { status: 400 });
    }


    try {
        const comparisonResult = compareTwoOperatorsV2(todayId, guess);
        const response = new NextResponse(JSON.stringify(comparisonResult), 
            {
                status: 200,
                headers: {
                    'content-type': 'application/json',
                },
            }
        );
        return response;
    }
    catch (exception) {
        return new NextResponse(null, { status: 500 });
    }
}


/**
 * @returns NextResponse of type {@link String}
 */
export const GET_Operator_Race = async (_: Request, { params }: { params: { race: string } }): Promise<NextResponse> => {
    const race = params.race

    const raceData = getRaceDescription(race);
    if (raceData == undefined) {
        return new NextResponse(null, {status: 400})
    }

    const response = new NextResponse(JSON.stringify(raceData), 
        {
            status: 200,
            headers: {
                'content-type': 'application/json',
            },
        }
    );
    return response;
}

export const GET_Operator_Hints = async (req: NextRequest): Promise<NextResponse> => {
    const timestamp = new Date(req.nextUrl.searchParams.get("timestamp")!)
    const currentState = JSON.parse(req.nextUrl.searchParams.get("currentState")!) as OperatorComparisonDiffrenceV2;

    const nowId: string = getDayOperatorId(timestamp);
    const operator: Operator = getOperatorById(nowId)!;

    const trait = getUndiscoveredOperatorTrait(operator, currentState);
    const talent = getOperatorHintTalent(operator);
    const skill = getOperatorHintSkill(operator);

    const output = {
        trait,
        talent,
        skill
    }

    const response = new NextResponse(JSON.stringify(output), 
        {
            status: 200,
            headers: {
                'content-type': 'application/json',
            },
        }
    );
    return response;
}