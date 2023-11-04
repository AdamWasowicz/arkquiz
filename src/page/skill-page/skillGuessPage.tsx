"use client"
import { OperatorHeaderMap } from "@/src/resources/operator/lib/types";
import { submitSkillGuess } from "@/src/lib/serverFunctions";
import styles from './skillGuessPage.module.scss';
import SearchBar from "@/src/components/search-bar/searchBar";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { ChangeEvent, useState } from "react";
import { addGuess, setGameWon, setGuesses, setIsWorking } from "@/src/redux/features/skill-slice";
import GuessResult from "@/src/resources/skill/components/guess-result/guessResult";
import MainPanel from "@/src/resources/skill/components/main-panel/mainPanel";
import { SkillComparisonResult } from "@/src/resources/skill/lib/types";
import useLocalstorage from './skillGuessPage.utils';
import { useEffect } from "react";

interface ISkillGuessPage {
    operatorHeaderMap: OperatorHeaderMap
}

const SkillGuessPage: React.FC<ISkillGuessPage> = (props) => {
    const { operatorHeaderMap } = props;

    const guesses: SkillComparisonResult[] = useAppSelector(state => state.skill.currentGuesses);
    const guessWon: boolean = useAppSelector(state => state.skill.gameWon);
    const isWorking: boolean = useAppSelector(state => state.skill.isWorking);

    const dispatch = useAppDispatch();
    const localstorageHook = useLocalstorage();

    const [textInputValue, setTextInputValue] = useState<string>('');


    const onFormSubmit = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        // isWorking
        if (isWorking === true) { return; }
        else { dispatch(setIsWorking(true)); }
        
        const selectedOperatorHeader = operatorHeaderMap
            .get(textInputValue.toUpperCase()[0])
                ?.find(item => item.Name.toUpperCase() === textInputValue.toUpperCase())
        
        if (typeof selectedOperatorHeader !== 'undefined') {
            localstorageHook.saveSkillDateToStorage();
            const res = await submitSkillGuess(selectedOperatorHeader.Id)
            setTextInputValue('')

            localstorageHook.saveCurrentGuessesToStorage([res ,...guesses]);

            dispatch(setIsWorking(false));
            dispatch(addGuess(res));
            
            if (res.IsCorrect) {
                localstorageHook.saveStatusToStorage(res.IsCorrect)
                dispatch(setGameWon(res.IsCorrect));
            }
        }
    }

    const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setTextInputValue(event.target.value);
    }

    const onResultClick = (value: string) => {
        setTextInputValue(value);
    }

    // Load data from localstorage
    useEffect(() => {
        // Check if data is outdated
        // if so then delete current stored data
        if (localstorageHook.isDataOutdated()) {
            localstorageHook.removeCurrentGuessesFromStorage();
            localstorageHook.removeStatusFromStorage();
            localstorageHook.removeSkillDateFromStorage();
            return;
        }

        // Guesses
        const data = localstorageHook.getCurrentGuessesFromStorage();
        dispatch(setGuesses(data));

        //Status
        const status = localstorageHook.getStatusFromStorage();
        dispatch(setGameWon(status))
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className={styles.page}>
            <MainPanel/>

            {
                guessWon == false &&
                <div className={styles.search}>
                    <SearchBar
                        operatorHeadersMap={operatorHeaderMap}
                        currentGuessedOperatorNames={guesses.map(item => {
                            return (item.OperatorHeader.Name)
                        })}
                        isFormDisabled={guessWon}
                        inputTextValue={textInputValue}
                        onFormSubmit={onFormSubmit}
                        onInputChange={onInputChange}
                        onResultClick={onResultClick}
                    />
                </div>
            }

            <div className={styles.result}>
                {
                    guesses.length > 0 &&
                    <GuessResult guesses={guesses}/>
                }
            </div>
        </div>
    )
}

export default SkillGuessPage;