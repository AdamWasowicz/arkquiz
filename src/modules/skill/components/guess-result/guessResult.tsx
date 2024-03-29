import { routeToOperatorIcon } from "@/src/lib/client-to-server-functions";
import { SkillComparisonResult } from "../../lib/types";
import styles from './guessResult.module.scss';
import Image from "next/image";

// GuessResult
interface IGuessResult {
    guesses: SkillComparisonResult[]
    className?: string
}

/** Container component, contains rows with guesses */
const GuessResult: React.FC<IGuessResult> = (props) => {
    return (
        <div className={styles.table}>
                { props.guesses.map((item, key) => <GuessResultRow key={key} guess={item}/>) }
        </div>
    )
}
export default GuessResult;


// GuessResultRow
interface IGuessResultRow {
    guess: SkillComparisonResult
}

const GuessResultRow: React.FC<IGuessResultRow> = (props) => {
    return (
        <div className={props.guess.IsCorrect ? styles.guessRight : styles.guessWrong}>
            <Image
                className={styles.image}
                src={routeToOperatorIcon(props.guess.OperatorHeader.Id)}
                alt={props.guess.OperatorHeader.Name}
                width={100}
                height={100}
            />

            <p className={styles.rowText}>{props.guess.OperatorHeader.Name}</p>
        </div>
    )
}