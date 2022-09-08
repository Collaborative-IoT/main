import React, { useContext } from "react";
import { MainContext } from "../../api_context/api_based";
import { ModeContext, Relation } from "../../mode_context/room_mode";
import { InfoText } from "../../ui/InfoText";
import { SingleUser } from "../../ui/UserAvatar";
import { v4 as uuidv4, v4 } from "uuid";

interface ConditionsListProps {}

export const ConditionsListPage: React.FC<{}> = () => {
    const { current_relation_for_modification } = useContext(ModeContext);
    if (current_relation_for_modification == null) {
        return <InfoText className={`mt-2`}>No Selected Relation</InfoText>;
    }
    let data = current_relation_for_modification.conditions;
    console.log(data);
    return (
        <>
            <p>
                Note: All below must be true for the relation to trigger the
                action
            </p>
            {data.map((condition: any) => (
                <>
                    <div
                        className={`flex border-b border-solid w-full py-4 px-2 items-center`}
                        key={v4()}
                    >
                        <div>
                            {Array.from(Object.keys(condition)).map(
                                (key: any) => {
                                    return (
                                        <InfoText>{`"${key}"->"${condition[key]}"`}</InfoText>
                                    );
                                }
                            )}
                        </div>
                    </div>
                </>
            ))}
        </>
    );
};

export const ConditionsList: React.FC<ConditionsListProps> = ({}) => {
    return (
        <>
            <div className={`flex mt-4 flex-col text-primary-100 pt-3`}>
                <h1 className={`text-xl`}>Relations For Server</h1>
                <div className="flex flex-col">{<ConditionsListPage />}</div>
            </div>
        </>
    );
};
