"use client"
import { OperatorHeaderMap } from "@/src/resources/operator/lib/types";
import SearchBar from "@/src/components/search-bar/searchBar";
import OperatorGuessResult from "@/src/resources/operator/components/guess-result/guessResult";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import styles from './operatorGuessPage.module.scss';
import MainPanel from "@/src/resources/operator/components/main-panel/mainPanel";
import { ChangeEvent, useEffect, useState } from "react";
import { submitOperatorGuess } from "@/src/lib/serverFunctions";
import { addGuess, setGameWon, setGuesses, setIsWorking } from "@/src/redux/features/operator-slice";
import useLocalStorage from "./operatorGuessPage.utils";

interface IOperatorGuessPageProps {
    operatorHeaderMap: OperatorHeaderMap
}

const OperatorGuessPage: React.FC<IOperatorGuessPageProps> = (props) => {
    const { operatorHeaderMap } = props;

    const guesses = useAppSelector(state => state.operator.currentGuesses);
    const isWorking = useAppSelector(state => state.operator.isWorking);
    const operatorGuessWon = useAppSelector(state => state.operator.gameWon);

    const dispatch = useAppDispatch();
    const utils_ls = useLocalStorage();
    
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
            utils_ls.saveOperatorDateToStorage();
            const res = await submitOperatorGuess(selectedOperatorHeader.Id)
            setTextInputValue('')

            await utils_ls.saveCurrentGuessesToStorage([res ,...guesses]);

            dispatch(setIsWorking(false));
            dispatch(addGuess(res));
            
            if (res.isCorrect) {
                await utils_ls.saveStatusToStorage(res.isCorrect)
                dispatch(setGameWon(res.isCorrect));
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
        if (utils_ls.isDataOutdated()) {
            utils_ls.removeCurrentGuessesFromStorage();
            utils_ls.removeStatusFromStorage();
            utils_ls.removeOeratorDateFromStorage();
            return;
        }

        // Guesses
        const data = utils_ls.getCurrentGuessesFromStorage();
        dispatch(setGuesses(data));

        //Status
        const status = utils_ls.getStatusFromStorage();
        dispatch(setGameWon(status))
    }, [])


    return (
        <div className={styles.page}>
            <MainPanel className={styles.mainPanel}/>

            {
                operatorGuessWon == false &&
                <div className={styles.search}>
                    <SearchBar
                        operatorHeadersMap={operatorHeaderMap}
                        currentGuessedOperatorNames={guesses.map(item => {
                            return (item.operator.Name)
                        })}
                        isFormDisabled={operatorGuessWon}
                        inputTextValue={textInputValue}
                        onFormSubmit={onFormSubmit}
                        onInputChange={onInputChange}
                        onResultClick={onResultClick}
                    />
                </div>
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

export default OperatorGuessPage;