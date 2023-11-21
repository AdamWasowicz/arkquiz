"use client"
import { OperatorHeaderMap } from "@/src/modules/operator/lib/types";
import SearchBar from "@/src/components/search-bar/searchBar";
import OperatorGuessResult from "@/src/modules/operator/components/guess-result/guessResult";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import styles from './operatorQuizPage.module.scss';
import MainPanel from "@/src/modules/operator/components/main-panel/mainPanel";
import { ChangeEvent, useEffect, useState } from "react";
import { submitOperatorGuess } from "@/src/lib/serverFunctions";
import { addGuess, setErrorMsg, setGameWon, setGuesses, setIsWorking } from "@/src/redux/features/operator-slice";
import useLocalStorage from "./operatorQuizPage.utils";
import NextQuizButton from "@/src/components/next-quiz-button/nextQuizButton";
import { useRouter } from 'next/navigation'

interface IOperatorQuizPage {
    operatorHeaderMap: OperatorHeaderMap
}

const OperatorQuizPage: React.FC<IOperatorQuizPage> = (props) => {
    const { operatorHeaderMap } = props;
    const guesses = useAppSelector(state => state.operator.currentGuesses);
    const isWorking = useAppSelector(state => state.operator.isWorking);
    const quizWon = useAppSelector(state => state.operator.gameWon);
    const dispatch = useAppDispatch();
    const localstorageHook = useLocalStorage();
    const [textInputValue, setTextInputValue] = useState<string>('');
    const router = useRouter();


    const onFormSubmit = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        // isWorking
        if (isWorking === true) { 
            return; 
        }
        else { 
            dispatch(setErrorMsg(""));
            dispatch(setIsWorking(true)); 
        }
        
        const selectedOperatorHeader = operatorHeaderMap
            .get(textInputValue.toUpperCase()[0])
                ?.find(item => item.Name.toUpperCase() === textInputValue.toUpperCase())
        
        if (typeof selectedOperatorHeader !== 'undefined') {
            localstorageHook.saveOperatorDateToStorage();
            const res = await submitOperatorGuess(selectedOperatorHeader.Id)

            if (res === undefined) {
                dispatch(setErrorMsg(`Error occured while submiting guess for Operator with Id: ${selectedOperatorHeader.Id}`))
                dispatch(setIsWorking(false));
                return;
            }

            setTextInputValue("")
            localstorageHook.saveCurrentGuessesToStorage([res ,...guesses]);
            dispatch(setIsWorking(false));
            dispatch(addGuess(res));
            
            // Quiz is won
            if (res.isCorrect) {
                localstorageHook.saveStatusToStorage(res.isCorrect)
                dispatch(setGameWon(res.isCorrect));
            }
        }
    }

    const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setTextInputValue(event.target.value);
    }

    const onSearchBarItemClick = (value: string) => {
        setTextInputValue(value);
    }

    const toNextQuiz = () => {
        router.push('/skill');
    }

    // Load data from localstorage
    useEffect(() => {
        // Check if data is outdated
        // if so then delete current stored data
        if (localstorageHook.isDataOutdated()) {
            localstorageHook.removeCurrentGuessesFromStorage();
            localstorageHook.removeStatusFromStorage();
            localstorageHook.removeOeratorDateFromStorage();
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
            <MainPanel className={styles.mainPanel}/>

            {
                quizWon == false &&
                <div className={styles.search}>
                    <SearchBar
                        operatorHeadersMap={operatorHeaderMap}
                        currentGuessedOperatorNames={guesses.map(item => {
                            return (item.operator.Name)
                        })}
                        isFormDisabled={quizWon}
                        inputTextValue={textInputValue}
                        onFormSubmit={onFormSubmit}
                        onInputChange={onInputChange}
                        onResultClick={onSearchBarItemClick}
                    />
                </div>
            }

            {
                quizWon &&
                <NextQuizButton onClick={toNextQuiz} id={'nextQuizButton'}/>
            }

            <div className={styles.results}>
                {
                    guesses.length > 0 &&
                    <OperatorGuessResult guesses={guesses}/>
                }
            </div>
        </div>
    )
}

export default OperatorQuizPage;