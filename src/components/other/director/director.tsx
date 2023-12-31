import { Fragment } from "react"
import { doHealthCheck as operatorHC } from "@/src/modules/operator/lib/healthcheck";
import { doHealthCheck as skillHC } from "@/src/modules/skill/lib/healthcheck";

interface IDirector {
    children: React.ReactNode
}
const Director: React.FC<IDirector> = (props) => {
    // Operator Healthcheck
    if (process.env.NODE_ENV === 'development') {
        const hc = operatorHC();
        if (hc.ErrorsIcon.length > 0 ) {
            console.log('There is problem with Operator - Icon');
            console.log(hc.ErrorsIcon);
        }
        if (hc.ErrorsRace.length > 0 ) {
            console.log('There is problem with Operator - Race');
            console.log(hc.ErrorsRace);
        }
        if (hc.ErrorsOperators.length > 0 ) {
            console.log('There is problem with Operator - Data');
            console.log(hc.ErrorsOperators);
        }
    }

    // Skill Healthchecks
    if (process.env.NODE_ENV === 'development') {
        const sh_result = skillHC();
        if (sh_result.ErrorsSkill.length > 0) {
            console.log('Skill data error ');
            console.log(sh_result.ErrorsSkill)
        }

        if (sh_result.ErrorsIcon.length > 0) {
            console.log('Skill icon error ');
            console.log(sh_result.ErrorsIcon);
        }
    }
    
    
    return (
        <Fragment>
            {props.children}
        </Fragment>
    )
}

export default Director;