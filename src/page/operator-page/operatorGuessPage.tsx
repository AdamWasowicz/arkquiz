"use client"
import { OperatorHeaderMap } from "@/src/resources/operator/lib/types";
import SearchBar from "@/src/components/search-bar/searchBar";
import OperatorGuessResult from "@/src/resources/operator/components/guess-result/guessResult";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import styles from './operatorGuessPage.module.scss';
import MainPanel from "@/src/resources/operator/components/main-panel/mainPanel";
import { ChangeEvent, useEffect, useState } from "react";
import { submitOperatorGuess } from "@/src/lib/serverFunctions";
import { addGuess, setGameWon, setGuesses } from "@/src/redux/features/operator-slice";
import useUtils from "./operatorGuessPage.utils";

interface IOperatorGuessPageProps {
    operatorHeaderMap: OperatorHeaderMap
}

const OperatorGuessPage: React.FC<IOperatorGuessPageProps> = (props) => {
    const { operatorHeaderMap } = props;

    const guesses = useAppSelector(state => state.operator.currentGuesses)
    const operatorGuessWon = useAppSelector(state => state.operator.gameWon);
    const dispatch = useAppDispatch();
    const utils = useUtils();
    
    const [textInputValue, setTextInputValue] = useState<string>('');

    const onFormSubmit = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        
        const selectedOperatorHeader = operatorHeaderMap.get(textInputValue.toUpperCase()[0])?.find(item => item.Name.toUpperCase() === textInputValue.toUpperCase())
        
        if (typeof selectedOperatorHeader !== 'undefined') {
            utils.saveOperatorDateToStorage();
            const res = await submitOperatorGuess(selectedOperatorHeader.Id)
            setTextInputValue('')

            await utils.saveCurrentGuessesToStorage([res ,...guesses]);
            dispatch(addGuess(res));
            
            if (res.isCorrect) {
                await utils.saveStatusToStorage(res.isCorrect)
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
        if (utils.isDataOutdated()) {
            utils.removeCurrentGuessesFromStorage();
            utils.removeStatusFromStorage();
            utils.removeOeratorDateFromStorage();
            return;
        }

        // Guesses
        const data = utils.getCurrentGuessesFromStorage();
        dispatch(setGuesses(data));

        //Status
        const status = utils.getStatusFromStorage();
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
                        guessWon={operatorGuessWon}
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