// EXPERIMENTAL
"use client"
import { OperatorHeader, OperatorHeaderMap } from "@/resources/character/lib/types"
import styles from './searchBar.module.scss';
import { ChangeEvent } from "react";
import SearchBarResult from "@/resources/character/components/searchBar/searchBarResult";

interface ISearchBar {
    operatorHeadersMap: OperatorHeaderMap,
    guessWon: boolean,
    onInputChange: (event: ChangeEvent<HTMLInputElement>) => void,
    inputTextValue: string
    onFormSubmit: (event: React.MouseEvent<HTMLElement>) => void,
    currentGuessedOperatorNames: string[],
    onResultClick: (value: string) => void
}

const SearchBar: React.FC<ISearchBar> = (props) => {
    const { 
        operatorHeadersMap, guessWon, 
        onInputChange, inputTextValue, 
        onFormSubmit, currentGuessedOperatorNames,
        onResultClick 
    } = props;

    const filterCharactersHeaders = (chm: OperatorHeaderMap): OperatorHeader[] => {
        if (inputTextValue.length > 0) {

            const values = chm.get(inputTextValue[0].toUpperCase())
            let filteredValues = values?.filter(item => {
                return item.Name.toUpperCase().startsWith(inputTextValue.toUpperCase());
            })

            if (typeof filteredValues === 'undefined') {
                filteredValues = [];
            }

            const guessedCharactersNames = currentGuessedOperatorNames
            filteredValues = filteredValues.filter((item) => {
                return guessedCharactersNames.includes(item.Name)
                    ? false
                    : true;
            })

            return filteredValues!;
        }
        else {
            return []
        }
    }


    const filteredCharacterHeaders = filterCharactersHeaders(operatorHeadersMap);

    return (
        <div className={styles.searchBar}>
            <div className={styles.main}>
                <div className={styles.topPart}>
                    <input 
                        type='text'
                        disabled={guessWon}
                        className={styles.input}
                        onChange={onInputChange}
                        value={inputTextValue}
                    />

                    <button 
                        className={styles.button}
                        onClick={onFormSubmit}
                        disabled={guessWon}
                    >
                        Guess
                    </button>
                </div>
                <div className={styles.searchResult}>
                    <div className={styles.abs}>
                    {
                        filteredCharacterHeaders.length > 0 &&
                        filteredCharacterHeaders.map((item, key) => {
                            return <SearchBarResult 
                                key={key} 
                                characterHeader={item}
                                onClick={onResultClick}
                            />
                        })
                    }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SearchBar;