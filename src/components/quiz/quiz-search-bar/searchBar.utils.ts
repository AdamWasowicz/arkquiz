import { OperatorHeader, OperatorHeaderMap } from "@/src/modules/operator/lib/types";

const useUtils = () => {
    const filterOperatorHeaders = (chm: OperatorHeaderMap, inputTextValue: string, currentGuessedOperatorNames: string[]): OperatorHeader[] => {

        if (inputTextValue.length > 0) {

            const values = chm.get(inputTextValue[0].toUpperCase())
            let filteredValues = values?.filter(item => {
                return item.Name.toUpperCase().startsWith(inputTextValue.toUpperCase());
            })

            if (typeof filteredValues === 'undefined') {
                filteredValues = [];
            }

            const guessedOperatorNames = currentGuessedOperatorNames
            filteredValues = filteredValues.filter((item) => {
                return guessedOperatorNames.includes(item.Name)
                    ? false
                    : true;
            })

            return filteredValues!;
        }
        else {
            return []
        }
    }

    return {
        filterOperatorHeaders
    }
}

export default useUtils;