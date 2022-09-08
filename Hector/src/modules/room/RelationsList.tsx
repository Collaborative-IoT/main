import React, { useContext } from "react";
import { MainContext } from "../../api_context/api_based";
import { ModeContext, Relation } from "../../mode_context/room_mode";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";
import { Button } from "../../ui/Button";
import { CenterLoader } from "../../ui/CenterLoader";
import { InfoText } from "../../ui/InfoText";
import { SingleUser } from "../../ui/UserAvatar";
import { v4 as uuidv4, v4 } from "uuid";

interface RelationsListProps {}

export const RelationsListPage: React.FC<{}> = () => {
    const { selected_iot_server, iot_server_passive_data, client } =
        useContext(MainContext);
    const { set_current_relation_for_modification, set_relation_list_open } =
        useContext(ModeContext);
    if (selected_iot_server == null) {
        return <InfoText className={`mt-2`}>No Server Selected</InfoText>;
    }

    let data = [];
    if (iot_server_passive_data.has(selected_iot_server)) {
        let passive_data = JSON.parse(
            JSON.parse(iot_server_passive_data.get(selected_iot_server))
        );
        let relation_data = passive_data["external_controller_snapshot"];
        if (relation_data != null) {
            //normal list of relations
            let relation_data_array = JSON.parse(relation_data)["relations"];
            data = relation_data_array;
        }
    }

    return (
        <>
            {data.map((relation: Relation) => (
                <>
                    <div
                        className={`flex border-b border-solid w-full py-4 px-2 items-center`}
                        key={v4()}
                    >
                        <div>
                            <InfoText>{`Device Name->${relation.device_name}`}</InfoText>
                            <InfoText>{`Action->${relation.action}`}</InfoText>
                            <InfoText>{`Conditions->${relation.conditions.length}`}</InfoText>
                            <Button
                                loading={false}
                                onClick={() => {
                                    set_current_relation_for_modification(
                                        relation
                                    );
                                }}
                                size={`small`}
                            >
                                View Conditions List
                            </Button>
                            <Button
                                onClick={() => {
                                    client!!.send("relation_modification", {
                                        modification_op: "remove_relation",
                                        data: JSON.stringify(relation),
                                        server_id: selected_iot_server,
                                    });
                                    set_relation_list_open(false);
                                }}
                                className=" mt-2"
                                size="small"
                            >
                                Delete Relation Completely
                            </Button>
                        </div>
                    </div>
                </>
            ))}
        </>
    );
};

export const RelationsList: React.FC<RelationsListProps> = ({}) => {
    const { t } = useTypeSafeTranslation();
    return (
        <>
            <div className={`flex mt-4 flex-col text-primary-100 pt-3`}>
                <h1 className={`text-xl`}>Relations For Server</h1>
                <div className="flex flex-col">{<RelationsListPage />}</div>
            </div>
        </>
    );
};
